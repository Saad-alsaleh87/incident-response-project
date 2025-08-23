# Incident Response Simulation Project

A comprehensive 3-tier application designed to simulate real-world incidents and practice incident response procedures using Google Cloud Platform (GCP) monitoring and alerting.

## 🎯 Project Overview

This project demonstrates a complete incident response workflow by:
- Deploying a 3-tier application (Frontend, API, Database) on GCP
- Introducing simulated failures (CPU stress, memory leaks, database overload)
- Configuring real-time monitoring dashboards and alerting
- Providing tools to analyze logs and metrics during incidents
- Generating comprehensive incident response reports

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Cloud SQL)   │
│   App Engine    │    │   App Engine    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GCP           │    │   GCP           │    │   GCP           │
│   Monitoring    │    │   Logging       │    │   Alerting      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### Application Features
- **Product Management**: CRUD operations for products
- **Order Management**: Create and track customer orders
- **Real-time Metrics**: Live system performance data
- **Health Monitoring**: Comprehensive health checks

### Incident Simulation Features
- **CPU Stress Testing**: Simulate high CPU utilization
- **Memory Leak Simulation**: Create controlled memory leaks
- **Database Overload**: Test database connection limits
- **Application Crash**: Simulate application failures

### Monitoring & Alerting
- **Real-time Dashboards**: GCP Monitoring integration
- **Structured Logging**: Winston + GCP Logging
- **Custom Metrics**: Application-specific performance data
- **Alert Policies**: Automated incident detection

## 📋 Prerequisites

- Google Cloud Platform account
- Google Cloud SDK (gcloud CLI)
- Node.js 18+ and npm
- PostgreSQL knowledge (basic)
- Bash shell (for deployment scripts)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd incident-response-project
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Local Development Options

#### Option A: Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option B: Manual Startup
```bash
# Start backend
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm start
```

#### Option C: Using the Startup Script
```bash
# Linux/macOS
chmod +x scripts/start-local.sh
./scripts/start-local.sh

# Windows (PowerShell)
.\scripts\start-local.ps1
```

### 3. Configure Environment Variables
```bash
cd ../backend
cp env.example .env
# Edit .env with your GCP project details
```

### 4. Set Up GCP Project
```bash
# Authenticate with GCP
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    cloudresourcemanager.googleapis.com \
    compute.googleapis.com \
    sqladmin.googleapis.com \
    appengine.googleapis.com \
    logging.googleapis.com \
    monitoring.googleapis.com \
    errorreporting.googleapis.com
```

## 🚀 Deployment

### Automated Deployment

#### Linux/macOS
```bash
# Make the deployment script executable
chmod +x scripts/deploy-gcp.sh

# Run the deployment script
./scripts/deploy-gcp.sh
```

#### Windows (PowerShell)
```powershell
# Run the PowerShell deployment script
.\scripts\deploy-gcp.ps1 -ProjectId "your-project-id"
```

### Manual Deployment Steps
1. **Create Cloud SQL Instance**
2. **Deploy Backend to App Engine**
3. **Deploy Frontend to App Engine**
4. **Configure Monitoring Dashboard**
5. **Set Up Alerting Policies**

## 🧪 Testing Incident Scenarios

### Run the Complete Test Suite

#### Linux/macOS
```bash
# Make the test script executable
chmod +x scripts/test-incidents.sh

# Run all incident simulations
./scripts/test-incidents.sh
```

#### Windows (PowerShell)
```powershell
# Run the PowerShell test script
.\scripts\test-incidents.ps1 -ApiBaseUrl "http://localhost:8080"
```

### Individual Test Endpoints

#### CPU Stress Test
```bash
# Simple CPU stress (30 seconds)
curl -X POST http://your-api-url/api/stress-test

# Advanced CPU stress (configurable duration)
curl -X POST http://your-api-url/api/admin/cpu-stress \
  -H "Content-Type: application/json" \
  -d '{"duration": 120000}'
```

#### Memory Leak Simulation
```bash
# Simple memory leak (1MB/second)
curl -X POST http://your-api-url/api/memory-leak

# Advanced memory leak (configurable)
curl -X POST http://your-api-url/api/admin/memory-leak \
  -H "Content-Type: application/json" \
  -d '{"size": 5, "interval": 1000, "duration": 60000}'
```

#### Database Overload Test
```bash
# Simple database stress
curl -X POST http://your-api-url/api/db-overload

# Advanced database stress
curl -X POST http://your-api-url/api/admin/db-stress \
  -H "Content-Type: application/json" \
  -d '{"connections": 20, "duration": 60000}'
```

## 📊 Monitoring & Observability

### GCP Monitoring Dashboard
- **System Health**: Instance count, CPU, memory usage
- **Performance Metrics**: Request rate, response latency, error rates
- **Database Metrics**: Connection count, query performance
- **Incident Detection**: Real-time log analysis

### Key Metrics to Monitor
- CPU utilization > 80%
- Memory usage > 90%
- Response latency > 500ms
- Error rate > 5%
- Database connections > 80%

### Log Analysis
```bash
# View application logs
gcloud app logs tail -s order-api

# Search for specific incidents
gcloud logging read 'resource.type="gae_app" AND textPayload:"CPU stress test"'

# Export logs for analysis
gcloud logging read 'resource.type="gae_app"' --limit=1000 --format=json > logs.json
```

## 🚨 Incident Response Workflow

### 1. Detection
- Monitor GCP Monitoring dashboards
- Watch for alert notifications
- Check application health endpoints

### 2. Investigation
- Review structured logs in GCP Console
- Analyze performance metrics
- Check system resource usage

### 3. Response
- Identify root cause
- Implement immediate fixes
- Monitor recovery progress

### 4. Documentation
- Use the incident response report template
- Document lessons learned
- Update runbooks and procedures

## 📝 Incident Response Report

After each incident simulation, complete the incident response report template located in `docs/incident-response-report-template.md`. This document serves as your deliverable for the capstone project.

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLOUD_PROJECT` | GCP Project ID | Required |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account key path | Required |
| `INSTANCE_CONNECTION_NAME` | Cloud SQL connection name | Required |
| `DB_HOST` | Database host | localhost |
| `DB_NAME` | Database name | postgres |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | securepass123 |
| `NODE_ENV` | Environment | development |

### Monitoring Configuration
- **Alert Thresholds**: Configured in GCP Monitoring
- **Log Retention**: 30 days (GCP default)
- **Metric Aggregation**: 1-minute intervals
- **Dashboard Refresh**: 30 seconds

## 🏆 Capstone Project Deliverables

✅ **3-Tier Application Deployed**
- Frontend (React) on App Engine
- Backend API (Node.js) on App Engine  
- PostgreSQL database on Cloud SQL

✅ **Simulated Failures Implemented**
- High CPU load simulation
- Memory leak simulation
- Database overload simulation
- Application crash simulation

✅ **Monitoring & Alerting Configured**
- Real-time monitoring dashboards
- Structured logging with GCP Logging
- Custom alerting policies
- Performance metrics collection

✅ **Incident Response Tools**
- Automated testing scripts
- Incident simulation endpoints
- Real-time metrics collection
- Comprehensive logging

✅ **Documentation & Reporting**
- Incident response report template
- Deployment and testing guides
- Architecture documentation
- Monitoring configuration

## 🚀 Next Steps

1. **Deploy to GCP** using the provided scripts
2. **Run incident simulations** to test monitoring
3. **Analyze results** using GCP Console
4. **Complete incident response report** using the template
5. **Present findings** to demonstrate incident response capabilities

## 📚 Additional Resources

- [GCP Monitoring Documentation](https://cloud.google.com/monitoring)
- [GCP Logging Documentation](https://cloud.google.com/logging)
- [App Engine Documentation](https://cloud.google.com/appengine)
- [Cloud SQL Documentation](https://cloud.google.com/sql)

## 🤝 Contributing

This project is designed for educational purposes. Feel free to:
- Modify incident simulation parameters
- Add new failure scenarios
- Enhance monitoring dashboards
- Improve alerting policies

## 📄 License

This project is created for educational purposes as part of a capstone project.

---

**Happy Incident Response Training! 🚨📊🔍**
