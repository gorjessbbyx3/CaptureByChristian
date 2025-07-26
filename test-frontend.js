// Simple test script to check frontend components without database
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Starting Frontend Component Testing...');

// Test 1: Check if all required files exist
const requiredFiles = [
  'client/src/App.tsx',
  'client/src/main.tsx',
  'client/src/pages/home.tsx',
  'client/src/pages/admin.tsx',
  'client/src/pages/booking.tsx',
  'client/src/pages/client-portal.tsx',
  'client/src/components/navigation.tsx',
  'client/src/lib/api.ts',
  'client/src/hooks/useAuth.ts'
];

import { existsSync } from 'fs';

console.log('\n📁 Checking required files...');
let allFilesExist = true;
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('\n✅ All required frontend files exist!');
} else {
  console.log('\n❌ Some required files are missing!');
}

// Test 2: Try to build the frontend
console.log('\n🔨 Testing frontend build...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Frontend build successful!');
  } else {
    console.log('\n❌ Frontend build failed!');
  }
});
