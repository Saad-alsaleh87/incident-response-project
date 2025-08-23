import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Health and System APIs
export const healthApi = {
  getHealth: () => api.get('/api/health'),
  getDetailedHealth: () => api.get('/api/health/detailed'),
};

// Metrics API
export const metricsApi = {
  getMetrics: () => api.get('/api/metrics'),
};

// Products API
export const productsApi = {
  getProducts: () => api.get('/api/products'),
  getProduct: (id) => api.get(`/api/products/${id}`),
};

// Orders API
export const ordersApi = {
  getOrders: (limit = 50) => api.get(`/api/orders?limit=${limit}`),
  createOrder: (orderData) => api.post('/api/orders', orderData),
};

// Incident Simulation APIs
export const incidentApi = {
  // Simple incident endpoints
  triggerCpuStress: () => api.post('/api/stress-test'),
  triggerMemoryLeak: () => api.post('/api/memory-leak'),
  triggerDbOverload: () => api.post('/api/db-overload'),
  
  // Advanced admin endpoints
  triggerAdvancedCpuStress: (config) => api.post('/api/admin/cpu-stress', config),
  triggerAdvancedMemoryLeak: (config) => api.post('/api/admin/memory-leak', config),
  triggerDbStress: (config) => api.post('/api/admin/db-stress', config),
  crashApplication: (config) => api.post('/api/admin/crash', config),
  clearMemory: () => api.post('/api/admin/clear-memory'),
};

export default api;