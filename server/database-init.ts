import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { promises as fs } from "fs";
import * as path from "path";

// Get the directory name for ES modules
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseInitializer {
  private pool: Pool;
  private isInitialized = false;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 5, // Smaller pool for initialization
      connectionTimeoutMillis: 10000,
    });
  }

  /**
   * Ensures the database exists, creates it if it doesn't
   */
  async ensureDatabaseExists(): Promise<boolean> {
    try {
      // First try to connect to the target database
      await this.pool.query("SELECT 1");
      console.log("✅ Database connection successful");
      return true;
    } catch (error) {
      console.log(
        "⚠️ Database connection failed, attempting to create database...",
      );

      // Extract database name from connection string
      const dbUrl = new URL(process.env.DATABASE_URL!);
      const targetDbName = dbUrl.pathname.slice(1); // Remove leading slash

      // Create connection to postgres database to create our target database
      const adminConnectionString = process.env.DATABASE_URL!.replace(
        `/${targetDbName}`,
        "/postgres",
      );
      const adminPool = new Pool({
        connectionString: adminConnectionString,
        max: 1,
        connectionTimeoutMillis: 10000,
      });

      try {
        // Check if database exists
        const dbCheckResult = await adminPool.query(
          "SELECT 1 FROM pg_database WHERE datname = $1",
          [targetDbName],
        );

        if (dbCheckResult.rows.length === 0) {
          // Database doesn't exist, create it
          await adminPool.query(`CREATE DATABASE "${targetDbName}"`);
          console.log(`✅ Database "${targetDbName}" created successfully`);
        } else {
          console.log(`✅ Database "${targetDbName}" already exists`);
        }

        await adminPool.end();

        // Test connection again
        await this.pool.query("SELECT 1");
        console.log("✅ Database connection successful after creation");
        return true;
      } catch (createError) {
        console.error("❌ Failed to create database:", createError);
        await adminPool.end();
        return false;
      }
    }
  }

  /**
   * Runs Drizzle migrations
   */
  async runMigrations(): Promise<boolean> {
    try {
      console.log("🔄 Starting database migration process...");

      // Create drizzle instance for migrations
      const db = drizzle(this.pool);

      // Check if migrations directory exists
      const migrationsPath = path.resolve(__dirname, "../migrations");

      try {
        await fs.access(migrationsPath);
      } catch {
        console.log("⚠️ No migrations directory found, skipping migrations");
        return true;
      }

      // Run migrations
      await migrate(db, { migrationsFolder: migrationsPath });

      console.log("✅ Database migrations completed successfully");
      return true;
    } catch (error) {
      console.error("❌ Migration failed:", error);
      return false;
    }
  }

  /**
   * Test database connection and basic functionality
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "SELECT NOW() as current_time, version() as version",
      );
      console.log("✅ Database connection test successful:", {
        timestamp: result.rows[0].current_time,
        version: result.rows[0].version.split(" ")[0], // Just get PostgreSQL version
      });
      return true;
    } catch (error) {
      console.error("❌ Database connection test failed:", error);
      return false;
    }
  }

  /**
   * Check if required tables exist
   */
  async verifySchema(): Promise<boolean> {
    try {
      const requiredTables = [
        "users",
        "clients",
        "services",
        "bookings",
        "contracts",
        "invoices",
        "gallery_images",
        "contact_messages",
        "ai_chats",
      ];

      console.log("🔍 Verifying database schema...");

      for (const tableName of requiredTables) {
        const result = await this.pool.query(
          `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `,
          [tableName],
        );

        if (!result.rows[0].exists) {
          console.log(`⚠️ Table "${tableName}" is missing`);
          return false;
        }
      }

      console.log("✅ All required tables exist");
      return true;
    } catch (error) {
      console.error("❌ Schema verification failed:", error);
      return false;
    }
  }

  /**
   * Main initialization method
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log("ℹ️ Database already initialized, skipping");
      return true;
    }

    console.log("🚀 Starting database initialization process...");

    try {
      // Step 1: Ensure database exists
      const dbExists = await this.ensureDatabaseExists();
      if (!dbExists) {
        console.error("❌ Failed to ensure database exists");
        return false;
      }

      // Step 2: Run migrations
      const migrationsSuccess = await this.runMigrations();
      if (!migrationsSuccess) {
        console.error("❌ Failed to run migrations");
        return false;
      }

      // Step 3: Test connection
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        console.error("❌ Connection test failed");
        return false;
      }

      // Step 4: Verify schema
      const schemaValid = await this.verifySchema();
      if (!schemaValid) {
        console.log(
          "⚠️ Schema verification failed, but continuing (tables may be created by migrations)",
        );
      }

      this.isInitialized = true;
      console.log("🎉 Database initialization completed successfully!");
      return true;
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      return false;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Get initialization status
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

// Create and export a singleton instance
let dbInitializer: DatabaseInitializer | null = null;

export function getDatabaseInitializer(): DatabaseInitializer {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  if (!dbInitializer) {
    dbInitializer = new DatabaseInitializer(process.env.DATABASE_URL);
  }

  return dbInitializer;
}

/**
 * Convenience function to initialize database
 */
export async function initializeDatabase(): Promise<boolean> {
  const initializer = getDatabaseInitializer();
  return await initializer.initialize();
}
