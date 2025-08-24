// Vitest global setup for server-side tests
import "dotenv/config";

// Normalize environment for tests
process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "0";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-secret";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
