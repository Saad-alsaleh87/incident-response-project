# Incident Response Testing Script (PowerShell)
# This script tests various failure scenarios to validate monitoring and alerting

param(
    [string]$ApiBaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

$LogFile = "incident-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

Write-Host "🚨 Starting Incident Response Testing..." -ForegroundColor Green
Write-Host "📝 Logging to: $LogFile" -ForegroundColor Cyan
Write-Host "🌐 API Base URL: $ApiBaseUrl" -ForegroundColor Cyan
Write-Host ""

# Function to log messages
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

# Function to make API calls
function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = ""
    )
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri "$ApiBaseUrl$Endpoint" -Method $Method -ErrorAction Stop
        } else {
            $headers = @{
                "Content-Type" = "application/json"
            }
            $response = Invoke-RestMethod -Uri "$ApiBaseUrl$Endpoint" -Method $Method -Headers $headers -Body $Data -ErrorAction Stop
        }
        return $response
    } catch {
        Write-Log "API call failed: $($_.Exception.Message)"
        return $null
    }
}

# Test 1: Baseline Health Check
Write-Log "🔍 Test 1: Baseline Health Check"
Write-Log "Checking system health before incident simulation..."
$healthResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/health"
if ($healthResponse) {
    Write-Log "Health Response: $($healthResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Health check failed"
}
Write-Host ""

# Test 2: CPU Stress Test
Write-Log "🔥 Test 2: CPU Stress Test"
Write-Log "Activating CPU stress test for 30 seconds..."
$stressResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/stress-test"
if ($stressResponse) {
    Write-Log "Stress Test Response: $($stressResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Stress test failed to start"
}
Write-Log "Waiting for stress test to complete..."
Start-Sleep -Seconds 35
Write-Log "CPU stress test completed"
Write-Host ""

# Test 3: Memory Leak Simulation
Write-Log "💾 Test 3: Memory Leak Simulation"
Write-Log "Starting memory leak simulation..."
$leakResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/memory-leak"
if ($leakResponse) {
    Write-Log "Memory Leak Response: $($leakResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Memory leak failed to start"
}
Write-Log "Allowing memory leak to grow for 10 seconds..."
Start-Sleep -Seconds 10
Write-Log "Stopping memory leak simulation..."
$stopLeakResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/memory-leak"
if ($stopLeakResponse) {
    Write-Log "Stop Leak Response: $($stopLeakResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Failed to stop memory leak"
}
Write-Host ""

# Test 4: Database Overload Test
Write-Log "🗄️ Test 4: Database Overload Test"
Write-Log "Testing database with concurrent queries..."
$dbResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/db-overload"
if ($dbResponse) {
    Write-Log "Database Overload Response: $($dbResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Database overload test failed"
}
Write-Host ""

# Test 5: Metrics Collection
Write-Log "📊 Test 5: Metrics Collection"
Write-Log "Collecting system metrics..."
$metricsResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/metrics"
if ($metricsResponse) {
    Write-Log "Metrics Response: $($metricsResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Metrics collection failed"
}
Write-Host ""

# Test 6: Advanced CPU Stress (Admin)
Write-Log "⚡ Test 6: Advanced CPU Stress (Admin)"
Write-Log "Starting advanced CPU stress test for 2 minutes..."
$advancedStressData = '{"duration": 120000}'
$advancedStressResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/admin/cpu-stress" -Data $advancedStressData
if ($advancedStressResponse) {
    Write-Log "Advanced Stress Response: $($advancedStressResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Advanced stress test failed to start"
}
Write-Log "Waiting for advanced stress test to complete..."
Start-Sleep -Seconds 125
Write-Host ""

# Test 7: Advanced Memory Leak (Admin)
Write-Log "🧠 Test 7: Advanced Memory Leak (Admin)"
Write-Log "Starting advanced memory leak test..."
$advancedLeakData = '{"size": 5, "interval": 1000, "duration": 60000}'
$advancedLeakResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/admin/memory-leak" -Data $advancedLeakData
if ($advancedLeakResponse) {
    Write-Log "Advanced Leak Response: $($advancedLeakResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Advanced memory leak failed to start"
}
Write-Log "Allowing memory leak to grow for 30 seconds..."
Start-Sleep -Seconds 30
Write-Log "Clearing memory leak..."
$clearResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/admin/clear-memory"
if ($clearResponse) {
    Write-Log "Clear Memory Response: $($clearResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Failed to clear memory leak"
}
Write-Host ""

# Test 8: Database Connection Stress (Admin)
Write-Log "🔌 Test 8: Database Connection Stress (Admin)"
Write-Log "Testing database with multiple connections..."
$dbStressData = '{"connections": 20, "duration": 60000}'
$dbStressResponse = Invoke-ApiCall -Method "POST" -Endpoint "/api/admin/db-stress" -Data $dbStressData
if ($dbStressResponse) {
    Write-Log "DB Stress Response: $($dbStressResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Database stress test failed to start"
}
Write-Log "Waiting for database stress test to complete..."
Start-Sleep -Seconds 65
Write-Host ""

# Test 9: Final Health Check
Write-Log "🔍 Test 9: Final Health Check"
Write-Log "Checking system health after all tests..."
$finalHealthResponse = Invoke-ApiCall -Method "GET" -Endpoint "/api/health/detailed"
if ($finalHealthResponse) {
    Write-Log "Final Health Response: $($finalHealthResponse | ConvertTo-Json -Compress)"
} else {
    Write-Log "Final health check failed"
}
Write-Host ""

# Test 10: Log Analysis
Write-Log "📝 Test 10: Log Analysis"
Write-Log "Checking recent logs for incident detection..."
Write-Log "This step should be done manually in GCP Console or via gcloud CLI"
Write-Host ""

# Summary
Write-Log "✅ Incident Response Testing Completed!"
Write-Host ""
Write-Log "📋 Test Summary:"
Write-Log "   ✓ Baseline Health Check"
Write-Log "   ✓ CPU Stress Test (30s)"
Write-Log "   ✓ Memory Leak Simulation (10s)"
Write-Log "   ✓ Database Overload Test"
Write-Log "   ✓ Metrics Collection"
Write-Log "   ✓ Advanced CPU Stress (2min)"
Write-Log "   ✓ Advanced Memory Leak (30s)"
Write-Log "   ✓ Database Connection Stress (1min)"
Write-Log "   ✓ Final Health Check"
Write-Host ""
Write-Log "🔍 Next Steps:"
Write-Log "   1. Check GCP Monitoring for alerts and metrics"
Write-Log "   2. Review logs in GCP Console"
Write-Log "   3. Analyze incident response dashboard"
Write-Log "   4. Document findings in incident response report"
Write-Host ""
Write-Log "📊 Monitoring Dashboard: Check GCP Console for real-time metrics"
Write-Log "🚨 Alerts: Verify alerting policies are working"
Write-Log "📝 Logs: Review structured logs for incident details"

Write-Host "🎯 Testing completed! Check the log file: $LogFile" -ForegroundColor Green
Write-Host "🌐 Monitor your application in GCP Console" -ForegroundColor Cyan
Write-Host "📊 Use the monitoring dashboard to track system behavior" -ForegroundColor Cyan
