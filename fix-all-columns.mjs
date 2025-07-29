import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAllColumns() {
  try {
    console.log('Connecting to database...');
    
    // List of columns that need to be converted to JSON type
    const jsonColumns = [
      { table: 'gallery_images', column: 'ai_analysis' },
      { table: 'clients', column: 'custom_fields' },
      { table: 'services', column: 'add_ons' },
      { table: 'bookings', column: 'add_ons' },
      { table: 'contracts', column: 'signature_metadata' },
      { table: 'orders', column: 'items' },
      { table: 'orders', column: 'shipping_address' },
      { table: 'products', column: 'variants' },
      { table: 'profiles', column: 'social_media' },
      { table: 'ai_chats', column: 'messages' },
      { table: 'ai_chats', column: 'booking_data' },
      { table: 'leads', column: 'form_data' },
      { table: 'communication_log', column: 'metadata' },
      { table: 'automation_sequences', column: 'steps' },
      { table: 'questionnaires', column: 'questions' }
    ];

    for (const { table, column } of jsonColumns) {
      try {
        console.log(`Processing ${table}.${column}...`);
        
        // Check if column exists
        const checkResult = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2;
        `, [table, column]);
        
        if (checkResult.rows.length > 0) {
          // Drop existing column
          await pool.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS ${column};`);
          console.log(`Dropped ${table}.${column}`);
          
          // Add new column with JSON type
          await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} json DEFAULT '{}';`);
          console.log(`Added ${table}.${column} with JSON type`);
        }
      } catch (error) {
        console.log(`Error processing ${table}.${column}:`, error.message);
      }
    }
    
    console.log('All column fixes completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pool.end();
  }
}

fixAllColumns();
