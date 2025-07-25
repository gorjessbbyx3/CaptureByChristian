#!/bin/sh

# CapturedCCollective Container Startup Script

echo "🚀 Starting CapturedCCollective application..."

# Create necessary directories
mkdir -p uploads logs

# Wait a moment for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Start the application
echo "🌟 Starting Node.js application with automated database initialization..."
exec npm start