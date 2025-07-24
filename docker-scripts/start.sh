#!/bin/bash

# CapturedCCollective Docker Startup Script

echo "🚀 Starting CapturedCCollective..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from .env.docker template..."
    cp .env.docker .env
    echo "✅ Please edit .env file with your actual API keys before running again"
    exit 1
fi

# Create necessary directories
mkdir -p uploads logs ssl

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

# Show logs
echo "📝 Recent logs:"
docker-compose logs --tail=20

echo "✅ CapturedCCollective is running!"
echo "🌐 Access the application at: http://localhost:5000"
echo "📊 Database is available at: localhost:5432"
echo ""
echo "Commands:"
echo "  docker-compose logs -f app     # View app logs"
echo "  docker-compose logs -f database # View database logs"
echo "  docker-compose down           # Stop services"
echo "  docker-compose restart       # Restart services"