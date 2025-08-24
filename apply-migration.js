import { Pool } from "pg";
import { readFileSync } from "fs";

const pool = new Pool({
  connectionString: "postgres://myuser:mypassword@localhost:5432/capturebychristian",
});

async function applyMigration() {
  try {
    console.log("📋 Reading migration file...");
    const sql = readFileSync("migrations/0000_fantastic_vindicator.sql", "utf8");
    
    console.log("🚀 Applying migration...");
    await pool.query(sql);
    
    console.log("✅ Migration applied successfully!");
    return true;
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    return false;
  }
}

async function main() {
  const success = await applyMigration();
  if (success) {
    console.log("🎉 Database setup completed!");
  } else {
    console.log("💥 Database setup failed");
  }
  await pool.end();
}

main().catch(console.error);
