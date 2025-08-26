# Screenshot Guide for Incident Response Project Documentation

This guide provides detailed instructions for capturing all necessary screenshots to demonstrate the successful implementation of your incident response simulation project.

## 📸 Required Screenshots Checklist

### **1. Local Development Environment**
- [ ] Docker Compose services running
- [ ] Local application in browser
- [ ] Health check endpoint response
- [ ] Terminal showing successful startup

### **2. GCP Deployment**
- [ ] App Engine services deployed
- [ ] Cloud SQL instance created
- [ ] Deployment success messages
- [ ] Public URLs accessible

### **3. Application Interface**
- [ ] Main dashboard with metrics
- [ ] Incident control panel
- [ ] Product management interface
- [ ] Order management interface

### **4. Monitoring and Alerting**
- [ ] GCP Monitoring dashboard
- [ ] Alerting policies configured
- [ ] Notification channels setup
- [ ] Real-time metrics display

### **5. Incident Simulation**
- [ ] Incident simulation in progress
- [ ] System metrics during incidents
- [ ] Alert notifications
- [ ] Log entries showing incidents

### **6. Testing and Validation**
- [ ] Automated test script results
- [ ] API endpoint responses
- [ ] Error handling demonstrations
- [ ] Performance metrics

---

## 📋 Detailed Screenshot Instructions

### **Screenshot 1: Local Development Setup**

**What to capture:**
- Docker Desktop or terminal showing running containers
- Browser showing the application at localhost:3000
- Health check API response at localhost:8080/api/health

**Steps:**
1. Start the application: `docker-compose up -d`
2. Open browser to http://localhost:3000
3. Open another tab to http://localhost:8080/api/health
4. Take screenshot of both browser tabs
5. Take screenshot of terminal showing Docker containers

**Expected content:**
- React application dashboard
- JSON health response
- Running containers: postgres, backend, frontend

### **Screenshot 2: GCP Project Overview**

**What to capture:**
- GCP Console project dashboard
- Enabled APIs list
- Project ID and billing information

**Steps:**
1. Go to [GCP Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to "APIs & Services" > "Enabled APIs"
4. Take screenshot of enabled APIs
5. Take screenshot of project overview

**Expected content:**
- Project ID visible
- Required APIs enabled (App Engine, Cloud SQL, Monitoring, etc.)
- Billing account linked

### **Screenshot 3: Cloud SQL Database**

**What to capture:**
- Cloud SQL instance details
- Database configuration
- Connection information

**Steps:**
1. Go to [Cloud SQL Console](https://console.cloud.google.com/sql)
2. Click on your instance
3. Take screenshot of instance details
4. Go to "Databases" tab
5. Take screenshot of database list

**Expected content:**
- Instance name: incident-response-db
- Database: incident_response_db
- User: app_user
- Connection name visible

### **Screenshot 4: App Engine Services**

**What to capture:**
- App Engine services list
- Service details and URLs
- Deployment history

**Steps:**
1. Go to [App Engine Console](https://console.cloud.google.com/appengine)
2. Click on "Services"
3. Take screenshot of services list
4. Click on each service to show details
5. Take screenshot of service URLs

**Expected content:**
- Two services: frontend and order-api
- Public URLs for each service
- Service status: serving
- Version information

### **Screenshot 5: Application Frontend Dashboard**

**What to capture:**
- Main dashboard with metrics
- Navigation tabs
- System status indicators

**Steps:**
1. Navigate to your deployed frontend URL
2. Take screenshot of main dashboard
3. Click on "Incident Control" tab
4. Take screenshot of incident controls
5. Click on "Products" tab
6. Take screenshot of product management

**Expected content:**
- Real-time metrics display
- System health indicators
- Incident simulation buttons
- Product list and management

### **Screenshot 6: Incident Simulation in Action**

**What to capture:**
- Incident simulation running
- System metrics changing
- Alert notifications

**Steps:**
1. Go to "Incident Control" tab
2. Click "CPU Stress Test" button
3. Immediately take screenshot
4. Wait 10 seconds, take another screenshot
5. Check email for alerts, screenshot alert email

**Expected content:**
- Incident simulation active
- Metrics showing system impact
- Alert email notification
- Log entries in GCP Console

### **Screenshot 7: GCP Monitoring Dashboard**

**What to capture:**
- Custom monitoring dashboard
- Real-time metrics
- Alert status

**Steps:**
1. Go to [GCP Monitoring](https://console.cloud.google.com/monitoring)
2. Navigate to "Dashboards"
3. Open your custom dashboard
4. Take screenshot of dashboard
5. Go to "Alerting" > "Policies"
6. Take screenshot of alert policies

**Expected content:**
- CPU utilization charts
- Memory usage graphs
- Response time metrics
- Alert policies configured

### **Screenshot 8: GCP Logging**

**What to capture:**
- Structured log entries
- Incident simulation logs
- Log filtering and search

**Steps:**
1. Go to [GCP Logging](https://console.cloud.google.com/logs)
2. Set filter: `resource.type="gae_app"`
3. Take screenshot of log entries
4. Search for "CPU stress test"
5. Take screenshot of filtered results

**Expected content:**
- Structured JSON log entries
- Incident simulation log entries
- Error logs and stack traces
- Timestamp and severity levels

### **Screenshot 9: Email Alerts**

**What to capture:**
- Email notification for CPU stress
- Email notification for memory leak
- Email notification for database overload

**Steps:**
1. Trigger CPU stress test
2. Check email inbox
3. Take screenshot of alert email
4. Trigger memory leak simulation
5. Take screenshot of memory leak alert
6. Trigger database overload test
7. Take screenshot of database alert

**Expected content:**
- Alert email subject and body
- Incident details and timestamp
- Severity level information
- Link to GCP Console

### **Screenshot 10: API Testing Results**

**What to capture:**
- Automated test script output
- API endpoint responses
- Performance metrics

**Steps:**
1. Run the test script: `.\scripts\test-incidents.ps1`
2. Take screenshot of script output
3. Test individual API endpoints
4. Take screenshot of API responses
5. Show metrics endpoint response

**Expected content:**
- Test script execution results
- API response JSON
- Performance metrics
- Error handling demonstrations

### **Screenshot 11: System Health and Metrics**

**What to capture:**
- Detailed health check response
- System metrics during normal operation
- System metrics during incidents

**Steps:**
1. Call `/api/health/detailed` endpoint
2. Take screenshot of response
3. Call `/api/metrics` endpoint
4. Take screenshot of metrics
5. Trigger incident and compare metrics

**Expected content:**
- Detailed health status
- System performance metrics
- Database connection status
- Memory and CPU information

### **Screenshot 12: Error Handling and Recovery**

**What to capture:**
- Error responses
- Recovery procedures
- System restoration

**Steps:**
1. Trigger application crash simulation
2. Take screenshot of crash response
3. Show system recovery
4. Demonstrate error handling
5. Show system returning to normal

**Expected content:**
- Crash simulation response
- System recovery process
- Error handling mechanisms
- Normal operation restored

---

## 🎯 Screenshot Quality Guidelines

### **Technical Requirements**
- **Resolution**: Minimum 1920x1080
- **Format**: PNG or JPG
- **File Size**: Under 5MB per screenshot
- **Clarity**: Text should be readable
- **Completeness**: Show full context

### **Content Guidelines**
- **Timestamps**: Ensure timestamps are visible
- **URLs**: Show complete URLs in address bar
- **Data**: Include relevant data and metrics
- **Status**: Show system status indicators
- **Errors**: Include error messages when relevant

### **Organization**
- **Naming**: Use descriptive filenames
- **Numbering**: Number screenshots sequentially
- **Grouping**: Group related screenshots
- **Captions**: Add descriptive captions

---

## 📝 Screenshot Captions Template

For each screenshot, include:

1. **Title**: Brief description of what's shown
2. **Context**: When and why this screenshot was taken
3. **Key Elements**: What to focus on in the image
4. **Expected Outcome**: What this proves about the system

### **Example Caption:**
```
Screenshot 1: Local Development Environment
Context: Initial setup and testing of the incident response application
Key Elements: Docker containers running, React app in browser, health check API response
Expected Outcome: Demonstrates successful local development setup with all services operational
```

---

## 🚀 Quick Screenshot Checklist

Before submitting your Word document, ensure you have:

- [ ] **8-12 high-quality screenshots** covering all major components
- [ ] **Clear, readable text** in all screenshots
- [ ] **Proper timestamps** showing when screenshots were taken
- [ ] **Complete URLs** visible in browser address bars
- [ ] **System status indicators** showing healthy/operational state
- [ ] **Incident simulation evidence** showing system response
- [ ] **Monitoring and alerting proof** showing GCP integration
- [ ] **API testing results** demonstrating functionality
- [ ] **Error handling examples** showing system resilience
- [ ] **Recovery procedures** showing system restoration

---

## 💡 Pro Tips for Better Screenshots

1. **Use Full Screen**: Capture full browser windows when possible
2. **Highlight Important Elements**: Use browser dev tools to highlight key metrics
3. **Show Multiple Tabs**: Demonstrate different parts of the system
4. **Include Timestamps**: Ensure system clocks are visible
5. **Capture Transitions**: Show before/after states during incidents
6. **Use Consistent Formatting**: Maintain same browser zoom level
7. **Include Context**: Show navigation and system state
8. **Demonstrate Functionality**: Show actual user interactions

---

*This screenshot guide ensures you capture all necessary visual evidence to demonstrate the successful implementation and operation of your incident response simulation project.*
