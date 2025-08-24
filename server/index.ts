import dotenv from "dotenv";
// Load environment variables immediately
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.ts";
import { getDatabaseInitializer } from "./database-init.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd =
  String(process.env.NODE_ENV || "").toLowerCase() === "production";
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

const app = express();
const PORT = Number(process.env.PORT) || 7000;

// CORS configuration
const allowedOrigins = isProd
  ? process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : process.env.RENDER_EXTERNAL_URL
      ? [`https://${process.env.RENDER_EXTERNAL_URL}`]
      : true
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Health check endpoint
app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Serve attached assets
const assetsPath = path.join(__dirname, "../attached_assets");
app.use("/attached_assets", express.static(assetsPath));

// API routes
// Kick off database initialization in the background (runtime, not build)
if (process.env.DATABASE_URL) {
  const dbInitializer = getDatabaseInitializer();
  dbInitializer
    .initialize()
    .then((ok) => {
      if (ok) console.log("✅ Database initialized");
      else console.warn("⚠️ Database initialization reported issues");
    })
    .catch((err) => {
      console.error("❌ Database initialization error:", err);
    });
} else {
  console.warn("⚠️ DATABASE_URL not set; skipping DB initialization");
}

registerRoutes(app)
  .then(() => {
    console.log("✅ Routes registered");

    // Serve static files in production (after API routes are registered)
    if (isProd) {
      // Serve built client from dist/public (aligned with build pipeline)
      const clientDistPath = path.join(__dirname, "../public");
      app.set("trust proxy", 1); // trust first proxy
      console.log("📦 Client dist path:", clientDistPath);
      app.use(express.static(clientDistPath));

      // Handle client-side routing (this must come last)
      app.use((req, res, next) => {
        // Skip API routes
        if (req.path.startsWith("/api/")) {
          return res.status(404).json({ error: "API endpoint not found" });
        }
        // Only handle GET requests for client-side routing
        if (req.method === "GET") {
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
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: isProd ? "Internal server error" : (err as Error).message,
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
