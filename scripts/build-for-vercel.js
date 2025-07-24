#!/usr/bin/env node
/**
 * Build script for Vercel deployment
 * This script prepares the project for deployment to Vercel
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

function log(message) {
  console.log(`[BUILD] ${message}`);
}

function executeCommand(command, description) {
  log(`${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: projectRoot 
    });
    log(`${description} completed successfully!`);
  } catch (error) {
    log(`${description} failed: ${error.message}`);
    process.exit(1);
  }
}

async function buildForVercel() {
  log('Starting Vercel build process...');
  
  // Check if we're in a Vercel environment
  const isVercel = process.env.VERCEL === '1';
  log(`Building for ${isVercel ? 'Vercel' : 'local'} environment`);
  
  // Build the frontend
  executeCommand('npm run build', 'Building frontend');
  
  // Verify the build output
  const distPath = resolve(projectRoot, 'dist');
  const publicPath = resolve(distPath, 'public');
  
  if (fs.existsSync(publicPath)) {
    log('Frontend build output verified in dist/public/');
  } else {
    log('Warning: Expected build output not found in dist/public/');
  }
  
  // List the contents of the dist directory
  if (fs.existsSync(distPath)) {
    const distContents = fs.readdirSync(distPath);
    log(`Dist contents: ${distContents.join(', ')}`);
    
    if (fs.existsSync(publicPath)) {
      const publicContents = fs.readdirSync(publicPath);
      log(`Public contents: ${publicContents.join(', ')}`);
    }
  }
  
  log('Vercel build process completed successfully!');
}

buildForVercel().catch(error => {
  log(`Build failed: ${error.message}`);
  process.exit(1);
});