#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."

# Use Node.js script for better compatibility with absolute path
node /app/docker-scripts/wait-for-db.js

if [ $? -eq 0 ]; then
  echo "Database is ready - proceeding with startup"
  
  # Run database migrations
  echo "Running database migrations..."
  npm run db:migrate
  
  # Start the application
  echo "Starting application..."
  npm start
else
  echo "Database connection failed - exiting"
  exit 1
fi
