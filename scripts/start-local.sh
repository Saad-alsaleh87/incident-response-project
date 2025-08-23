#!/bin/bash

# Local Development Startup Script
# This script starts the incident response simulation locally

set -e

echo "🚀 Starting Incident Response Simulation locally..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is running (for local development)
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL is not running on localhost:5432"
    echo "   You can start it manually or use Docker:"
    echo "   docker run --name postgres -e POSTGRES_PASSWORD=securepass123 -p 5432:5432 -d postgres:14"
    echo ""
    echo "   Or continue without database (some features won't work)"
    read -p "Continue without database? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend environment file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

# Start backend server
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:8080/api/health &> /dev/null; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Backend started successfully on http://localhost:8080"

# Start frontend
echo "🌐 Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Frontend started successfully on http://localhost:3000"
echo ""
echo "🎯 Your application is now running locally!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "📊 Health Check: http://localhost:8080/api/health"
echo "📈 Metrics: http://localhost:8080/api/metrics"
echo ""
echo "🧪 Test Incident Simulation Endpoints:"
echo "   POST http://localhost:8080/api/stress-test - CPU stress test"
echo "   POST http://localhost:8080/api/memory-leak - Memory leak simulation"
echo "   POST http://localhost:8080/api/db-overload - Database overload test"
echo ""
echo "🚨 Advanced Admin Endpoints:"
echo "   POST http://localhost:8080/api/admin/cpu-stress - Advanced CPU stress"
echo "   POST http://localhost:8080/api/admin/memory-leak - Advanced memory leak"
echo "   POST http://localhost:8080/api/admin/db-stress - Database connection stress"
echo ""
echo "📝 To stop the application, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait
