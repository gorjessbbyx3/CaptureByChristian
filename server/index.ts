import dotenv from "dotenv";
// Load environment variables immediately
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { createApp } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
// Validate required environment variables in production
if (isProd) {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is required in production");
    process.exit(1);
  }
  if (
    !process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET === "your-secret-key-change-in-production"
  ) {
    console.error(
      "❌ SESSION_SECRET must be set to a secure value in production",
    );
    process.exit(1);
  }
}

const app = createApp();
const PORT = Number(process.env.PORT) || 7000;

// Note: app middlewares, health routes, and static assets are configured in createApp()

// API routes
registerRoutes(app)
  .then(() => {
    console.log("✅ Routes registered");

    // Serve static files in production (after API routes are registered)
    if (isProd) {
      // Serve built client from dist/public (aligned with build pipeline)
      const clientDistPath = path.join(__dirname, "../public");
      app.set("trust proxy", 1); // trust first proxy
      app.use(express.static(clientDistPath));

      // Handle client-side routing (this must come last)
      app.use((req, res, next) => {
        // Skip API routes
        if (req.path.startsWith("/api/")) {
          return res.status(404).json({ error: "API endpoint not found" });
        }
        // Only handle GET requests for client-side routing
        if (req.method === 'GET') {
          return res.sendFile(path.join(clientDistPath, "index.html"));
        }
        next();
      });
    }
  })
  .catch((err) => {
    console.error("❌ Failed to register routes:", err);
    process.exit(1);
  });

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error:
        isProd ? "Internal server error" : (err as Error).message,
    });
  },
);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(
    `🗄️  Database: ${process.env.DATABASE_URL ? "Connected" : "Not configured"}`,
  );
});

console.log({
  FRONTEND_URL: process.env.FRONTEND_URL,
  PORT,
  NODE_ENV: process.env.NODE_ENV,
  SESSION_SECRET: !!process.env.SESSION_SECRET,
});

export default app;
