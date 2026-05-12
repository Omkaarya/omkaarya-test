/**
 * Creates the operational PostgreSQL database for a tenant (when configured), runs temple-ops migrations,
 * and sets `public.temples.operational_db_name`. Used by super-admin temple creation.
 */
import pg from "pg";
import { getPoolConfig } from "../db/config.js";
import { runPendingTempleOpsMigrations } from "../db/run-migrations.js";
import { poolConfigForTempleOperationalRow } from "../db/temple-ops-config.js";

function safeOperationalDbName(prefix: string, tenantId: string): string {
  const combined = `${prefix}${tenantId}`.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
  return combined.slice(0, 63);
}

async function ensureDatabaseExists(dbName: string): Promise<void> {
  const superUrl = process.env.TEMPLE_OPS_PG_SUPERUSER_URL?.trim();
  if (!superUrl) {
    console.warn(
      "[ensure-temple-ops-database] TEMPLE_OPS_PG_SUPERUSER_URL unset — skipping CREATE DATABASE (create manually or run temple-ops:bootstrap)."
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
      return;
    }
    const ident = '"' + dbName.replace(/"/g, '""') + '"';
    await superClient.query(`CREATE DATABASE ${ident}`);
    console.log(`[ensure-temple-ops-database] created database "${dbName}"`);
  } finally {
    await superClient.end();
  }
}

export type EnsureTempleOpsDatabaseResult =
  | { ok: true; operationalDbName: string }
  | { ok: false; reason: "no_platform_db" | "no_ops_config" };

/**
 * Ensures the temple has an operational DB name and migrations applied.
 * Returns `no_ops_config` when TEMPLE_OPS_DB_HOST (etc.) is missing — caller may treat as hard error for new temples.
 */
export async function ensureTempleOpsDatabaseMigrated(tenantId: string): Promise<EnsureTempleOpsDatabaseResult> {
  const id = tenantId.trim();
  if (!id) return { ok: false, reason: "no_ops_config" };

  const platformConfig = getPoolConfig();
  if (!platformConfig) {
    return { ok: false, reason: "no_platform_db" };
  }

  const platform = new pg.Client(platformConfig);
  await platform.connect();
  let operationalDbName: string | null = null;
  try {
    const cur = await platform.query<{ operational_db_name: string | null }>(
      `SELECT operational_db_name FROM public.temples WHERE tenant_id = $1 LIMIT 1`,
      [id]
    );
    operationalDbName = cur.rows[0]?.operational_db_name?.trim() || null;
    if (!operationalDbName) {
      const prefix = (process.env.TEMPLE_OPS_DB_NAME_PREFIX ?? "omkaarya_temple_").trim();
      operationalDbName = safeOperationalDbName(prefix, id);
      await ensureDatabaseExists(operationalDbName);
    }
    const cfg = poolConfigForTempleOperationalRow({
      operational_db_name: operationalDbName,
      operational_database_url: null,
    });
    if (!cfg) {
      return { ok: false, reason: "no_ops_config" };
    }
    await runPendingTempleOpsMigrations(cfg);
    await platform.query(`UPDATE public.temples SET operational_db_name = $1 WHERE tenant_id = $2`, [
      operationalDbName,
      id,
    ]);
    return { ok: true, operationalDbName };
  } finally {
    await platform.end();
  }
}
