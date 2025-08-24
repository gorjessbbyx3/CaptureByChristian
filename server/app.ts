import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const isProd =
    String(process.env.NODE_ENV || "").toLowerCase() === "production";
  const app = express();

  const allowedOrigins = isProd
    ? process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : true
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

  // Startup diagnostics (safe values only)
  console.log("🧭 Runtime", {
    NODE_ENV: process.env.NODE_ENV,
    isProd,
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
  });
  if (process.env.DEBUG_STARTUP === "true") {
    console.log("🧪 DEBUG_STARTUP enabled");
    console.log("🔐 Session secure cookie:", isProd);
    console.log("🌐 CORS allowed origins:", allowedOrigins);
  }

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

  app.get(["/health", "/api/health"], (req, res) => {
    res
      .status(200)
      .json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
  });

  const assetsPath = path.join(__dirname, "../attached_assets");
  console.log("📁 Assets path:", assetsPath);
  app.use("/attached_assets", express.static(assetsPath));

  return app;
}
