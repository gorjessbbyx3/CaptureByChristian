#!/bin/bash

# CaptureByChristian Docker Startup Script
# This script ensures proper environment configuration for Docker deployment

echo "🐳 Starting CaptureByChristian with Docker..."

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo "❌ .env.docker file not found. Please create it with your configuration."
    exit 1
fi

# Copy Docker environment configuration
echo "📋 Using Docker environment configuration..."
cp .env.docker .env

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Build and start containers
echo "🚀 Building and starting containers..."
docker compose up --build

echo "✅ CaptureByChristian should now be running on http://localhost:5000"