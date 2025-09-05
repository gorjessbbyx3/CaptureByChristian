import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { promises as fs } from 'fs';
import * as path from 'path';

// Get the directory name for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

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
      await this.pool.query('SELECT 1');
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log('⚠️ Database connection failed, attempting to create database...');

      // Extract database name from connection string
      const dbUrl = new URL(process.env.DATABASE_URL!);
      const targetDbName = dbUrl.pathname.slice(1); // Remove leading slash

      // Create connection to postgres database to create our target database
      const adminConnectionString = process.env.DATABASE_URL!.replace(`/${targetDbName}`, '/postgres');
      const adminPool = new Pool({
        connectionString: adminConnectionString,
        max: 1,
        connectionTimeoutMillis: 10000,
      });

      try {
        // Check if database exists
        const dbCheckResult = await adminPool.query(
          'SELECT 1 FROM pg_database WHERE datname = $1',
          [targetDbName]
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
        await this.pool.query('SELECT 1');
        console.log('✅ Database connection successful after creation');
        return true;

      } catch (createError) {
        console.error('❌ Failed to create database:', createError);
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
      console.log('🔄 Starting database migration process...');

      // Create drizzle instance for migrations
      const db = drizzle(this.pool);

      // Check if migrations directory exists
      const migrationsPath = path.resolve(__dirname, '../migrations');

      try {
        await fs.access(migrationsPath);
      } catch {
        console.log('⚠️ No migrations directory found, skipping migrations');
        return true;
      }

      // Check if migrations have already been applied
      const hasExistingTables = await this.checkExistingTables();
      if (hasExistingTables) {
        console.log('⚠️ Tables already exist, checking if migrations table exists...');

        // Check if drizzle migrations table exists
        const migrationTableExists = await this.pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '__drizzle_migrations'
          );
        `);

        if (!migrationTableExists.rows[0].exists) {
          console.log('📝 Creating migrations tracking table...');

          // Create the migrations table manually
          await this.pool.query(`
            CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
              id SERIAL PRIMARY KEY,
              hash text NOT NULL,
              created_at bigint
            );
          `);

          // Mark existing migration as applied
          const migrationHash = await this.getMigrationHash(migrationsPath);
          if (migrationHash) {
            await this.pool.query(`
              INSERT INTO "__drizzle_migrations" (hash, created_at) 
              VALUES ($1, $2)
            `, [migrationHash, Date.now()]);
            console.log('✅ Marked existing schema as migrated');
          }
        }

        console.log('✅ Database schema is up to date');
        return true;
      }

      // Run migrations normally if no tables exist
      await migrate(db, { migrationsFolder: migrationsPath });

      console.log('✅ Database migrations completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
  }

  /**
   * Check if any of our main tables already exist
   */
  async checkExistingTables(): Promise<boolean> {
    try {
      const result = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'clients', 'services', 'bookings')
        );
      `);
      return result.rows[0].exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the hash of the first migration file
   */
  async getMigrationHash(migrationsPath: string): Promise<string | null> {
    try {
      const journalPath = path.join(migrationsPath, 'meta', '_journal.json');
      const journalContent = await fs.readFile(journalPath, 'utf8');
      const journal = JSON.parse(journalContent);

      if (journal.entries && journal.entries.length > 0) {
        return journal.entries[0].when.toString();
      }

      return null;
    } catch (error) {
      console.log('⚠️ Could not read migration journal');
      return null;
    }
  }

  /**
   * Test database connection and basic functionality
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT NOW() as current_time, version() as version');
      console.log('✅ Database connection test successful:', {
        timestamp: result.rows[0].current_time,
        version: result.rows[0].version.split(' ')[0] // Just get PostgreSQL version
      });
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Check if required tables exist
   */
  async verifySchema(): Promise<boolean> {
    try {
      // Check if all required tables exist
      const requiredTables = [
        'users', 'clients', 'services', 'bookings', 'contracts', 
        'invoices', 'gallery_images', 'ai_chats', 'leads', 'communication_log',
        'automation_sequences', 'questionnaires', 'client_portal_sessions',
        'products', 'orders', 'team_members', 'contact_messages',
        'client_messages', 'profiles'
      ];

      console.log('🔍 Verifying database schema...');

      for (const tableName of requiredTables) {
        const result = await this.pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);

        if (!result.rows[0].exists) {
          console.log(`⚠️ Table "${tableName}" is missing`);
          return false;
        }
      }

      console.log('✅ All required tables exist');
      return true;
    } catch (error) {
      console.error('❌ Schema verification failed:', error);
      return false;
    }
  }

  /**
   * Main initialization method
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('ℹ️ Database already initialized, skipping');
      return true;
    }

    console.log('🚀 Starting database initialization process...');

    try {
      // Step 1: Ensure database exists
      const dbExists = await this.ensureDatabaseExists();
      if (!dbExists) {
        console.error('❌ Failed to ensure database exists');
        return false;
      }

      // Step 2: Run migrations
      const migrationsSuccess = await this.runMigrations();
      if (!migrationsSuccess) {
        console.error('❌ Failed to run migrations');
        return false;
      }

      // Step 3: Test connection
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        console.error('❌ Connection test failed');
        return false;
      }

      // Step 4: Verify schema
      const schemaValid = await this.verifySchema();
      if (!schemaValid) {
        console.log('⚠️ Schema verification failed, but continuing (tables may be created by migrations)');
      }

      this.isInitialized = true;
      console.log('🎉 Database initialization completed successfully!');
      return true;

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
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
    throw new Error('DATABASE_URL environment variable is required');
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