import "../src/load-env.js";
import pg from "pg";
import { getPoolConfig } from "../src/db/config.js";

async function main() {
  const config = getPoolConfig();
  if (!config) {
    console.error("Missing DB configuration");
    process.exit(1);
  }
  const client = new pg.Client(config);
  await client.connect();

  try {
    // List tables in public schema
    const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("=== TABLES ===");
    console.log(tablesRes.rows.map(r => r.table_name));

    // Try querying roles table if it exists
    const rolesTable = tablesRes.rows.find(r => r.table_name.includes("role"));
    if (rolesTable) {
      const rolesRes = await client.query(`SELECT * FROM public.${rolesTable.table_name}`);
      console.log(`=== ROLES (${rolesTable.table_name}) ===`);
      console.log(rolesRes.rows);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
