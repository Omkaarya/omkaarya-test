/**
 * Create (optional) and migrate a temple operational database, then point `public.temples.operational_db_name` at it.
 *
 * Usage:
 *   tsx scripts/temple-ops-bootstrap.ts <tenant_id>
 *
 * Env:
 *   - Platform: DATABASE_URL or DB_* (same as main app)
 *   - TEMPLE_OPS_DB_HOST, TEMPLE_OPS_DB_USER, TEMPLE_OPS_DB_PASS, TEMPLE_OPS_DB_PORT — optional; default to DB_HOST, DB_USER, DB_PASS, DB_PORT (same role on one server; only the database name differs per temple)
 *   - TEMPLE_OPS_DB_NAME_PREFIX (default omkaarya_temple_) — database name = prefix + tenant_id (sanitized)
 *   - TEMPLE_OPS_PG_SUPERUSER_URL — optional; connect to maintenance DB `postgres` to run CREATE DATABASE
 */
import "../src/load-env.js";
import pg from "pg";
import { getPoolConfig } from "../src/db/config.js";
import { runPendingTempleOpsMigrations } from "../src/db/run-migrations.js";
import { poolConfigForTempleOperationalRow, resolveTempleOpsPgSuperuserUrl } from "../src/db/temple-ops-config.js";
import { syncTempleAuthMirrorFromPlatformUserId } from "../src/temple-ops/sync-auth-mirror.js";

function safeOperationalDbName(prefix: string, tenantId: string): string {
  const combined = `${prefix}${tenantId}`.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
  return combined.slice(0, 63);
}

async function ensureDatabaseExists(dbName: string): Promise<void> {
  const superUrl = resolveTempleOpsPgSuperuserUrl();
  if (!superUrl) {
    console.warn(
      "[temple-ops:bootstrap] No CREATE DATABASE URL — skipping CREATE DATABASE (create it manually first)."
    );
    return;
  }

  const superClient = new pg.Client({ connectionString: superUrl });
  await superClient.connect();
  try {
    const exists = await superClient.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists`,
      [dbName]
    );
    if (exists.rows[0]?.exists) {
      console.log(`[temple-ops:bootstrap] database "${dbName}" already exists`);
      return;
    }
    const ident = '"' + dbName.replace(/"/g, '""') + '"';
    await superClient.query(`CREATE DATABASE ${ident}`);
    console.log(`[temple-ops:bootstrap] created database "${dbName}"`);
  } finally {
    await superClient.end();
  }
}

async function main(): Promise<void> {
  const tenantId = process.argv[2]?.trim();
  if (!tenantId) {
    console.error("Usage: tsx scripts/temple-ops-bootstrap.ts <tenant_id>");
    process.exit(1);
  }

  const platformConfig = getPoolConfig();
  if (!platformConfig) {
    console.error("[temple-ops:bootstrap] Set DATABASE_URL or DB_USER/DB_HOST/DB_NAME.");
    process.exit(1);
  }

  const platformClient = new pg.Client(platformConfig);
  await platformClient.connect();
  let adminUserId: string | undefined;
  try {
    const t = await platformClient.query<{ tenant_id: string; operational_db_name: string | null }>(
      `SELECT tenant_id, operational_db_name FROM public.temples WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );
    if (t.rows.length === 0) {
      console.error(`[temple-ops:bootstrap] No temple with tenant_id=${tenantId}.`);
      process.exit(1);
    }

    const uid = await platformClient.query<{ id: string }>(
      `SELECT u.id FROM public.users u
        WHERE u.tenant_id = $1
        ORDER BY u.email ASC
        LIMIT 1`,
      [tenantId]
    );
    adminUserId = uid.rows[0]?.id;
  } finally {
    await platformClient.end();
  }

  const prefix = (process.env.TEMPLE_OPS_DB_NAME_PREFIX ?? "omkaarya_temple_").trim();
  const operationalDbName = safeOperationalDbName(prefix, tenantId);

  await ensureDatabaseExists(operationalDbName);

  const bootstrapCfg = poolConfigForTempleOperationalRow({
    operational_db_name: operationalDbName,
    operational_database_url: null,
  });
  if (!bootstrapCfg) {
    console.error(
      "[temple-ops:bootstrap] Cannot build ops pool config — set DB_HOST and DB_USER (or TEMPLE_OPS_DB_HOST / TEMPLE_OPS_DB_USER), and password/port as needed."
    );
    process.exit(1);
  }

  const { applied, skipped } = await runPendingTempleOpsMigrations(bootstrapCfg);
  console.log(`[temple-ops:bootstrap] migrations applied: ${applied.length}, skipped: ${skipped.length}`);

  const plat2 = new pg.Client(platformConfig);
  await plat2.connect();
  try {
    await plat2.query(`UPDATE public.temples SET operational_db_name = $1 WHERE tenant_id = $2`, [
      operationalDbName,
      tenantId,
    ]);
    console.log(`[temple-ops:bootstrap] updated temples.operational_db_name="${operationalDbName}" for tenant ${tenantId}`);
  } finally {
    await plat2.end();
  }

  if (adminUserId != null) {
    await syncTempleAuthMirrorFromPlatformUserId(adminUserId);
    console.log(`[temple-ops:bootstrap] synced auth mirror for platform user ${adminUserId}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
