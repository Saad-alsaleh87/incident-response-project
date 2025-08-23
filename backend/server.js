require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

const app = express();
const port = process.env.PORT || 8080;

// GCP Logging setup
const loggingWinston = new LoggingWinston({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    // Only add GCP logging in production
    ...(process.env.NODE_ENV === 'production' ? [loggingWinston] : [])
  ]
});

// Database connection pool - updated for Cloud SQL PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST?.startsWith('/cloudsql/') ? '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME : process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'securepass123',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log database configuration (without password)
logger.info('Database configuration', {
  host: process.env.DB_HOST?.startsWith('/cloudsql/') ? 'Cloud SQL Unix Socket' : process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  instanceConnection: process.env.INSTANCE_CONNECTION_NAME
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logging and metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    if (res.statusCode >= 400) {
      logger.error('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
});

// Global variables for failure injection
let memoryLeak = [];
let cpuStressActive = false;
let memoryLeakInterval = null;

// === HEALTH CHECK ENDPOINTS ===
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

app.get('/api/health/detailed', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW()');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: 'healthy',
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        uptime: `${Math.round(process.uptime())}s`
      },
      database: {
        connected: true,
        serverTime: dbResult.rows[0].now
      }
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      services: {
        api: 'healthy',
        database: 'unhealthy'
      },
      error: error.message
    });
  }
});

// === BUSINESS LOGIC ENDPOINTS ===
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    logger.info('Products fetched', { count: result.rows.length });
    res.json(result.rows);
  } catch (error) {
    logger.error('Failed to fetch products', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to fetch product', { error: error.message, productId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { customer_email, items } = req.body;
    
    if (!customer_email || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer email and items are required' });
    }
    
    // Calculate total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    
    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (customer_email, total, status) VALUES ($1, $2, $3) RETURNING *',
      [customer_email, total, 'pending']
    );
    
    const order = orderResult.rows[0];
    
    // Add order items
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );
    }
    
    await client.query('COMMIT');
    
    logger.info('Order created successfully', { 
      orderId: order.id, 
      customerEmail: customer_email,
      total: total,
      itemCount: items.length
    });
    
    res.status(201).json({
      orderId: order.id,
      status: 'created',
      total: total,
      message: 'Order created successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Order creation failed', { 
      error: error.message, 
      customerEmail: req.body.customer_email 
    });
    res.status(500).json({ error: 'Order creation failed' });
  } finally {
    client.release();
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Failed to fetch orders', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// === METRICS ENDPOINT ===
app.get('/api/metrics', async (req, res) => {
  try {
    // Get basic metrics
    const ordersToday = await pool.query(
      "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );
    
    const totalProducts = await pool.query('SELECT COUNT(*) as count FROM products');
    
    const recentOrders = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE created_at > NOW() - INTERVAL '1 hour'"
    );
    
    res.json({
      timestamp: new Date().toISOString(),
      orders: {
        today: parseInt(ordersToday.rows[0].count),
        lastHour: parseInt(recentOrders.rows[0].count),
        revenueToday: parseFloat(ordersToday.rows[0].revenue)
      },
      products: {
        total: parseInt(totalProducts.rows[0].count)
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuStressActive: cpuStressActive,
        memoryLeakSize: memoryLeak.length
      }
    });
  } catch (error) {
    logger.error('Failed to fetch metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// === SIMPLE INCIDENT SIMULATION ENDPOINTS (for testing) ===

// CPU Stress Test - Simple version
app.post('/api/stress-test', (req, res) => {
  cpuStressActive = !cpuStressActive;
  
  if (cpuStressActive) {
    logger.warn('CPU stress test activated');
    // Start CPU intensive task
    const stressStart = Date.now();
    const stressWorker = () => {
      if (cpuStressActive && Date.now() - stressStart < 30000) { // Run for 30 seconds
        for (let i = 0; i < 1000000; i++) {
          Math.random() * Math.random();
        }
        setImmediate(stressWorker);
      } else {
        cpuStressActive = false;
        logger.info('CPU stress test completed');
      }
    };
    stressWorker();
    
    res.json({
      message: 'CPU stress test activated for 30 seconds',
      status: 'active',
      duration: '30 seconds'
    });
  } else {
    logger.info('CPU stress test deactivated');
    res.json({
      message: 'CPU stress test deactivated',
      status: 'inactive'
    });
  }
});

// Memory Leak Simulation - Simple version
app.post('/api/memory-leak', (req, res) => {
  if (memoryLeakInterval) {
    clearInterval(memoryLeakInterval);
    memoryLeakInterval = null;
    logger.info('Memory leak simulation stopped');
    res.json({
      message: 'Memory leak simulation stopped',
      status: 'stopped',
      currentLeakSize: `${(memoryLeak.length * 1).toFixed(2)} MB`
    });
  } else {
    logger.warn('Memory leak simulation started');
    
    memoryLeakInterval = setInterval(() => {
      // Add 1MB of data every second
      const chunk = Buffer.alloc(1024 * 1024, 'leak');
      memoryLeak.push(chunk);
      
      logger.info(`Memory leak size: ${(memoryLeak.length).toFixed(2)} MB`);
      
      // Stop after 50MB to prevent crashing
      if (memoryLeak.length > 50) {
        clearInterval(memoryLeakInterval);
        memoryLeakInterval = null;
        logger.warn('Memory leak simulation auto-stopped at 50MB');
      }
    }, 1000);
    
    res.json({
      message: 'Memory leak simulation started (1MB/second)',
      status: 'active',
      maxSize: '50MB',
      currentLeakSize: `${memoryLeak.length} MB`
    });
  }
});

// Database Overload Simulation - Simple version
app.post('/api/db-overload', async (req, res) => {
  logger.warn('Database overload simulation started');
  
  const promises = [];
  // Create 100 concurrent database queries
  for (let i = 0; i < 100; i++) {
    promises.push(
      pool.query('SELECT * FROM products ORDER BY RANDOM() LIMIT 1')
        .catch(err => ({ error: err.message }))
    );
  }
  
  try {
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    res.json({
      message: 'Database overload test completed',
      totalQueries: 100,
      errors: errors.length,
      successfulQueries: 100 - errors.length
    });
  } catch (error) {
    logger.error('Database overload test failed', { error: error.message });
    res.status(500).json({ error: 'Database overload test failed' });
  }
});

// === FAILURE INJECTION ENDPOINTS (Advanced - your existing ones) ===

// Incident Response & Mitigation Endpoints
app.post('/api/admin/cpu-stress', (req, res) => {
    const { duration = 120000 } = req.body;
    
    logger.info(`Advanced CPU stress test activated for ${duration}ms`, {
        incident: 'cpu-stress',
        severity: 'critical',
        duration,
        timestamp: new Date().toISOString()
    });

    // Simulate CPU stress for specified duration
    const startTime = Date.now();
    const interval = setInterval(() => {
        // CPU-intensive operation
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
            result += Math.sqrt(i);
        }
        
        if (Date.now() - startTime >= duration) {
            clearInterval(interval);
            logger.info('Advanced CPU stress test completed', {
                incident: 'cpu-stress',
                severity: 'critical',
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString()
            });
        }
    }, 100);

    res.json({
        message: 'Advanced CPU stress test activated',
        duration: duration,
        severity: 'critical',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/admin/memory-leak', (req, res) => {
    const { size = 5, interval = 1000, duration = 60000 } = req.body;
    
    logger.info(`Advanced memory leak simulation started: ${size}MB every ${interval}ms for ${duration}ms`, {
        incident: 'memory-leak',
        severity: 'critical',
        size,
        interval,
        duration,
        timestamp: new Date().toISOString()
    });

    // Simulate memory leak
    const memoryLeak = [];
    const startTime = Date.now();
    const leakInterval = setInterval(() => {
        // Allocate memory
        const chunk = Buffer.alloc(size * 1024 * 1024);
        memoryLeak.push(chunk);
        
        if (Date.now() - startTime >= duration) {
            clearInterval(leakInterval);
            logger.info('Advanced memory leak simulation completed', {
                incident: 'memory-leak',
                severity: 'critical',
                allocated: memoryLeak.length * size,
                timestamp: new Date().toISOString()
            });
        }
    }, interval);

    res.json({
        message: 'Advanced memory leak simulation started',
        size: size,
        interval: interval,
        duration: duration,
        severity: 'critical',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/admin/db-stress', (req, res) => {
    const { connections = 20, duration = 60000 } = req.body;
    
    logger.info(`Advanced database stress test started: ${connections} connections for ${duration}ms`, {
        incident: 'database-overload',
        severity: 'high',
        connections,
        duration,
        timestamp: new Date().toISOString()
    });

    // Simulate database connection stress
    const startTime = Date.now();
    const interval = setInterval(async () => {
        try {
            // Create multiple database connections
            const promises = [];
            for (let i = 0; i < connections; i++) {
                promises.push(
                    pool.query('SELECT 1 as test, pg_sleep(0.1)')
                        .catch(err => logger.error('Database stress test query failed', { error: err.message }))
                );
            }
            
            await Promise.all(promises);
            
            if (Date.now() - startTime >= duration) {
                clearInterval(interval);
                logger.info('Advanced database stress test completed', {
                    incident: 'database-overload',
                    severity: 'high',
                    connections,
                    duration: Date.now() - startTime,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.error('Database stress test error', { error: error.message });
        }
    }, 1000);

    res.json({
        message: 'Advanced database stress test started',
        connections: connections,
        duration: duration,
        severity: 'high',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/admin/crash', (req, res) => {
    logger.error('Application crash simulation triggered', {
        incident: 'application-crash',
        severity: 'critical',
        timestamp: new Date().toISOString()
    });

    // Simulate application crash after response
    setTimeout(() => {
        process.exit(1);
    }, 1000);

    res.json({
        message: 'Application crash simulation triggered',
        severity: 'critical',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/admin/clear-memory', (req, res) => {
    logger.info('Memory leak mitigation initiated', {
        incident: 'memory-leak',
        action: 'mitigation',
        severity: 'critical',
        timestamp: new Date().toISOString()
    });

    // Force garbage collection if available
    if (global.gc) {
        global.gc();
        logger.info('Garbage collection completed', {
            incident: 'memory-leak',
            action: 'mitigation',
            timestamp: new Date().toISOString()
        });
    }

    res.json({
        message: 'Memory leak mitigation completed',
        action: 'mitigation',
        timestamp: new Date().toISOString()
    });
});

// Enhanced incident simulation endpoints with better logging
app.post('/api/stress-test', (req, res) => {
    logger.warn('CPU stress test activated', {
        incident: 'cpu-stress',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        mitigation: 'auto-scale instances, check for infinite loops'
    });

    // Simulate CPU stress
    const startTime = Date.now();
    const interval = setInterval(() => {
        let result = 0;
        for (let i = 0; i < 500000; i++) {
            result += Math.sqrt(i);
        }
        
        if (Date.now() - startTime >= 30000) { // 30 seconds
            clearInterval(interval);
            logger.info('CPU stress test completed', {
                incident: 'cpu-stress',
                severity: 'critical',
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString()
            });
        }
    }, 100);

    res.json({
        message: 'CPU stress test activated',
        duration: '30 seconds',
        severity: 'critical',
        mitigation: 'Monitor CPU usage, scale if needed',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/memory-leak', (req, res) => {
    logger.warn('Memory leak simulation started', {
        incident: 'memory-leak',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        mitigation: 'Clear memory leak, restart instances'
    });

    // Simulate memory leak
    const memoryLeak = [];
    const startTime = Date.now();
    const interval = setInterval(() => {
        const chunk = Buffer.alloc(1024 * 1024); // 1MB
        memoryLeak.push(chunk);
        
        if (Date.now() - startTime >= 60000) { // 1 minute
            clearInterval(interval);
            logger.info('Memory leak simulation completed', {
                incident: 'memory-leak',
                severity: 'critical',
                allocated: memoryLeak.length,
                timestamp: new Date().toISOString()
            });
        }
    }, 1000);

    res.json({
        message: 'Memory leak simulation started',
        rate: '1MB per second',
        duration: '1 minute',
        severity: 'critical',
        mitigation: 'Use clear memory button to stop',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/db-overload', (req, res) => {
    logger.warn('Database overload test completed', {
        incident: 'database-overload',
        severity: 'high',
        timestamp: new Date().toISOString(),
        mitigation: 'Optimize queries, check connection pooling'
    });

    res.json({
        message: 'Database overload test completed',
        severity: 'high',
        mitigation: 'Monitor database performance',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint - API information
app.get('/', (req, res) => {
    res.json({
        message: 'Incident Response Simulation API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            healthDetailed: '/api/health/detailed',
            products: '/api/products',
            orders: '/api/orders',
            metrics: '/api/metrics',
            incidentSimulation: {
                cpuStress: '/api/stress-test',
                memoryLeak: '/api/memory-leak',
                databaseOverload: '/api/db-overload'
            },
            admin: {
                cpuStress: '/api/admin/cpu-stress',
                memoryLeak: '/api/admin/memory-leak',
                databaseStress: '/api/admin/db-stress',
                crash: '/api/admin/crash',
                clearMemory: '/api/admin/clear-memory'
            }
        },
        documentation: 'Use /api/health for system status'
    });
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample products if table is empty
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (name, price, description, stock_quantity) VALUES
        ('Laptop Pro', 1299.99, 'High-performance laptop for professionals', 50),
        ('Wireless Mouse', 29.99, 'Ergonomic wireless mouse', 200),
        ('Mechanical Keyboard', 159.99, 'RGB mechanical keyboard', 75),
        ('4K Monitor', 399.99, '27-inch 4K display monitor', 30),
        ('USB-C Hub', 79.99, '7-in-1 USB-C hub with HDMI', 100),
        ('Noise-Canceling Headphones', 249.99, 'Premium wireless headphones', 60),
        ('Smartphone Case', 24.99, 'Protective phone case', 500),
        ('Portable Charger', 39.99, '20000mAh power bank', 150)
      `)
      logger.info('Sample products inserted');
    }
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed', { error: error.message });
  }
}

// === ERROR HANDLERS ===
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

// Start server and initialize database
app.listen(port, () => {
  logger.info(`Order API server started`, { 
    port: port,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  
  // Initialize database after server starts
  initializeDatabase();
});