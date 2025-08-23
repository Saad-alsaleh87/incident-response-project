#!/bin/bash

# GCP Deployment Script for Incident Response Simulation
# This script deploys the 3-tier application to Google Cloud Platform

set -e

echo "🚀 Starting GCP deployment for Incident Response Simulation..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run: gcloud auth login"
    exit 1
fi

# Set project ID (replace with your actual project ID)
PROJECT_ID="your-project-id"
REGION="us-central1"
ZONE="${REGION}-a"

echo "📋 Using project: $PROJECT_ID"
echo "📍 Region: $REGION"
echo "📍 Zone: $ZONE"

# Set the project
gcloud config set project $PROJECT_ID

echo "🔧 Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    cloudresourcemanager.googleapis.com \
    compute.googleapis.com \
    sqladmin.googleapis.com \
    appengine.googleapis.com \
    logging.googleapis.com \
    monitoring.googleapis.com \
    errorreporting.googleapis.com

echo "🗄️ Creating Cloud SQL instance..."
gcloud sql instances create incident-response-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup-start-time="02:00" \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=03 \
    --availability-type=zonal \
    --zone=$ZONE \
    --root-password="SecurePass123!" \
    --quiet

echo "🔐 Creating database..."
gcloud sql databases create incident_response_db \
    --instance=incident-response-db \
    --quiet

echo "👤 Creating database user..."
gcloud sql users create app_user \
    --instance=incident-response-db \
    --password="AppUserPass123!" \
    --quiet

echo "🌐 Getting instance connection name..."
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe incident-response-db \
    --format="value(connectionName)")

echo "📝 Instance connection name: $INSTANCE_CONNECTION_NAME"

echo "🏗️ Deploying backend to App Engine..."
cd backend

# Create app.yaml with the correct instance connection name
cat > app.yaml << EOF
runtime: nodejs18
service: order-api

env_variables:
  NODE_ENV: production
  PORT: 8080
  INSTANCE_CONNECTION_NAME: $INSTANCE_CONNECTION_NAME
  DB_USER: app_user
  DB_PASSWORD: AppUserPass123!
  DB_NAME: incident_response_db

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10
  target_throughput_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 1
  disk_size_gb: 10

handlers:
  - url: /.*
    script: auto
    secure: always

beta_settings:
  cloud_sql_instances: $INSTANCE_CONNECTION_NAME
EOF

# Deploy to App Engine
gcloud app deploy --quiet

echo "🌍 Deploying frontend to App Engine..."
cd ../frontend

# Build the React app
npm run build

# Create app.yaml for frontend
cat > app.yaml << EOF
runtime: nodejs18
service: frontend

handlers:
  - url: /static
    static_dir: build/static
  - url: /(.*\..*)
    static_files: build/\$1
    upload: build/(.*\..*)
  - url: /.*
    static_files: build/index.html
    upload: build/index.html
EOF

# Deploy frontend
gcloud app deploy --quiet

echo "📊 Setting up monitoring and logging..."

# Create log-based metrics for incident detection
gcloud logging metrics create high-cpu-usage \
    --description="High CPU usage detection" \
    --log-filter='resource.type="gae_app" AND textPayload:"CPU stress test activated"'

gcloud logging metrics create memory-leak-detected \
    --description="Memory leak detection" \
    --log-filter='resource.type="gae_app" AND textPayload:"Memory leak simulation started"'

gcloud logging metrics create database-errors \
    --description="Database error detection" \
    --log-filter='resource.type="gae_app" AND severity>=ERROR AND textPayload:"Failed to fetch"'

# Create alerting policies
echo "🚨 Creating alerting policies..."

# CPU Usage Alert
gcloud alpha monitoring policies create \
    --policy-from-file=- << EOF
displayName: "High CPU Usage Alert"
conditions:
  - displayName: "CPU stress test detected"
    conditionThreshold:
      filter: 'resource.type="gae_app" AND metric.type="logging.googleapis.com/log_entry_count"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0
      duration: 0s
      trigger:
        count: 1
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
EOF

# Memory Leak Alert
gcloud alpha monitoring policies create \
    --policy-from-file=- << EOF
displayName: "Memory Leak Detected"
conditions:
  - displayName: "Memory leak simulation detected"
    conditionThreshold:
      filter: 'resource.type="gae_app" AND metric.type="logging.googleapis.com/log_entry_count"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0
      duration: 0s
      trigger:
        count: 1
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
EOF

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application is now deployed at:"
echo "   Frontend: https://frontend-dot-$PROJECT_ID.uc.r.appspot.com"
echo "   Backend:  https://order-api-dot-$PROJECT_ID.uc.r.appspot.com"
echo ""
echo "📊 Monitoring Dashboard:"
echo "   https://console.cloud.google.com/monitoring/dashboards?project=$PROJECT_ID"
echo ""
echo "📝 Logs:"
echo "   https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
echo ""
echo "🔧 To test incident simulation, use the endpoints:"
echo "   POST /api/stress-test - CPU stress test"
echo "   POST /api/memory-leak - Memory leak simulation"
echo "   POST /api/db-overload - Database overload test"
echo ""
echo "📋 Next steps:"
echo "   1. Update the frontend API endpoint to point to your deployed backend"
echo "   2. Test the incident simulation endpoints"
echo "   3. Monitor the logs and metrics in GCP Console"
echo "   4. Create custom dashboards for your specific monitoring needs"
