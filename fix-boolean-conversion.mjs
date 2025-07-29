#!/usr/bin/env node
/**
 * Fix boolean conversion issues for drizzle-kit push
 * This script handles the featured column conversion from existing data to boolean
 */

import { drizzle } from 'drizzle-orm/node-postgres';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { pgTable, text, boolean } from 'drizzle-orm/pg-core';
import { pool } from './server/db.js';
import { sql } from 'drizzle-orm';

const db = drizzle(pool);

async function fixBooleanConversion() {
  console.log('🔧 Fixing boolean conversion issues...');
  
  try {
    // Check current structure of gallery_images table
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'gallery_images' AND column_name = 'featured'
    `);
    
    if (tableInfo.rows.length > 0) {
      console.log('📊 Current featured column type:', tableInfo.rows[0].data_type);
      
      // Handle different data type scenarios
      const currentType = tableInfo.rows[0].data_type;
      
      if (currentType === 'boolean') {
        console.log('✅ featured column is already boolean type');
        return;
      }
      
      // Create temporary boolean column
      console.log('🔄 Creating temporary boolean column...');
      await pool.query(`
        ALTER TABLE gallery_images 
        ADD COLUMN IF NOT EXISTS featured_boolean boolean DEFAULT false
      `);
      
      // Convert existing data based on current type
      if (['character varying', 'text', 'varchar'].includes(currentType)) {
        await pool.query(`
          UPDATE gallery_images 
          SET featured_boolean = CASE 
            WHEN featured::text ILIKE 'true' OR featured::text = '1' OR featured::text ILIKE 't' THEN true
            WHEN featured::text ILIKE 'false' OR featured::text = '0' OR featured::text ILIKE 'f' THEN false
            WHEN featured IS NULL THEN false
            ELSE false
          END
        `);
      } else if (['integer', 'bigint'].includes(currentType)) {
        await pool.query(`
          UPDATE gallery_images 
          SET featured_boolean = CASE 
            WHEN featured > 0 THEN true
            ELSE false
          END
        `);
      }
      
      // Drop old column and rename new one
      console.log('🔄 Replacing old column with boolean version...');
      await pool.query(`
        ALTER TABLE gallery_images 
        DROP COLUMN IF EXISTS featured
      `);
      
      await pool.query(`
        ALTER TABLE gallery_images 
        RENAME COLUMN featured_boolean TO featured
      `);
      
      console.log('✅ Boolean conversion completed successfully');
    } else {
      console.log('ℹ️ featured column does not exist, skipping boolean conversion');
    }
    
  } catch (error) {
    console.error('❌ Error during boolean conversion:', error);
    throw error;
  }
}

// Execute the fix
fixBooleanConversion()
  .then(() => {
    console.log('🎉 Migration fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration fix failed:', error);
    process.exit(1);
  });
