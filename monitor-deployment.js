#!/usr/bin/env node

/**
 * Deployment Monitor for Render Service
 * Monitors the deployment status for commit 461ca176
 * Usage: node monitor-deployment.js <render-service-url>
 */

import https from "https";
import http from "http";

const DEPLOYMENT_COMMIT = "461ca176";
const CHECK_INTERVAL = 10000; // 10 seconds
const MAX_RETRIES = 180; // 30 minutes max
let retryCount = 0;

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;

    const req = client.get(
      url,
      {
        timeout: 15000,
        headers: {
          "User-Agent": "Deployment-Monitor/1.0",
        },
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            responseTime: Date.now(),
          });
        });
      },
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

async function checkHealth(baseUrl) {
  const endpoints = [
    { path: "/health", name: "Main Health" },
    { path: "/api/health", name: "API Health" },
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(`${baseUrl}${endpoint.path}`);
      const responseTime = Date.now() - startTime;

      results[endpoint.name] = {
        success: true,
        statusCode: response.statusCode,
        responseTime,
        body: response.body,
      };

      log(
        `✅ ${endpoint.name}: ${response.statusCode} (${responseTime}ms)`,
        colors.green,
      );
    } catch (error) {
      results[endpoint.name] = {
        success: false,
        error: error.message,
      };

      log(`❌ ${endpoint.name}: ${error.message}`, colors.red);
    }
  }

  return results;
}

async function checkDeployment(baseUrl) {
  try {
    const startTime = Date.now();

    log(
      `🔍 Checking deployment status for commit ${DEPLOYMENT_COMMIT}...`,
      colors.blue,
    );

    // Check main endpoint
    const response = await makeRequest(baseUrl);
    const responseTime = Date.now() - startTime;

    if (response.statusCode === 200) {
      log(`✅ Service is responding! (${responseTime}ms)`, colors.green);

      // Check health endpoints
      log(`🏥 Checking health endpoints...`, colors.cyan);
      const healthResults = await checkHealth(baseUrl);

      // Check for path-to-regexp errors in response
      if (
        response.body.includes("path-to-regexp") ||
        response.body.includes("Missing parameter")
      ) {
        log(
          `⚠️  Path-to-regexp error still present in response`,
          colors.yellow,
        );
        return false;
      }

      // Check if all health endpoints are working
      const healthSuccess = Object.values(healthResults).every(
        (result) => result.success,
      );

      if (healthSuccess) {
        log(
          `🎉 DEPLOYMENT SUCCESSFUL! All endpoints healthy.`,
          colors.bold + colors.green,
        );
        log(`🚀 Service URL: ${baseUrl}`, colors.cyan);
        log(`📦 Commit: ${DEPLOYMENT_COMMIT}`, colors.cyan);
        log(`✨ Path-to-regexp race condition fix is working!`, colors.magenta);
        return true;
      } else {
        log(`⚠️  Service responding but health checks failing`, colors.yellow);
        return false;
      }
    } else if (response.statusCode >= 500) {
      log(`💥 Server error: ${response.statusCode}`, colors.red);

      // Check for specific path-to-regexp errors
      if (
        response.body.includes("path-to-regexp") ||
        response.body.includes("Missing parameter")
      ) {
        log(`🐛 Path-to-regexp error detected in server response`, colors.red);
        log(
          `📝 This suggests the fix in commit ${DEPLOYMENT_COMMIT} may not be working`,
          colors.yellow,
        );
      }

      return false;
    } else {
      log(
        `🔄 Service returning ${response.statusCode}, possibly still deploying...`,
        colors.yellow,
      );
      return false;
    }
  } catch (error) {
    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ECONNREFUSED")
    ) {
      log(`🔄 Service not yet accessible (${error.message})`, colors.yellow);
    } else if (error.message.includes("timeout")) {
      log(`⏱️  Request timeout - service may be starting up`, colors.yellow);
    } else {
      log(`💥 Error checking deployment: ${error.message}`, colors.red);
    }
    return false;
  }
}

async function monitorDeployment(serviceUrl) {
  log(
    `🚀 Starting deployment monitor for commit ${DEPLOYMENT_COMMIT}`,
    colors.bold + colors.blue,
  );
  log(`🎯 Target URL: ${serviceUrl}`, colors.cyan);
  log(`📊 Checking every ${CHECK_INTERVAL / 1000} seconds...`, colors.cyan);
  log(``, colors.reset);

  while (retryCount < MAX_RETRIES) {
    retryCount++;

    log(`📡 Check ${retryCount}/${MAX_RETRIES}`, colors.blue);

    const success = await checkDeployment(serviceUrl);

    if (success) {
      log(``, colors.reset);
      log(
        `🎊 MONITORING COMPLETE - DEPLOYMENT SUCCESSFUL!`,
        colors.bold + colors.green,
      );
      process.exit(0);
    }

    if (retryCount < MAX_RETRIES) {
      log(
        `⏳ Waiting ${CHECK_INTERVAL / 1000} seconds before next check...`,
        colors.cyan,
      );
      log(``, colors.reset);
      await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
    }
  }

  log(``, colors.reset);
  log(
    `⏰ Maximum monitoring time exceeded (${(MAX_RETRIES * CHECK_INTERVAL) / 1000 / 60} minutes)`,
    colors.red,
  );
  log(
    `🚨 Deployment may have failed or is taking longer than expected`,
    colors.red,
  );
  process.exit(1);
}

// Get service URL from command line argument
const serviceUrl = process.argv[2];

if (!serviceUrl) {
  console.log(
    `${colors.red}❌ Please provide your Render service URL${colors.reset}`,
  );
  console.log(
    `${colors.cyan}Usage: node monitor-deployment.js <render-service-url>${colors.reset}`,
  );
  console.log(
    `${colors.cyan}Example: node monitor-deployment.js https://your-service.onrender.com${colors.reset}`,
  );
  process.exit(1);
}

// Validate URL format
try {
  new URL(serviceUrl);
} catch (error) {
  console.log(
    `${colors.red}❌ Invalid URL format: ${serviceUrl}${colors.reset}`,
  );
  process.exit(1);
}

// Start monitoring
monitorDeployment(serviceUrl).catch((error) => {
  log(`💥 Monitoring failed: ${error.message}`, colors.red);
  process.exit(1);
});
