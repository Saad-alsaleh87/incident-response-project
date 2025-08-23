# GCP Deployment Script for Incident Response Simulation (PowerShell)
# This script deploys the 3-tier application to Google Cloud Platform

param(
    [string]$ProjectId = "your-project-id",
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting GCP deployment for Incident Response Simulation..." -ForegroundColor Green

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>$null
    if (-not $gcloudVersion) {
        throw "gcloud not found"
    }
} catch {
    Write-Host "gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
try {
    $authStatus = gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>$null
    if (-not $authStatus) {
        throw "Not authenticated"
    }
} catch {
    Write-Host "Not authenticated with gcloud. Please run: gcloud auth login" -ForegroundColor Red
    exit 1
}

$Zone = "$Region-a"

Write-Host "Using project: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Zone: $Zone" -ForegroundColor Cyan

# Set the project
gcloud config set project $ProjectId

Write-Host "Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com cloudresourcemanager.googleapis.com compute.googleapis.com sqladmin.googleapis.com appengine.googleapis.com logging.googleapis.com monitoring.googleapis.com errorreporting.googleapis.com

Write-Host "Creating Cloud SQL instance..." -ForegroundColor Yellow
gcloud sql instances create incident-response-db --database-version=POSTGRES_14 --tier=db-f1-micro --region=$Region --storage-type=SSD --storage-size=10GB --backup-start-time="02:00" --maintenance-window-day=SUN --maintenance-window-hour=03 --availability-type=zonal --zone=$Zone --root-password="SecurePass123!" --quiet

Write-Host "Creating database..." -ForegroundColor Yellow
gcloud sql databases create incident_response_db --instance=incident-response-db --quiet

Write-Host "Creating database user..." -ForegroundColor Yellow
gcloud sql users create app_user --instance=incident-response-db --password="AppUserPass123!" --quiet

Write-Host "Getting instance connection name..." -ForegroundColor Yellow
$InstanceConnectionName = gcloud sql instances describe incident-response-db --format="value(connectionName)"

Write-Host "Instance connection name: $InstanceConnectionName" -ForegroundColor Green

Write-Host "Deploying backend to App Engine..." -ForegroundColor Yellow
Set-Location backend

# Create app.yaml with the correct instance connection name
$appYaml = @"
runtime: nodejs18
service: order-api

env_variables:
  NODE_ENV: production
  PORT: 8080
  INSTANCE_CONNECTION_NAME: $InstanceConnectionName
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
  cloud_sql_instances: $InstanceConnectionName
"@

$appYaml | Out-File -FilePath "app.yaml" -Encoding UTF8

# Deploy to App Engine
gcloud app deploy --quiet

Write-Host "Deploying frontend to App Engine..." -ForegroundColor Yellow
Set-Location ../frontend

# Build the React app
npm run build

# Create app.yaml for frontend
$frontendAppYaml = @"
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
"@

$frontendAppYaml | Out-File -FilePath "app.yaml" -Encoding UTF8

# Deploy frontend
gcloud app deploy --quiet

Write-Host "Setting up monitoring and logging..." -ForegroundColor Yellow

# Create log-based metrics for incident detection
gcloud logging metrics create high-cpu-usage --description="High CPU usage detection" --log-filter='resource.type="gae_app" AND textPayload:"CPU stress test activated"'

gcloud logging metrics create memory-leak-detected --description="Memory leak detection" --log-filter='resource.type="gae_app" AND textPayload:"Memory leak simulation started"'

gcloud logging metrics create database-errors --description="Database error detection" --log-filter='resource.type="gae_app" AND severity>=ERROR AND textPayload:"Failed to fetch"'

# Create alerting policies
Write-Host "Creating alerting policies..." -ForegroundColor Yellow

# CPU Usage Alert
$cpuAlertPolicy = @"
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
"@

$cpuAlertPolicy | gcloud alpha monitoring policies create --policy-from-file=-

# Memory Leak Alert
$memoryAlertPolicy = @"
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
"@

$memoryAlertPolicy | gcloud alpha monitoring policies create --policy-from-file=-

Set-Location ..

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now deployed at:" -ForegroundColor Cyan
Write-Host "   Frontend: https://frontend-dot-$ProjectId.uc.r.appspot.com" -ForegroundColor White
Write-Host "   Backend:  https://order-api-dot-$ProjectId.uc.r.appspot.com" -ForegroundColor White
Write-Host ""
Write-Host "Monitoring Dashboard:" -ForegroundColor Cyan
Write-Host "   https://console.cloud.google.com/monitoring/dashboards?project=$ProjectId" -ForegroundColor White
Write-Host ""
Write-Host "Logs:" -ForegroundColor Cyan
Write-Host "   https://console.cloud.google.com/logs/query?project=$ProjectId" -ForegroundColor White
Write-Host ""
Write-Host "To test incident simulation, use the endpoints:" -ForegroundColor Cyan
Write-Host "   POST /api/stress-test - CPU stress test" -ForegroundColor White
Write-Host "   POST /api/memory-leak - Memory leak simulation" -ForegroundColor White
Write-Host "   POST /api/db-overload - Database overload test" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update the frontend API endpoint to point to your deployed backend" -ForegroundColor White
Write-Host "   2. Test the incident simulation endpoints" -ForegroundColor White
Write-Host "   3. Monitor the logs and metrics in GCP Console" -ForegroundColor White
Write-Host "   4. Create custom dashboards for your specific monitoring needs" -ForegroundColor White
