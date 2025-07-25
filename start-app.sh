#!/bin/bash

echo "🚀 Starting CaptureByChristian Application..."

# Set environment variables for Docker network
export DATABASE_URL=postgresql://postgres:secure_password_123@database:5432/capturedcollective
export NODE_ENV=development
export PORT=7000

echo "🔧 Environment configured:"
echo "  DATABASE_URL: $DATABASE_URL"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"

# Run with tsx
echo "🌟 Starting application with TypeScript execution..."
exec npx tsx server/index.ts