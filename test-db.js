import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    "postgres://myuser:mypassword@localhost:5432/capturebychristian",
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    console.log(
      "✅ Database connection successful:",
      result.rows[0].current_time,
    );
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(
      "📊 Tables in database:",
      result.rows.map((row) => row.table_name),
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("❌ Error checking tables:", error.message);
    return false;
  }
}

async function main() {
  console.log("🔍 Testing database connection...");
  const connected = await testConnection();

  if (connected) {
    console.log("🔍 Checking existing tables...");
    const hasTables = await checkTables();
    console.log(hasTables ? "✅ Tables exist" : "❌ No tables found");
  }

  await pool.end();
}

main().catch(console.error);
