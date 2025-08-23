# Email Alerting Setup Script for Incident Response Simulation
# This script sets up email notifications for various incidents

param(
    [string]$ProjectId = "incident-sim-1755610221",
    [string]$EmailAddress = "Saadalsaleh87@gmail.com"
)

$ErrorActionPreference = "Stop"

Write-Host "Setting up email alerts for Incident Response Simulation..." -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "Email: $EmailAddress" -ForegroundColor Cyan

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>$null
    if (-not $gcloudVersion) {
        throw "gcloud not found"
    }
} catch {
    Write-Host "gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Set the project
gcloud config set project $ProjectId

Write-Host "Creating notification channels..." -ForegroundColor Yellow

# Create email notification channel
$notificationChannel = @"
type: email
displayName: "Incident Response Alerts"
description: "Email notifications for incident response simulation"
labels:
  email_address: "$EmailAddress"
"@

$notificationChannel | gcloud alpha monitoring channels create --channel-content=-

Write-Host "Creating alerting policies..." -ForegroundColor Yellow

# CPU Stress Alert Policy
$cpuAlertPolicy = @"
displayName: "High CPU Usage Alert - Incident Response"
conditions:
  - displayName: "CPU stress test detected"
    conditionThreshold:
      filter: 'resource.type="gae_app" AND metric.type="logging.googleapis.com/log_entry_count" AND metric.labels.metric_descriptor_name="high-cpu-usage"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0
      duration: 0s
      trigger:
        count: 1
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
alertStrategy:
  autoClose: 300s
notificationChannels:
  - "$EmailAddress"
"@

$cpuAlertPolicy | gcloud alpha monitoring policies create --policy-from-file=-

# Memory Leak Alert Policy
$memoryAlertPolicy = @"
displayName: "Memory Leak Detected - Incident Response"
conditions:
  - displayName: "Memory leak simulation detected"
    conditionThreshold:
      filter: 'resource.type="gae_app" AND metric.type="logging.googleapis.com/log_entry_count" AND metric.labels.metric_descriptor_name="memory-leak-detected"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0
      duration: 0s
      trigger:
        count: 1
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
alertStrategy:
  autoClose: 300s
notificationChannels:
  - "$EmailAddress"
"@

$memoryAlertPolicy | gcloud alpha monitoring policies create --policy-from-file=-

# Database Error Alert Policy
$dbAlertPolicy = @"
displayName: "Database Errors - Incident Response"
conditions:
  - displayName: "Database error detection"
    conditionThreshold:
      filter: 'resource.type="gae_app" AND metric.type="logging.googleapis.com/log_entry_count" AND metric.labels.metric_descriptor_name="database-errors"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0
      duration: 0s
      trigger:
        count: 1
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
alertStrategy:
  autoClose: 300s
notificationChannels:
  - "$EmailAddress"
"@

$dbAlertPolicy | gcloud alpha monitoring policies create --policy-from-file=-

# High Response Time Alert Policy
$responseTimeAlertPolicy = @"
displayName: "High Response Time Alert - Incident Response"
conditions:
  - displayName: "Response time degradation"
    conditionThreshold:
      filter: 'resource.type="gae_app" AND metric.type="appengine.googleapis.com/http/server/response_latencies"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 1000
      duration: 60s
      trigger:
        count: 1
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_PERCENTILE_95
alertStrategy:
  autoClose: 300s
notificationChannels:
  - "$EmailAddress"
"@

$responseTimeAlertPolicy | gcloud alpha monitoring policies create --policy-from-file=-

# High Error Rate Alert Policy
$errorRateAlertPolicy = @"
displayName: "High Error Rate Alert - Incident Response"
conditions:
  - displayName: "Error rate threshold exceeded"
    conditionThreshold:
      filter: 'resource.type="gae_app" AND metric.type="appengine.googleapis.com/http/server/response_count" AND metric.labels.response_code_class="5xx"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 5
      duration: 60s
      trigger:
        count: 1
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
alertStrategy:
  autoClose: 300s
notificationChannels:
  - "$EmailAddress"
"@

$errorRateAlertPolicy | gcloud alpha monitoring policies create --policy-from-file=-

Write-Host "Email alerting setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Alerts configured for:" -ForegroundColor Cyan
Write-Host "  ✅ CPU Stress Detection" -ForegroundColor White
Write-Host "  ✅ Memory Leak Detection" -ForegroundColor White
Write-Host "  ✅ Database Error Detection" -ForegroundColor White
Write-Host "  ✅ High Response Time (>1s)" -ForegroundColor White
Write-Host "  ✅ High Error Rate (>5 errors/sec)" -ForegroundColor White
Write-Host ""
Write-Host "Email notifications will be sent to: $EmailAddress" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test alerts:" -ForegroundColor Yellow
Write-Host "  1. Trigger incidents from the frontend" -ForegroundColor White
Write-Host "  2. Check your email for notifications" -ForegroundColor White
Write-Host "  3. View alerts in GCP Console" -ForegroundColor White
Write-Host ""
Write-Host "GCP Console Links:" -ForegroundColor Cyan
Write-Host "  Monitoring: https://console.cloud.google.com/monitoring?project=$ProjectId" -ForegroundColor White
Write-Host "  Alerting: https://console.cloud.google.com/monitoring/alerting?project=$ProjectId" -ForegroundColor White
