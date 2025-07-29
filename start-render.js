#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting Render deployment process...');

// Ensure we build if dist doesn't exist
if (!fs.existsSync('dist/index.js')) {
  console.log('🔨 dist/index.js not found, running build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ dist/index.js exists, skipping build');
}

// Verify the file exists after build
if (!fs.existsSync('dist/index.js')) {
  console.error('❌ dist/index.js still not found after build');
  console.log('📁 Current directory contents:');
  try {
    const files = fs.readdirSync('.');
    files.forEach(file => console.log(`  - ${file}`));
  } catch (e) {
    console.error('Failed to read directory');
  }
  process.exit(1);
}

console.log('🎯 Starting application...');
try {
  // Import and run the main application
  await import('./dist/index.js');
} catch (error) {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
}