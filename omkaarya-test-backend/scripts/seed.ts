import "../src/load-env.js";
import pg from "pg";
import { getPoolConfig } from "../src/db/config.js";
import { SEED_TEMPLES } from "../src/super-admin/seed-temples.js";
import { seedPlatformReferenceData } from "./seed-platform-data.js";

/** Demo invite user for Postman / temple-admin invite flow (plain temp password). */
const SEED_USERS: { email: string; temp_password: string; full_name?: string; roles?: string[] }[] = [
  { email: "invite@test.com", temp_password: "temp123" },
  {
    email: "admin@pepulux.com",
    temp_password: "temp123",
    full_name: "Pepulux Admin",
    roles: ["Super Admin"],
  },
  {
    email: "pepuluxhq@gmail.com",
    temp_password: "Pepul@temple2026",
    full_name: "Omkaarya Super Admin",
    roles: ["Super Admin"],
  },
  {
    email: "omkaaryahq@gmail.com",
    temp_password: "Templeu$er2026",
    full_name: "Omkaarya Temple Admin",
    roles: [],
  },
];

async function seedUsers(client: pg.Client): Promise<void> {
  for (const u of SEED_USERS) {
    await client.query(
      `INSERT INTO public.users (email, temp_password, full_name, roles)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         temp_password = EXCLUDED.temp_password,
         password_hash = NULL,
         full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
         roles = (
           SELECT ARRAY(
             SELECT DISTINCT unnest(COALESCE(public.users.roles, ARRAY[]::text[]) || EXCLUDED.roles)
           )
         )`,
      [u.email, u.temp_password, u.full_name ?? null, u.roles ?? []]
    );
    console.log(`users: upserted ${u.email}`);
  }
}

async function seedTemples(client: pg.Client): Promise<void> {
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
  console.log(`temples: upserted ${SEED_TEMPLES.length} demo rows`);
}

async function main() {
  const config = getPoolConfig();
  if (!config) {
    console.error("Missing database config. Set DATABASE_URL or DB_USER, DB_HOST, DB_NAME.");
    process.exit(1);
  }

  const client = new pg.Client(config);
  await client.connect();

  try {
    console.log("Seeding platform demo/reference data (manual only — not run on server start)...");
    await seedUsers(client);
    await seedPlatformReferenceData(client);
    await seedTemples(client);
    console.log("Done. For pricing plans, run: npm run seed:pricing-plans");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
