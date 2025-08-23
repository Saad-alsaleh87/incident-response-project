#!/bin/bash

# Incident Response Testing Script
# This script tests various failure scenarios to validate monitoring and alerting

set -e

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"
LOG_FILE="incident-test-$(date +%Y%m%d-%H%M%S).log"

echo "🚨 Starting Incident Response Testing..."
echo "📝 Logging to: $LOG_FILE"
echo "🌐 API Base URL: $API_BASE_URL"
echo ""

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to make API calls
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code" -X "$method" -H "Content-Type: application/json" -d "$data" "$API_BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "$body"
    return $http_code
}

# Test 1: Baseline Health Check
log "🔍 Test 1: Baseline Health Check"
log "Checking system health before incident simulation..."
health_response=$(api_call "GET" "/api/health")
log "Health Response: $health_response"
echo ""

# Test 2: CPU Stress Test
log "🔥 Test 2: CPU Stress Test"
log "Activating CPU stress test for 30 seconds..."
stress_response=$(api_call "POST" "/api/stress-test" "")
log "Stress Test Response: $stress_response"
log "Waiting for stress test to complete..."
sleep 35
log "CPU stress test completed"
echo ""

# Test 3: Memory Leak Simulation
log "💾 Test 3: Memory Leak Simulation"
log "Starting memory leak simulation..."
leak_response=$(api_call "POST" "/api/memory-leak" "")
log "Memory Leak Response: $leak_response"
log "Allowing memory leak to grow for 10 seconds..."
sleep 10
log "Stopping memory leak simulation..."
stop_leak_response=$(api_call "POST" "/api/memory-leak" "")
log "Stop Leak Response: $stop_leak_response"
echo ""

# Test 4: Database Overload Test
log "🗄️ Test 4: Database Overload Test"
log "Testing database with concurrent queries..."
db_response=$(api_call "POST" "/api/db-overload" "")
log "Database Overload Response: $db_response"
echo ""

# Test 5: Metrics Collection
log "📊 Test 5: Metrics Collection"
log "Collecting system metrics..."
metrics_response=$(api_call "GET" "/api/metrics")
log "Metrics Response: $metrics_response"
echo ""

# Test 6: Advanced CPU Stress (Admin)
log "⚡ Test 6: Advanced CPU Stress (Admin)"
log "Starting advanced CPU stress test for 2 minutes..."
advanced_stress_response=$(api_call "POST" "/api/admin/cpu-stress" '{"duration": 120000}')
log "Advanced Stress Response: $advanced_stress_response"
log "Waiting for advanced stress test to complete..."
sleep 125
echo ""

# Test 7: Advanced Memory Leak (Admin)
log "🧠 Test 7: Advanced Memory Leak (Admin)"
log "Starting advanced memory leak test..."
advanced_leak_response=$(api_call "POST" "/api/admin/memory-leak" '{"size": 5, "interval": 1000, "duration": 60000}')
log "Advanced Leak Response: $advanced_leak_response"
log "Allowing memory leak to grow for 30 seconds..."
sleep 30
log "Clearing memory leak..."
clear_response=$(api_call "POST" "/api/admin/clear-memory" "")
log "Clear Memory Response: $clear_response"
echo ""

# Test 8: Database Connection Stress (Admin)
log "🔌 Test 8: Database Connection Stress (Admin)"
log "Testing database with multiple connections..."
db_stress_response=$(api_call "POST" "/api/admin/db-stress" '{"connections": 20, "duration": 60000}')
log "DB Stress Response: $db_stress_response"
log "Waiting for database stress test to complete..."
sleep 65
echo ""

# Test 9: Final Health Check
log "🔍 Test 9: Final Health Check"
log "Checking system health after all tests..."
final_health_response=$(api_call "GET" "/api/health/detailed")
log "Final Health Response: $final_health_response"
echo ""

# Test 10: Log Analysis
log "📝 Test 10: Log Analysis"
log "Checking recent logs for incident detection..."
log "This step should be done manually in GCP Console or via gcloud CLI"
echo ""

# Summary
log "✅ Incident Response Testing Completed!"
log ""
log "📋 Test Summary:"
log "   ✓ Baseline Health Check"
log "   ✓ CPU Stress Test (30s)"
log "   ✓ Memory Leak Simulation (10s)"
log "   ✓ Database Overload Test"
log "   ✓ Metrics Collection"
log "   ✓ Advanced CPU Stress (2min)"
log "   ✓ Advanced Memory Leak (30s)"
log "   ✓ Database Connection Stress (1min)"
log "   ✓ Final Health Check"
log ""
log "🔍 Next Steps:"
log "   1. Check GCP Monitoring for alerts and metrics"
log "   2. Review logs in GCP Console"
log "   3. Analyze incident response dashboard"
log "   4. Document findings in incident response report"
log ""
log "📊 Monitoring Dashboard: Check GCP Console for real-time metrics"
log "🚨 Alerts: Verify alerting policies are working"
log "📝 Logs: Review structured logs for incident details"

echo "🎯 Testing completed! Check the log file: $LOG_FILE"
echo "🌐 Monitor your application in GCP Console"
echo "📊 Use the monitoring dashboard to track system behavior"
