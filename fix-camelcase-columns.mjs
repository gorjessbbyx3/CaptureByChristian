import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixCamelCaseColumns() {
  try {
    console.log('Connecting to database...');
    
    // List of camelCase columns in contracts table that need to be fixed
    const camelCaseColumns = [
      { table: 'contracts', oldName: 'bookingId', newName: 'booking_id', type: 'integer', nullable: true },
      { table: 'contracts', oldName: 'clientId', newName: 'client_id', type: 'integer', nullable: false },
      { table: 'contracts', oldName: 'contractType', newName: 'contract_type', type: 'text', nullable: false },
      { table: 'contracts', oldName: 'serviceType', newName: 'service_type', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'templateContent', newName: 'template_content', type: 'text', nullable: false },
      { table: 'contracts', oldName: 'signedContent', newName: 'signed_content', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'sessionDate', newName: 'session_date', type: 'timestamp', nullable: true },
      { table: 'contracts', oldName: 'packageType', newName: 'package_type', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'totalAmount', newName: 'total_amount', type: 'numeric(10,2)', nullable: true },
      { table: 'contracts', oldName: 'retainerAmount', newName: 'retainer_amount', type: 'numeric(10,2)', nullable: true },
      { table: 'contracts', oldName: 'balanceAmount', newName: 'balance_amount', type: 'numeric(10,2)', nullable: true },
      { table: 'contracts', oldName: 'paymentTerms', newName: 'payment_terms', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'usageRights', newName: 'usage_rights', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'cancellationPolicy', newName: 'cancellation_policy', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'additionalTerms', newName: 'additional_terms', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'clientSignature', newName: 'client_signature', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'clientSignedAt', newName: 'client_signed_at', type: 'timestamp', nullable: true },
      { table: 'contracts', oldName: 'clientIpAddress', newName: 'client_ip_address', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'photographerSignature', newName: 'photographer_signature', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'photographerSignedAt', newName: 'photographer_signed_at', type: 'timestamp', nullable: true },
      { table: 'contracts', oldName: 'signatureRequestSent', newName: 'signature_request_sent', type: 'timestamp', nullable: true },
      { table: 'contracts', oldName: 'portalAccessToken', newName: 'portal_access_token', type: 'text', nullable: true },
      { table: 'contracts', oldName: 'createdAt', newName: 'created_at', type: 'timestamp', nullable: false },
      { table: 'contracts', oldName: 'updatedAt', newName: 'updated_at', type: 'timestamp', nullable: false }
    ];

    for (const { table, oldName, newName, type, nullable } of camelCaseColumns) {
      try {
        console.log(`Processing ${table}.${oldName} -> ${newName}...`);
        
        // Check if old column exists
        const checkResult = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2;
        `, [table, oldName]);
        
        if (checkResult.rows.length > 0) {
          // Drop existing column
          await pool.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS ${oldName};`);
          console.log(`Dropped ${table}.${oldName}`);
          
          // Add new column with correct name and type
          const nullableClause = nullable ? '' : 'NOT NULL';
          const defaultClause = type.includes('timestamp') ? 'DEFAULT NOW()' : '';
          await pool.query(`ALTER TABLE ${table} ADD COLUMN ${newName} ${type} ${nullableClause} ${defaultClause};`);
          console.log(`Added ${table}.${newName} with ${type} type`);
        }
      } catch (error) {
        console.log(`Error processing ${table}.${oldName}:`, error.message);
      }
    }
    
    console.log('All camelCase column fixes completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pool.end();
  }
}

fixCamelCaseColumns();
