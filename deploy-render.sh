#!/bin/bash

# Render Deployment Script for Captured by Christian
# This script prepares the application for Render deployment

set -e

echo "🚀 Preparing Captured by Christian for Render deployment..."

# Create production build
echo "📦 Building application..."
npm run build

# Create production Docker image
echo "🐳 Building Docker image..."
docker build -f Dockerfile.render -t capturedbychristian:latest .

# Test the Docker image locally
echo "🧪 Testing Docker image..."
docker run -d -p 7000:7000 --name capturedbychristian-test capturedbychristian:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Test health endpoint
echo "🔍 Testing health endpoint..."
curl -f http://localhost:7000/api/health || {
    echo "❌ Health check failed"
    docker logs capturedbychristian-test
    docker stop capturedbychristian-test
    docker rm capturedbychristian-test
    exit 1
}

echo "✅ Health check passed!"

# Clean up test container
docker stop capturedbychristian-test
docker rm capturedbychristian-test

# Create deployment package
echo "📋 Creating deployment package..."
tar -czf render-deployment.tar.gz \
    Dockerfile.render \
    render-production.yaml \
    .env.render \
    package*.json \
    server/ \
    client/ \
    shared/ \
    migrations/ \
    docker-scripts/ \
    drizzle.config.ts \
    tsconfig*.json \
    vite.config.ts

echo "✅ Deployment package created: render-deployment.tar.gz"
echo ""
echo "🎯 Ready for Render deployment!"
echo ""
echo "Next steps:"
echo "1. Upload render-deployment.tar.gz to Render"
echo "2. Use render-production.yaml as your render.yaml"
echo "3. Configure environment variables in Render dashboard"
echo "4. Deploy! 🚀"
