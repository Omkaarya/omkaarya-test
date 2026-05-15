import type { Pool, PoolClient } from "pg";
import { getPool } from "./pool.js";
import { endOperationalPools, getOperationalPoolForTenant } from "./temple-operational-pool-registry.js";

async function columnDataType(client: PoolClient, table: string, column: string): Promise<string | null> {
  const r = await client.query<{ data_type: string }>(
    `SELECT data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return r.rows[0]?.data_type ?? null;
}

async function migrateOpsPool(opsPool: Pool, map: Map<number, string>, label: string): Promise<void> {
  const c = await opsPool.connect();
  try {
    const tbl = await c.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'temple_auth_mirror'
       ) AS exists`
    );
    if (!tbl.rows[0]?.exists) {
      console.log(`[ops-mirror] [${label}] skip — no temple_auth_mirror table`);
      return;
    }

    const dt = await columnDataType(c, "temple_auth_mirror", "platform_user_id");
    if (dt === "uuid") {
      console.log(`[ops-mirror] [${label}] skip — platform_user_id already UUID`);
      return;
    }
    if (dt !== "integer" && dt !== "bigint" && dt !== "smallint") {
      console.log(`[ops-mirror] [${label}] skip — unexpected platform_user_id type: ${dt ?? "null"}`);
      return;
    }

    const hasStaging = await c.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'temple_auth_mirror'
           AND column_name = 'platform_user_uuid'
       ) AS exists`
    );

    await c.query("BEGIN");
    if (!hasStaging.rows[0]?.exists) {
      await c.query(`ALTER TABLE temple_auth_mirror ADD COLUMN platform_user_uuid UUID`);
    }

    const rows = await c.query<{ platform_user_id: number; email: string }>(
      `SELECT platform_user_id, email FROM temple_auth_mirror`
    );
    for (const row of rows.rows) {
      const oldId = Number(row.platform_user_id);
      const newId = map.get(oldId);
      if (!newId) {
        console.warn(
          `[ops-mirror] [${label}] dropping mirror row with unknown platform_user_id=${oldId} email=${row.email}`
        );
        await c.query(`DELETE FROM temple_auth_mirror WHERE lower(trim(email)) = lower(trim($1))`, [row.email]);
        continue;
      }
      await c.query(`UPDATE temple_auth_mirror SET platform_user_uuid = $1 WHERE lower(trim(email)) = lower(trim($2))`, [
        newId,
        row.email,
      ]);
    }

    await c.query(`DELETE FROM temple_auth_mirror WHERE platform_user_uuid IS NULL`);

    await c.query(`DROP INDEX IF EXISTS idx_temple_auth_mirror_platform_user_id`);
    await c.query(`ALTER TABLE temple_auth_mirror DROP COLUMN platform_user_id`);
    await c.query(`ALTER TABLE temple_auth_mirror RENAME COLUMN platform_user_uuid TO platform_user_id`);
    await c.query(`ALTER TABLE temple_auth_mirror ALTER COLUMN platform_user_id SET NOT NULL`);
    await c.query(
      `CREATE INDEX IF NOT EXISTS idx_temple_auth_mirror_platform_user_id ON temple_auth_mirror (platform_user_id)`
    );
    await c.query("COMMIT");
    console.log(`[ops-mirror] [${label}] migrated temple_auth_mirror.platform_user_id to UUID`);
  } catch (e) {
    await c.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

export type OpsAuthMirrorMigrationResult =
  | { ok: true; tenantsWithOpsPool: number }
  | { ok: false; reason: "NO_PLATFORM_POOL" | "NO_MAP_TABLE" | "EMPTY_MAP" };

/**
 * Best-effort INTEGER → UUID rewrite for `temple_auth_mirror.platform_user_id` on each ops DB,
 * using `public.uuid_migration_user_map` from platform migration 029.
 *
 * Safe on every cold start: no-op when the map table is missing/empty or ops columns are already UUID.
 * Per-tenant failures are logged and do not stop other tenants.
 */
export async function runOpsAuthMirrorUserIdMigration(): Promise<OpsAuthMirrorMigrationResult> {
  const platform = getPool();
  if (!platform) {
    console.warn("[ops-mirror] skipped — platform database pool not configured");
    return { ok: false, reason: "NO_PLATFORM_POOL" };
  }

  let mapRes: { rows: { old_id: number; new_id: string }[] };
  try {
    mapRes = await platform.query<{ old_id: number; new_id: string }>(
      `SELECT old_id, new_id::text AS new_id FROM public.uuid_migration_user_map`
    );
  } catch (e) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "42P01") {
      console.log("[ops-mirror] skipped — uuid_migration_user_map not present (platform migration 029 not applied yet)");
      return { ok: false, reason: "NO_MAP_TABLE" };
    }
    throw e;
  }

  if (mapRes.rows.length === 0) {
    console.log("[ops-mirror] skipped — uuid_migration_user_map is empty");
    return { ok: false, reason: "EMPTY_MAP" };
  }

  const map = new Map(mapRes.rows.map((r) => [Number(r.old_id), r.new_id]));
  const tenants = await platform.query<{ tenant_id: string }>(`SELECT tenant_id::text AS tenant_id FROM public.temples`);

  let tenantsWithOpsPool = 0;
  for (const { tenant_id } of tenants.rows) {
    const tid = tenant_id.trim();
    if (!tid) continue;
    const ops = await getOperationalPoolForTenant(tid);
    if (!ops) {
      console.log(`[ops-mirror] [tenant ${tid}] skip — no operational pool`);
      continue;
    }
    tenantsWithOpsPool += 1;
    try {
      await migrateOpsPool(ops, map, tid);
    } catch (e) {
      console.error(`[ops-mirror] [tenant ${tid}] migration failed:`, e);
    }
  }

  await endOperationalPools();
  console.log(`[ops-mirror] pass complete (${tenantsWithOpsPool} tenant(s) with ops pool checked)`);
  return { ok: true, tenantsWithOpsPool };
}
