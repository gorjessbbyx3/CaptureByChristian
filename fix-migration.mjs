import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixMigration() {
  try {
    console.log('Connecting to database...');
    
    // First, let's check the current structure
    const result = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name IN ('clients', 'gallery_images') 
      AND column_name = 'tags';
    `);
    
    console.log('Current tags column structure:', result.rows);
    
    // Drop the existing tags columns if they exist
    try {
      await pool.query('ALTER TABLE clients DROP COLUMN IF EXISTS tags;');
      console.log('Dropped tags column from clients');
    } catch (e) {
      console.log('Could not drop clients.tags:', e.message);
    }
    
    try {
      await pool.query('ALTER TABLE gallery_images DROP COLUMN IF EXISTS tags;');
      console.log('Dropped tags column from gallery_images');
    } catch (e) {
      console.log('Could not drop gallery_images.tags:', e.message);
    }
    
    // Now add the new tags columns with correct type
    await pool.query('ALTER TABLE clients ADD COLUMN tags text[] DEFAULT \'{}\';');
    console.log('Added tags column to clients with text[] type');
    
    await pool.query('ALTER TABLE gallery_images ADD COLUMN tags text[] DEFAULT \'{}\';');
    console.log('Added tags column to gallery_images with text[] type');
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pool.end();
  }
}

fixMigration();
