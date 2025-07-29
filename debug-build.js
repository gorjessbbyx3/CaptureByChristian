#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Debugging build process...');
console.log('📁 Current working directory:', process.cwd());
console.log('📋 Contents of current directory:');

try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    const stat = fs.statSync(file);
    console.log(`  ${stat.isDirectory() ? '📁' : '📄'} ${file}`);
  });
} catch (error) {
  console.error('❌ Error reading directory:', error);
}

console.log('\n🔍 Checking for dist directory...');
if (fs.existsSync('dist')) {
  console.log('✅ dist/ directory exists');
  try {
    const distFiles = fs.readdirSync('dist');
    console.log('📋 Contents of dist/:');
    distFiles.forEach(file => {
      const fullPath = path.join('dist', file);
      const stat = fs.statSync(fullPath);
      console.log(`  ${stat.isDirectory() ? '📁' : '📄'} ${file}`);
    });
  } catch (error) {
    console.error('❌ Error reading dist directory:', error);
  }
} else {
  console.log('❌ dist/ directory does not exist');
}

console.log('\n🔍 Checking for dist/index.js specifically...');
if (fs.existsSync('dist/index.js')) {
  console.log('✅ dist/index.js exists');
  const stat = fs.statSync('dist/index.js');
  console.log(`📏 File size: ${stat.size} bytes`);
} else {
  console.log('❌ dist/index.js does not exist');
}

console.log('\n🔍 Environment variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);
console.log(`PWD: ${process.env.PWD}`);