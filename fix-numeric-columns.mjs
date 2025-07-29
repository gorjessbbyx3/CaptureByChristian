import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixNumericColumns() {
  try {
    console.log('Connecting to database...');
    
    // List of numeric/decimal columns that need to be converted
    const numericColumns = [
      { table: 'services', column: 'price', precision: 10, scale: 2 },
      { table: 'bookings', column: 'total_price', precision: 10, scale: 2 },
      { table: 'invoices', column: 'amount', precision: 10, scale: 2 },
      { table: 'clients', column: 'lifetime_value', precision: 10, scale: 2 },
      { table: 'contracts', column: 'total_amount', precision: 10, scale: 2 },
      { table: 'contracts', column: 'retainer_amount', precision: 10, scale: 2 },
      { table: 'contracts', column: 'balance_amount', precision: 10, scale: 2 },
      { table: 'orders', column: 'subtotal', precision: 10, scale: 2 },
      { table: 'orders', column: 'tax', precision: 10, scale: 2 },
      { table: 'orders', column: 'total', precision: 10, scale: 2 },
      { table: 'products', column: 'price', precision: 10, scale: 2 },
      { table: 'products', column: 'cost', precision: 10, scale: 2 },
      { table: 'team_members', column: 'hourly_rate', precision: 10, scale: 2 }
    ];

    for (const { table, column, precision, scale } of numericColumns) {
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
          
          // Add new column with correct numeric type
          await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} numeric(${precision}, ${scale}) DEFAULT 0.00;`);
          console.log(`Added ${table}.${column} with numeric(${precision}, ${scale}) type`);
        }
      } catch (error) {
        console.log(`Error processing ${table}.${column}:`, error.message);
      }
    }
    
    console.log('All numeric column fixes completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pool.end();
  }
}

fixNumericColumns();
