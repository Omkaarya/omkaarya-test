import "../src/load-env.js";
import pg from "pg";
import { getPoolConfig } from "../src/db/config.js";
import { SEED_TEMPLES } from "../src/super-admin/seed-temples.js";

/** Demo invite user for Postman / super-admin invite flow (plain temp password). */
const SEED_USERS: { email: string; temp_password: string }[] = [
  { email: "invite@test.com", temp_password: "temp123" },
];

async function main() {
  const config = getPoolConfig();
  if (!config) {
    console.error("Missing database config. Set DATABASE_URL or DB_USER, DB_HOST, DB_NAME.");
    process.exit(1);
  }

  const client = new pg.Client(config);
  await client.connect();

  try {
    for (const u of SEED_USERS) {
      await client.query(
        `INSERT INTO public.users (email, temp_password)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET temp_password = EXCLUDED.temp_password`,
        [u.email, u.temp_password]
      );
      console.log(`user upserted: ${u.email}`);
    }

    for (const t of SEED_TEMPLES) {
      await client.query(
        `INSERT INTO public.temples (
           tenant_id, name, slug, country_code, country_flag, city, plan, devotees, status, compliance, admin_email
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (tenant_id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           country_code = EXCLUDED.country_code,
           country_flag = EXCLUDED.country_flag,
           city = EXCLUDED.city,
           plan = EXCLUDED.plan,
           devotees = EXCLUDED.devotees,
           status = EXCLUDED.status,
           compliance = EXCLUDED.compliance,
           admin_email = EXCLUDED.admin_email`,
        [
          t.tenantId,
          t.name,
          t.slug,
          t.countryCode,
          t.countryFlag,
          t.city,
          t.plan,
          t.devotees,
          t.status,
          t.compliance,
          t.adminEmail,
        ]
      );
    }
    console.log(`temples upserted: ${SEED_TEMPLES.length} rows`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
