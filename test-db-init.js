import "dotenv/config";
import express from "express";
import { initializeDatabase } from "./server/database-init.js";

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "CaptureByChristian Database Test",
    message: "Database initialization test server is running",
  });
});

// Database status endpoint
app.get("/api/database-status", async (req, res) => {
  try {
    const { getDatabaseInitializer } = await import(
      "./server/database-init.js"
    );
    const dbInitializer = getDatabaseInitializer();
    const isInitialized = dbInitializer.getInitializationStatus();
    const connectionTest = await dbInitializer.testConnection();

    res.json({
      success: true,
      database: {
        initialized: isInitialized,
        connection_healthy: connectionTest,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to check database status",
      details: error.message,
    });
  }
});

// Simple test endpoint
app.get("/", (req, res) => {
  res.json({
    message: "CaptureByChristian Database Initialization Test",
    status: "running",
    endpoints: [
      "GET / - This message",
      "GET /api/health - Health check",
      "GET /api/database-status - Database status",
    ],
  });
});

async function startServer() {
  console.log("🔄 Starting CaptureByChristian Database Test Server...");

  try {
    // Initialize database with our automated system
    console.log("🔄 Initializing database...");
    const dbInitSuccess = await initializeDatabase();

    if (!dbInitSuccess) {
      console.error("❌ Database initialization failed. Exiting...");
      process.exit(1);
    }

    console.log("✅ Database initialization completed successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log("🎉 ====================================");
      console.log("🚀 CaptureByChristian Test Server LIVE!");
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `💾 Database status: http://localhost:${PORT}/api/database-status`,
      );
      console.log("🎉 ====================================");
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
