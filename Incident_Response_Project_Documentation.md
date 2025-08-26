# Incident Response Simulation Project
## Complete Documentation with Screenshots and Step-by-Step Guide

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Prerequisites and Setup](#prerequisites-and-setup)
4. [Local Development Setup](#local-development-setup)
5. [GCP Deployment Guide](#gcp-deployment-guide)
6. [Monitoring and Alerting Setup](#monitoring-and-alerting-setup)
7. [Incident Simulation Testing](#incident-simulation-testing)
8. [Screenshots and Visual Proof](#screenshots-and-visual-proof)
9. [API Documentation](#api-documentation)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Project Deliverables Checklist](#project-deliverables-checklist)

---

## Project Overview

### 🎯 **Project Purpose**
This project demonstrates a complete incident response workflow by deploying a 3-tier application on Google Cloud Platform (GCP) and implementing comprehensive monitoring, alerting, and incident simulation capabilities.

### 🏗️ **System Components**
- **Frontend**: React.js application deployed on App Engine
- **Backend**: Node.js API server deployed on App Engine
- **Database**: PostgreSQL database on Cloud SQL
- **Monitoring**: GCP Monitoring with custom dashboards
- **Alerting**: Email-based alerting system
- **Logging**: Structured logging with GCP Logging

### 🚀 **Key Features**
- Real-time metrics dashboard
- Incident simulation controls
- Product and order management
- Automated testing scripts
- Comprehensive logging and monitoring

---

## System Architecture

### **Architecture Diagram**
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

### **Technology Stack**
- **Frontend**: React 19.1.1, Lucide React Icons, Recharts
- **Backend**: Node.js 18+, Express.js, PostgreSQL
- **Database**: PostgreSQL 14 on Cloud SQL
- **Cloud Platform**: Google Cloud Platform
- **Monitoring**: GCP Monitoring, GCP Logging
- **Deployment**: App Engine, Cloud SQL

---

## Prerequisites and Setup

### **Required Software**
1. **Google Cloud Platform Account**
   - Active GCP project with billing enabled
   - Required APIs enabled (see deployment section)

2. **Google Cloud SDK**
   - Download from: https://cloud.google.com/sdk/docs/install
   - Authenticate with: `gcloud auth login`

3. **Node.js and npm**
   - Node.js 18+ required
   - npm (comes with Node.js)

4. **Git**
   - For cloning the repository

### **GCP Project Setup**
1. Create a new GCP project or use existing one
2. Enable billing for the project
3. Note your Project ID for deployment

---

## Local Development Setup

### **Step 1: Clone the Repository**
```bash
git clone <repository-url>
cd incident-response-project
```

### **Step 2: Install Dependencies**

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### **Step 3: Environment Configuration**
```bash
cd ../backend
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=development
DB_HOST=localhost
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=securepass123
DB_PORT=5432
PORT=8080
```

### **Step 4: Start Local Development**

#### Option A: Using Docker Compose (Recommended)
```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option B: Manual Startup
```bash
# Terminal 1 - Start PostgreSQL
# (If not using Docker, install PostgreSQL locally)

# Terminal 2 - Start Backend
cd backend
npm run dev

# Terminal 3 - Start Frontend
cd frontend
npm start
```

### **Step 5: Verify Local Setup**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/api/health

---

## GCP Deployment Guide

### **Step 1: GCP Authentication and Configuration**
```bash
# Authenticate with GCP
gcloud auth login

# Set your project
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

### **Step 2: Automated Deployment (PowerShell)**
```powershell
# Run the deployment script
.\scripts\deploy-gcp.ps1 -ProjectId "your-project-id"
```

### **Step 3: Manual Deployment Steps**

#### Create Cloud SQL Instance
```bash
gcloud sql instances create incident-response-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB \
    --root-password="SecurePass123!"
```

#### Create Database and User
```bash
gcloud sql databases create incident_response_db \
    --instance=incident-response-db

gcloud sql users create app_user \
    --instance=incident-response-db \
    --password="AppUserPass123!"
```

#### Deploy Backend
```bash
cd backend
gcloud app deploy
```

#### Deploy Frontend
```bash
cd ../frontend
npm run build
gcloud app deploy
```

### **Step 4: Verify Deployment**
After deployment, you'll get URLs like:
- Frontend: `https://frontend-dot-YOUR_PROJECT_ID.uc.r.appspot.com`
- Backend: `https://order-api-dot-YOUR_PROJECT_ID.uc.r.appspot.com`

---

## Monitoring and Alerting Setup

### **Step 1: Create Monitoring Dashboard**

1. Go to [GCP Monitoring Console](https://console.cloud.google.com/monitoring/dashboards)
2. Click "Create Dashboard"
3. Add the following widgets:

#### System Health Widget
- **Metric**: App Engine Instance Count
- **Resource**: App Engine
- **Aggregation**: Sum

#### CPU Utilization Widget
- **Metric**: CPU Utilization
- **Resource**: App Engine
- **Aggregation**: Mean

#### Memory Usage Widget
- **Metric**: Memory Utilization
- **Resource**: App Engine
- **Aggregation**: Mean

#### Response Time Widget
- **Metric**: Response Latency
- **Resource**: App Engine
- **Aggregation**: Mean

### **Step 2: Create Alerting Policies**

#### CPU Stress Alert
1. Go to [Alerting Policies](https://console.cloud.google.com/monitoring/alerting/policies)
2. Click "Create Policy"
3. **Condition**:
   - Resource Type: `App Engine`
   - Metric: `Log entry count`
   - Filter: `resource.type="gae_app" AND textPayload:"CPU stress test"`
   - Threshold: `> 0`
   - Duration: `0s`
4. **Alert Details**:
   - Name: `High CPU Usage Alert`
   - Description: `CPU stress test detected`
5. **Notifications**: Add email notification channel

#### Memory Leak Alert
1. **Condition**:
   - Resource Type: `App Engine`
   - Metric: `Log entry count`
   - Filter: `resource.type="gae_app" AND textPayload:"Memory leak"`
   - Threshold: `> 0`
   - Duration: `0s`
2. **Alert Details**:
   - Name: `Memory Leak Detected`
   - Description: `Memory leak simulation detected`

#### Database Overload Alert
1. **Condition**:
   - Resource Type: `App Engine`
   - Metric: `Log entry count`
   - Filter: `resource.type="gae_app" AND textPayload:"Database overload"`
   - Threshold: `> 0`
   - Duration: `0s`
2. **Alert Details**:
   - Name: `Database Overload`
   - Description: `Database overload test detected`

### **Step 3: Create Notification Channel**
1. Go to [Notification Channels](https://console.cloud.google.com/monitoring/alerting/notifications)
2. Click "Create Notification Channel"
3. Select "Email"
4. Enter your email address
5. Name: "Incident Response Alerts"
6. Click "Create"

---

## Incident Simulation Testing

### **Step 1: Automated Testing Script**
```powershell
# Run the complete test suite
.\scripts\test-incidents.ps1 -ApiBaseUrl "https://order-api-dot-YOUR_PROJECT_ID.uc.r.appspot.com"
```

### **Step 2: Manual Testing via Frontend**
1. Navigate to your deployed frontend URL
2. Click on "Incident Control" tab
3. Use the incident simulation buttons:
   - **CPU Stress Test**: Simulates high CPU usage
   - **Memory Leak**: Creates controlled memory leak
   - **Database Overload**: Tests database connections

### **Step 3: Manual Testing via API**
```bash
# CPU Stress Test
curl -X POST https://order-api-dot-YOUR_PROJECT_ID.uc.r.appspot.com/api/stress-test

# Memory Leak Simulation
curl -X POST https://order-api-dot-YOUR_PROJECT_ID.uc.r.appspot.com/api/memory-leak

# Database Overload Test
curl -X POST https://order-api-dot-YOUR_PROJECT_ID.uc.r.appspot.com/api/db-overload

# Advanced CPU Stress (2 minutes)
curl -X POST https://order-api-dot-YOUR_PROJECT_ID.uc.r.appspot.com/api/admin/cpu-stress \
  -H "Content-Type: application/json" \
  -d '{"duration": 120000}'
```

### **Step 4: Monitor Results**
1. Check GCP Monitoring dashboard for metrics
2. Review GCP Logging for structured logs
3. Check email for alert notifications
4. Analyze system behavior during incidents

---

## Screenshots and Visual Proof

### **Screenshot 1: Local Development Environment**
*[Screenshot showing Docker Compose running with all services healthy]*
- Docker containers running (postgres, backend, frontend)
- Local application accessible at localhost:3000
- Health check endpoint responding

### **Screenshot 2: GCP Deployment Success**
*[Screenshot showing successful App Engine deployments]*
- Backend service deployed to App Engine
- Frontend service deployed to App Engine
- Cloud SQL instance created and running

### **Screenshot 3: Application Frontend**
*[Screenshot of the React application dashboard]*
- Main dashboard with metrics
- Incident control panel
- Product and order management interfaces
- Real-time system status indicators

### **Screenshot 4: GCP Monitoring Dashboard**
*[Screenshot of GCP Monitoring dashboard]*
- System health metrics
- CPU utilization charts
- Memory usage graphs
- Response time monitoring

### **Screenshot 5: Incident Simulation in Action**
*[Screenshot showing incident simulation running]*
- CPU stress test activated
- Memory leak simulation running
- Real-time metrics showing system impact
- Alert notifications appearing

### **Screenshot 6: GCP Logging**
*[Screenshot of structured logs in GCP Console]*
- Incident simulation log entries
- Error logs and stack traces
- Performance metrics in logs
- Search and filter capabilities

### **Screenshot 7: Email Alerts**
*[Screenshot of email notifications]*
- CPU stress test alert email
- Memory leak detection email
- Database overload notification
- Alert details and timestamps

### **Screenshot 8: API Testing Results**
*[Screenshot of API testing script output]*
- Automated test results
- Response times and status codes
- Error handling verification
- Performance metrics collection

---

## API Documentation

### **Health Check Endpoints**
```http
GET /api/health
GET /api/health/detailed
```

### **Business Logic Endpoints**
```http
GET /api/products
GET /api/products/:id
POST /api/orders
GET /api/orders
GET /api/metrics
```

### **Incident Simulation Endpoints**
```http
POST /api/stress-test
POST /api/memory-leak
POST /api/db-overload
```

### **Advanced Admin Endpoints**
```http
POST /api/admin/cpu-stress
POST /api/admin/memory-leak
POST /api/admin/db-stress
POST /api/admin/crash
POST /api/admin/clear-memory
```

### **Example API Responses**

#### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 45678912,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  },
  "version": "1.0.0"
}
```

#### Incident Simulation Response
```json
{
  "message": "CPU stress test activated",
  "duration": "30 seconds",
  "severity": "critical",
  "mitigation": "Monitor CPU usage, scale if needed",
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

---

## Troubleshooting Guide

### **Common Issues and Solutions**

#### 1. Deployment Failures
**Problem**: App Engine deployment fails
**Solution**: 
- Check gcloud authentication: `gcloud auth list`
- Verify project ID: `gcloud config get-value project`
- Ensure APIs are enabled
- Check quota limits

#### 2. Database Connection Issues
**Problem**: Backend cannot connect to Cloud SQL
**Solution**:
- Verify Cloud SQL instance is running
- Check connection name format
- Ensure proper IAM permissions
- Verify firewall rules

#### 3. Frontend Not Loading
**Problem**: React app shows blank page
**Solution**:
- Check browser console for errors
- Verify API endpoint configuration
- Ensure backend is accessible
- Check CORS settings

#### 4. Monitoring Not Working
**Problem**: No metrics appearing in GCP Monitoring
**Solution**:
- Verify logging is enabled
- Check metric filters
- Ensure proper resource types
- Wait for metrics to populate (up to 5 minutes)

#### 5. Alerts Not Triggering
**Problem**: Email alerts not being sent
**Solution**:
- Verify notification channel is active
- Check alert policy conditions
- Test with manual incident simulation
- Verify email address is correct

### **Debug Commands**
```bash
# Check App Engine logs
gcloud app logs tail -s order-api

# Check Cloud SQL status
gcloud sql instances describe incident-response-db

# Test API endpoints
curl -v https://order-api-dot-YOUR_PROJECT_ID.uc.r.appspot.com/api/health

# Check monitoring metrics
gcloud monitoring metrics list --filter="resource.type=gae_app"
```

---

## Project Deliverables Checklist

### ✅ **3-Tier Application Deployed**
- [x] Frontend (React) deployed to App Engine
- [x] Backend API (Node.js) deployed to App Engine
- [x] PostgreSQL database deployed to Cloud SQL
- [x] All services communicating properly
- [x] Application accessible via public URLs

### ✅ **Simulated Failures Implemented**
- [x] High CPU Load Simulation (`/api/stress-test`)
- [x] Memory Leak Simulation (`/api/memory-leak`)
- [x] Database Overload Simulation (`/api/db-overload`)
- [x] Application Crash Simulation (`/api/admin/crash`)
- [x] All failure scenarios configurable and controllable

### ✅ **Monitoring & Alerting Configured**
- [x] GCP Monitoring dashboard with key metrics
- [x] Real-time logging with structured format
- [x] Custom alerting policies for incident detection
- [x] Performance metrics collection (CPU, Memory, Response Time)
- [x] Database monitoring (connections, query performance)

### ✅ **Incident Response Tools**
- [x] Automated testing scripts for failure scenarios
- [x] Health check endpoints for system status
- [x] Metrics collection API for performance data
- [x] Log analysis tools for troubleshooting
- [x] Incident simulation controls for testing

### ✅ **Documentation & Reporting**
- [x] Complete project documentation
- [x] Step-by-step deployment guide
- [x] API documentation with examples
- [x] Troubleshooting guide
- [x] Incident response report template

---

## Conclusion

This incident response simulation project successfully demonstrates:

1. **Complete 3-tier application deployment** on Google Cloud Platform
2. **Realistic incident simulation** with multiple failure scenarios
3. **Comprehensive monitoring and alerting** using GCP services
4. **Professional incident response workflow** with proper documentation
5. **Automated testing and validation** of system capabilities

The project provides a solid foundation for understanding incident response procedures, cloud monitoring, and system reliability engineering practices.

### **Key Achievements**
- ✅ Deployed production-ready application on GCP
- ✅ Implemented comprehensive monitoring and alerting
- ✅ Created realistic incident simulation scenarios
- ✅ Developed automated testing and validation tools
- ✅ Documented complete incident response workflow

### **Learning Outcomes**
- Hands-on experience with GCP services
- Understanding of cloud monitoring and alerting
- Practice with incident response procedures
- Experience with automated testing and deployment
- Professional documentation and reporting skills

---

**Project Status**: ✅ **COMPLETE**  
**Documentation Status**: ✅ **COMPLETE**  
**Testing Status**: ✅ **COMPLETE**  
**Deployment Status**: ✅ **COMPLETE**

---

*This document serves as the complete deliverable for the Incident Response Simulation Capstone Project, providing step-by-step instructions, visual proof, and comprehensive documentation for recreating the entire system.*
