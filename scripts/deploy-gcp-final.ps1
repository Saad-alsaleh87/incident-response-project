# GCP Deployment Script for Incident Response Simulation (PowerShell) - Final Version
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

Write-Host "Using project: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan

# Set the project
gcloud config set project $ProjectId

Write-Host "Enabling required APIs..." -ForegroundColor Yellow
# Enable APIs one by one to avoid permission issues
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable cloudresourcemanager.googleapis.com --quiet
gcloud services enable compute.googleapis.com --quiet
gcloud services enable sqladmin.googleapis.com --quiet
gcloud services enable appengine.googleapis.com --quiet
gcloud services enable logging.googleapis.com --quiet
gcloud services enable monitoring.googleapis.com --quiet

# Create App Engine application first (if it doesn't exist)
Write-Host "Checking App Engine application..." -ForegroundColor Yellow
try {
    gcloud app describe --quiet 2>$null
    Write-Host "App Engine application already exists" -ForegroundColor Green
} catch {
    Write-Host "Creating App Engine application..." -ForegroundColor Yellow
    gcloud app create --region=$Region --quiet
}

# Create Cloud SQL instance (if it doesn't exist)
Write-Host "Checking Cloud SQL instance..." -ForegroundColor Yellow
try {
    gcloud sql instances describe incident-response-db --quiet 2>$null
    Write-Host "Cloud SQL instance already exists" -ForegroundColor Green
} catch {
    Write-Host "Creating Cloud SQL instance..." -ForegroundColor Yellow
    gcloud sql instances create incident-response-db --database-version=POSTGRES_14 --tier=db-f1-micro --zone="$Region-a" --storage-type=SSD --storage-size=10GB --backup-start-time="02:00" --maintenance-window-day=SUN --maintenance-window-hour=03 --availability-type=zonal --root-password="SecurePass123!" --quiet
}

# Create database (if it doesn't exist)
Write-Host "Checking database..." -ForegroundColor Yellow
try {
    gcloud sql databases describe incident_response_db --instance=incident-response-db --quiet 2>$null
    Write-Host "Database already exists" -ForegroundColor Green
} catch {
    Write-Host "Creating database..." -ForegroundColor Yellow
    gcloud sql databases create incident_response_db --instance=incident-response-db --quiet
}

# Create database user (if it doesn't exist)
Write-Host "Checking database user..." -ForegroundColor Yellow
try {
    gcloud sql users describe app_user --instance=incident-response-db --quiet 2>$null
    Write-Host "Database user already exists" -ForegroundColor Green
} catch {
    Write-Host "Creating database user..." -ForegroundColor Yellow
    gcloud sql users create app_user --instance=incident-response-db --password="AppUserPass123!" --quiet
}

Write-Host "Getting instance connection name..." -ForegroundColor Yellow
$InstanceConnectionName = gcloud sql instances describe incident-response-db --format="value(connectionName)"

Write-Host "Instance connection name: $InstanceConnectionName" -ForegroundColor Green

# Deploy backend first (as default service)
Write-Host "Deploying backend to App Engine (as default service)..." -ForegroundColor Yellow
Set-Location backend

# Create app.yaml with the correct instance connection name
$appYaml = @"
runtime: nodejs20
service: default

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

# Now deploy frontend as a separate service
Write-Host "Deploying frontend to App Engine..." -ForegroundColor Yellow
Set-Location ../frontend

# Install frontend dependencies first
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

# Build the React app
Write-Host "Building React application..." -ForegroundColor Yellow
npm run build

# Create app.yaml for frontend
$frontendAppYaml = @"
runtime: nodejs20
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

Write-Host "Setting up basic monitoring..." -ForegroundColor Yellow

# Create simple log-based metrics for incident detection
try {
    gcloud logging metrics create high-cpu-usage --description="High CPU usage detection" --log-filter="resource.type=`"gae_app`" AND textPayload:`"CPU stress test activated`"" --quiet
    Write-Host "Created high-cpu-usage metric" -ForegroundColor Green
} catch {
    Write-Host "Could not create high-cpu-usage metric" -ForegroundColor Yellow
}

try {
    gcloud logging metrics create memory-leak-detected --description="Memory leak detection" --log-filter="resource.type=`"gae_app`" AND textPayload:`"Memory leak simulation started`"" --quiet
    Write-Host "Created memory-leak-detected metric" -ForegroundColor Green
} catch {
    Write-Host "Could not create memory-leak-detected metric" -ForegroundColor Yellow
}

Set-Location ..

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now deployed at:" -ForegroundColor Cyan
Write-Host "   Frontend: https://frontend-dot-$ProjectId.uc.r.appspot.com" -ForegroundColor White
Write-Host "   Backend:  https://$ProjectId.uc.r.appspot.com" -ForegroundColor White
Write-Host ""
Write-Host "Monitoring Dashboard:" -ForegroundColor Cyan
Write-Host "   https://console.cloud.google.com/monitoring/dashboards?project=$ProjectId" -ForegroundColor White
Write-Host ""
Write-Host "Logs:" -ForegroundColor Cyan
Write-Host "   https://console.cloud.google.com/logs/query?project=$ProjectId" -ForegroundColor White
Write-Host ""
Write-Host "To test incident simulation, use the endpoints:" -ForegroundColor Cyan
Write-Host "   POST https://$ProjectId.uc.r.appspot.com/api/stress-test - CPU stress test" -ForegroundColor White
Write-Host "   POST https://$ProjectId.uc.r.appspot.com/api/memory-leak - Memory leak simulation" -ForegroundColor White
Write-Host "   POST https://$ProjectId.uc.r.appspot.com/api/db-overload - Database overload test" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test the incident simulation endpoints" -ForegroundColor White
Write-Host "   2. Monitor the logs and metrics in GCP Console" -ForegroundColor White
Write-Host "   3. Create custom dashboards for your specific monitoring needs" -ForegroundColor White
Write-Host "   4. Complete your incident response report" -ForegroundColor White
