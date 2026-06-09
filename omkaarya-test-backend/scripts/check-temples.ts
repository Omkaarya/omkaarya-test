import "../src/load-env.js";
import pg from "pg";
import { getPoolConfig } from "../src/db/config.js";

async function main() {
  const config = getPoolConfig();
  if (!config) {
    console.error("Missing config");
    return;
  }
  const client = new pg.Client(config);
  await client.connect();

  const userRes = await client.query("SELECT id, email, tenant_id FROM public.users WHERE email = 'omkaaryahq@gmail.com';");
  console.log("User details:", userRes.rows);

  const templeRes = await client.query("SELECT tenant_id, name, admin_email, admin_user_id FROM public.temples;");
  console.log("Temples in database:", templeRes.rows);

  await client.end();
}

main().catch(console.error);
