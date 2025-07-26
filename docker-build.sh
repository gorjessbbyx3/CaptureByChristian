#!/bin/sh

# Robust Docker build script for Render deployment
# This script handles npm ci failures gracefully

echo "🔧 Starting robust Docker build process..."

# Update package-lock.json if needed
echo "📦 Updating package-lock.json..."
npm install --package-lock-only

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Verify package-lock.json is in sync
echo "✅ Verifying package-lock.json sync..."
npm ls --depth=0 || echo "⚠️ Some packages may have version mismatches"

echo "🚀 Build ready for Docker deployment!"
echo "The package-lock.json has been updated to match package.json"
