#!/usr/bin/env node

import { Client } from 'pg';
import { setTimeout } from 'timers/promises';

const maxRetries = 30;
const retryDelay = 2000; // 2 seconds

async function waitForDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempting database connection... (${i + 1}/${maxRetries})`);
      await client.connect();
      await client.query('SELECT 1');
      console.log('Database is ready!');
      await client.end();
      process.exit(0);
    } catch (error) {
      console.log(`Database not ready: ${error.message}`);
      await setTimeout(retryDelay);
    }
  }

  console.error('Database connection failed after maximum retries');
  process.exit(1);
}

waitForDatabase();
