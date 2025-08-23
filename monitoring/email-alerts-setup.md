# 📧 Email Alerting Setup Guide

Since the gcloud CLI alpha commands aren't working on Windows, here's how to set up email alerts manually in GCP Console:

## 🚀 **Step 1: Create Notification Channel**

1. Go to [GCP Monitoring Console](https://console.cloud.google.com/monitoring/alerting/notifications?project=incident-sim-1755610221)
2. Click **"Create Notification Channel"**
3. Select **"Email"** as the channel type
4. Enter your email: **Saadalsaleh87@gmail.com**
5. Name: **"Incident Response Alerts"**
6. Click **"Create"**

## 🚨 **Step 2: Create Alerting Policies**

### **CPU Stress Alert:**
1. Go to [Alerting Policies](https://console.cloud.google.com/monitoring/alerting/policies?project=incident-sim-1755610221)
2. Click **"Create Policy"**
3. **Condition:**
   - Resource Type: `App Engine`
   - Metric: `Log entry count`
   - Filter: `resource.type="gae_app" AND textPayload:"CPU stress test"`
   - Threshold: `> 0`
   - Duration: `0s`
4. **Alert Details:**
   - Name: `High CPU Usage Alert - Incident Response`
   - Description: `CPU stress test detected in incident response simulation`
5. **Notifications:** Select your email channel
6. **Click "Create"**

### **Memory Leak Alert:**
1. **Create Policy"**
2. **Condition:**
   - Resource Type: `App Engine`
   - Metric: `Log entry count`
   - Filter: `resource.type="gae_app" AND textPayload:"Memory leak"`
   - Threshold: `> 0`
   - Duration: `0s`
3. **Alert Details:**
   - Name: `Memory Leak Detected - Incident Response`
   - Description: `Memory leak simulation detected in incident response simulation`
4. **Notifications:** Select your email channel
5. **Click "Create"**

### **Database Overload Alert:**
1. **Create Policy"**
2. **Condition:**
   - Resource Type: `App Engine`
   - Metric: `Log entry count`
   - Filter: `resource.type="gae_app" AND textPayload:"Database overload"`
   - Threshold: `> 0`
   - Duration: `0s`
3. **Alert Details:**
   - Name: `Database Overload - Incident Response`
   - Description: `Database overload test detected in incident response simulation`
4. **Notifications:** Select your email channel
5. **Click "Create"**

### **High Response Time Alert:**
1. **Create Policy"**
2. **Condition:**
   - Resource Type: `App Engine`
   - Metric: `Response latency`
   - Threshold: `> 1000ms`
   - Duration: `60s`
3. **Alert Details:**
   - Name: `High Response Time - Incident Response`
   - Description: `Response time exceeded 1 second threshold`
4. **Notifications:** Select your email channel
5. **Click "Create"**

## 🧪 **Step 3: Test the Alerts**

1. Go to your frontend: https://frontend-dot-incident-sim-1755610221.uc.r.appspot.com
2. Click any incident trigger button
3. Check your email for alerts
4. Check GCP Console for alert status

## 📊 **Step 4: Import the Simplified Dashboard**

1. Go to [GCP Monitoring Dashboards](https://console.cloud.google.com/monitoring/dashboards?project=incident-sim-1755610221)
2. Click **"Create Dashboard"**
3. Click **"Import"**
4. Upload the file: `monitoring/simplified-dashboard.json`
5. Click **"Import"**

## 🔗 **Quick Links:**

- **Monitoring Console**: https://console.cloud.google.com/monitoring?project=incident-sim-1755610221
- **Alerting Policies**: https://console.cloud.google.com/monitoring/alerting/policies?project=incident-sim-1755610221
- **Notification Channels**: https://console.cloud.google.com/monitoring/alerting/notifications?project=incident-sim-1755610221
- **Dashboards**: https://console.cloud.google.com/monitoring/dashboards?project=incident-sim-1755610221

## ✅ **What You'll Get:**

- **Email alerts** for all incident types
- **Simplified dashboard** with essential metrics
- **Real-time monitoring** of your incident response simulation
- **Professional alerting** system for your capstone project
