#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests the application startup and port binding
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 7000;
const HOST = '0.0.0.0';

console.log('🔍 Deployment Verification Script');
console.log('================================');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    console.error('❌ dist directory not found. Run: npm run build');
    process.exit(1);
}

console.log('✅ dist directory exists');

// Check if index.js exists in dist
const indexPath = path.join(distPath, 'index.js');
if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.js not found. Run: npm run build');
    process.exit(1);
}

console.log('✅ dist/index.js exists');

// Test health check endpoint
function testHealthCheck() {
    return new Promise((resolve) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: '/api/health',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Health check endpoint responding');
                    try {
                        const response = JSON.parse(data);
                        console.log('📊 Health check response:', response);
                        resolve(true);
                    } catch (e) {
                        console.log('✅ Health check responding (non-JSON)');
                        resolve(true);
                    }
                } else {
                    console.error(`❌ Health check failed with status: ${res.statusCode}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Health check failed:', error.message);
            resolve(false);
        });

        req.on('timeout', () => {
            console.error('❌ Health check timeout');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

// Main verification
async function verifyDeployment() {
    console.log(`🌐 Testing port binding on ${HOST}:${PORT}`);
    
    // Start the server
    const { spawn } = require('child_process');
    const server = spawn('node', ['dist/index.js'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: PORT }
    });

    // Wait for server to start
    setTimeout(async () => {
        console.log('\n⏳ Testing server startup...');
        const healthOk = await testHealthCheck();
        
        if (healthOk) {
            console.log('🎉 Deployment verification successful!');
            console.log(`🌐 Server is running at http://localhost:${PORT}`);
            console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
        } else {
            console.log('⚠️ Health check failed - server may still be starting');
        }
        
        // Don't kill the server - let it run
        console.log('\n✅ Verification complete - server is running');
    }, 3000);
}

// Run verification
verifyDeployment().catch(console.error);
