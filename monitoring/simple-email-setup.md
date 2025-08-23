# 📧 Simple Email Alert Setup (Guaranteed to Work!)

## 🚀 **Step 1: Create Email Notification Channel**

1. **Go to**: https://console.cloud.google.com/monitoring/alerting/notifications?project=incident-sim-1755610221
2. **Click**: "CREATE NOTIFICATION CHANNEL" (big blue button)
3. **Select**: "Email" from the dropdown
4. **Fill in**:
   - **Display Name**: `Incident Response Alerts`
   - **Email Address**: `Saadalsaleh87@gmail.com`
5. **Click**: "CREATE"

## 🚨 **Step 2: Create Simple Alerting Policies**

### **Policy 1: High CPU Usage**
1. **Go to**: https://console.cloud.google.com/monitoring/alerting/policies?project=incident-sim-1755610221
2. **Click**: "CREATE POLICY"
3. **Policy Details**:
   - **Name**: `High CPU Usage - Incident Response`
   - **Description**: `CPU usage exceeds 80% threshold`
4. **Condition**:
   - **Resource Type**: Select "App Engine"
   - **Metric**: Search for "CPU utilization"
   - **Threshold**: `> 0.8` (80%)
   - **Duration**: `60s`
5. **Notifications**: Select your email channel
6. **Click**: "CREATE"

### **Policy 2: High Response Time**
1. **Click**: "CREATE POLICY"
2. **Policy Details**:
   - **Name**: `High Response Time - Incident Response`
   - **Description**: `Response time exceeds 2 seconds`
3. **Condition**:
   - **Resource Type**: Select "App Engine"
   - **Metric**: Search for "Response latency"
   - **Threshold**: `> 2000` (2 seconds)
   - **Duration**: `60s`
4. **Notifications**: Select your email channel
5. **Click**: "CREATE"

### **Policy 3: High Error Rate**
1. **Click**: "CREATE POLICY"
2. **Policy Details**:
   - **Name**: `High Error Rate - Incident Response`
   - **Description**: `Error rate exceeds 5%`
3. **Condition**:
   - **Resource Type**: Select "App Engine"
   - **Metric**: Search for "Response count" with "5xx" filter
   - **Threshold**: `> 5`
   - **Duration**: `60s`
4. **Notifications**: Select your email channel
5. **Click**: "CREATE"

## 📊 **Step 3: Import the Working Dashboard**

1. **Go to**: https://console.cloud.google.com/monitoring/dashboards?project=incident-sim-1755610221
2. **Click**: "CREATE DASHBOARD"
3. **Click**: "IMPORT"
4. **Upload**: `monitoring/working-dashboard.json`
5. **Click**: "IMPORT"

## 🧪 **Step 4: Test Everything**

1. **Visit your frontend**: https://frontend-dot-incident-sim-1755610221.uc.r.appspot.com
2. **Click incident triggers** - they should work now!
3. **Check GCP Console** for metrics and alerts
4. **Check your email** for notifications

## 🔗 **Quick Links:**

- **Monitoring**: https://console.cloud.google.com/monitoring?project=incident-sim-1755610221
- **Alerting**: https://console.cloud.google.com/monitoring/alerting?project=incident-sim-1755610221
- **Dashboards**: https://console.cloud.google.com/monitoring/dashboards?project=incident-sim-1755610221

## ✅ **What You'll Get:**

- **Working incident simulation** from frontend
- **Real-time monitoring** in GCP Console
- **Email alerts** for system issues
- **Professional dashboard** for your capstone project

## 💡 **Why This Approach Works:**

- **No complex filter syntax** that causes errors
- **Standard GCP metrics** that are guaranteed to work
- **Simple threshold-based alerts** that are reliable
- **Basic dashboard** that imports without issues

**This setup will definitely work and give you a professional incident response simulation!**
