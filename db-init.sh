#!/bin/bash

# Database initialization script for Render deployment
# This script runs database migrations and seeds initial data

set -e

echo "🗄️  Starting database initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until pg_isready -h $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1) -p $(echo $DATABASE_URL | grep -o ':[0-9]*/' | tr -d ':/' || echo 5432); do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:push

# Check if we need to seed initial data
echo "🌱 Checking for initial data..."
node -e "
const { db } = require('./dist/server/db.js');
const { profiles } = require('./dist/shared/schema.js');

async function checkAndSeed() {
  try {
    const existingProfiles = await db.select().from(profiles).limit(1);
    if (existingProfiles.length === 0) {
      console.log('No profiles found, seeding initial data...');
      process.exit(1); // Exit with code 1 to trigger seeding
    } else {
      console.log('✅ Initial data already exists');
      process.exit(0);
    }
  } catch (error) {
    console.log('Error checking data, will seed:', error.message);
    process.exit(1);
  }
}

checkAndSeed();
" || {
  echo "🌱 Seeding initial data..."
  npm run db:seed || echo "⚠️  Seeding failed or not available"
}

echo "✅ Database initialization complete!"
