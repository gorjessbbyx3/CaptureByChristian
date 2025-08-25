
import { Pool } from 'pg';

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables in the correct order (respecting foreign keys)
    const dropQueries = [
      'DROP TABLE IF EXISTS "team_members" CASCADE',
      'DROP TABLE IF EXISTS "orders" CASCADE',
      'DROP TABLE IF EXISTS "products" CASCADE',
      'DROP TABLE IF EXISTS "client_portal_sessions" CASCADE',
      'DROP TABLE IF EXISTS "questionnaires" CASCADE',
      'DROP TABLE IF EXISTS "automation_sequences" CASCADE',
      'DROP TABLE IF EXISTS "communication_log" CASCADE',
      'DROP TABLE IF EXISTS "leads" CASCADE',
      'DROP TABLE IF EXISTS "ai_chats" CASCADE',
      'DROP TABLE IF EXISTS "gallery_images" CASCADE',
      'DROP TABLE IF EXISTS "contracts" CASCADE',
      'DROP TABLE IF EXISTS "invoices" CASCADE',
      'DROP TABLE IF EXISTS "bookings" CASCADE',
      'DROP TABLE IF EXISTS "services" CASCADE',
      'DROP TABLE IF EXISTS "client_messages" CASCADE',
      'DROP TABLE IF EXISTS "contact_messages" CASCADE',
      'DROP TABLE IF EXISTS "profiles" CASCADE',
      'DROP TABLE IF EXISTS "clients" CASCADE',
      'DROP TABLE IF EXISTS "users" CASCADE',
      'DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE'
    ];

    for (const query of dropQueries) {
      await pool.query(query);
    }

    console.log('✅ Database reset completed');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
  } finally {
    await pool.end();
  }
}

resetDatabase();
