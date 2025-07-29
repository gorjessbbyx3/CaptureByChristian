import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixPriceColumn() {
  try {
    console.log('Connecting to database...');
    
    // Fix price column in services table
    await pool.query(`
      ALTER TABLE services 
      ALTER COLUMN price TYPE numeric(10,2) USING price::numeric(10,2);
    `);
    
    console.log('Successfully updated price column to numeric(10,2) type');
  } catch (error) {
    console.error('Error updating price column:', error);
  } finally {
    await pool.end();
  }
}

fixPriceColumn();
