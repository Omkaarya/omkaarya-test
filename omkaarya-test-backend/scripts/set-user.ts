import "../src/load-env.js";
import pg from "pg";
import { getPoolConfig } from "../src/db/config.js";

async function main() {
  const config = getPoolConfig();
  if (!config) {
    console.error("Missing database config. Set DATABASE_URL or DB_USER, DB_HOST, DB_NAME.");
    process.exit(1);
  }

  const client = new pg.Client(config);
  await client.connect();

  const email = "omkaaryahq@gmail.com";
  const tempPassword = "Tempu$er2026";
  const tenantId = "f0001001-0001-4001-8001-000000000001"; // Shiva Mandffir London

  try {
    await client.query("BEGIN");

    // 1. Upsert the user row, setting the tenant_id, temp_password, and password_hash = NULL
    await client.query(
      `INSERT INTO public.users (email, temp_password, password_hash, roles, tenant_id)
       VALUES ($1, $2, NULL, ARRAY['Admin']::text[], $3)
       ON CONFLICT (email) DO UPDATE SET
         temp_password = EXCLUDED.temp_password,
         password_hash = NULL,
         tenant_id = EXCLUDED.tenant_id`,
      [email, tempPassword, tenantId]
    );

    // 2. Ensure the temple is associated with the admin email and admin user ID
    const userRes = await client.query<{ id: string }>(
      "SELECT id FROM public.users WHERE email = $1 LIMIT 1",
      [email]
    );
    const userId = userRes.rows[0]?.id;

    if (userId) {
      await client.query(
        `UPDATE public.temples
         SET admin_email = $1, admin_user_id = $2
         WHERE tenant_id = $3`,
        [email, userId, tenantId]
      );
    }

    await client.query("COMMIT");
    console.log(`Successfully configured user ${email} and linked to temple ${tenantId}`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Failed to configure user/temple:", err);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
