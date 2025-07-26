#!/bin/bash

# Deployment Diagnostic Script for Render
# This script helps verify the deployment configuration

echo "🔍 Render Deployment Diagnostic Script"
echo "======================================"

# Check if we're in a Render environment
if [ -n "$RENDER" ]; then
    echo "✅ Running in Render environment"
else
    echo "ℹ️ Running locally"
fi

# Check port configuration
echo ""
echo "📡 Port Configuration:"
echo "PORT environment variable: ${PORT:-'not set (using 7000)'}"

# Check Node.js version
echo ""
echo "🟢 Node.js Version:"
node --version

# Check npm version
echo ""
echo "📦 NPM Version:"
npm --version

# Check if dist directory exists
echo ""
echo "📁 Build Check:"
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    ls -la dist/
else
    echo "❌ dist directory missing - run 'npm run build'"
fi

# Check if health check endpoint is accessible
echo ""
echo "🩺 Health Check Test:"
if command -v curl &> /dev/null; then
    if [ -n "$PORT" ]; then
        curl -f "http://localhost:${PORT}/api/health" && echo "✅ Health check responding" || echo "❌ Health check failed"
    else
        curl -f "http://localhost:7000/api/health" && echo "✅ Health check responding" || echo "❌ Health check failed"
    fi
else
    echo "curl not available - skipping health check test"
fi

# Check environment variables
echo ""
echo "🔐 Environment Variables:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "DATABASE_URL: ${DATABASE_URL:-'not set'}"

echo ""
echo "🎯 Diagnostic Complete!"
