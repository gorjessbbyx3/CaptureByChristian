#!/usr/bin/env node
/**
 * Build script for Vercel deployment
 * This script builds the frontend using Vite
 */

import { build } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildForVercel() {
  try {
    console.log("Building frontend for Vercel...");

    // Build the frontend
    await build({
      root: resolve(__dirname, "client"),
      build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
      },
    });

    console.log("Frontend build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

buildForVercel();
