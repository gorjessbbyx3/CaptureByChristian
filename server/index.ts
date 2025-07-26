import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./database-init";
//import { db } from "./db";
//import { sql } from "drizzle-orm";
import healthRoutes from '../health';

const app = express();
const PORT = Number(process.env.PORT) || 7000;

console.log('🌐 PORT ENV:', process.env.PORT);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(healthRoutes);

// Enable CORS for frontend-backend communication
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint for the API
/*app.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`); // or drizzle equivalent
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('DB connection failed');
  }
});*/

app.use(express.urlencoded({ extended: false }));

// Serve attached assets (videos, images, documents)
app.use('/attached_assets', express.static('attached_assets'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database before starting the server
  console.log('🔄 Initializing database...');
  const dbInitSuccess = await initializeDatabase();
  
  if (!dbInitSuccess) {
    console.error('❌ Database initialization failed. Exiting...');
    process.exit(1);
  }
  
  console.log('✅ Database initialization completed successfully');
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Only start server if not running in Vercel environment
  if (!process.env.VERCEL) {
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 7000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '7000', 10);
    
    // Add explicit host binding for Render compatibility
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server successfully started and listening on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🩺 Health check available at: http://localhost:${port}/api/health`);
      console.log(`📊 Database status at: http://localhost:${port}/api/admin/database-status`);
      log(`serving on port ${port}`);
    });
  }
})();

// Export the app for Vercel
export { app };
