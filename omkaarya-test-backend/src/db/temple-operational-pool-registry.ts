import { Pool } from "pg";
import { requirePool } from "./pool.js";
import { poolConfigForTempleOperationalRow } from "./temple-ops-config.js";

type Entry = { pool: Pool };

/** tenant_id -> pool; LRU evicted when cache exceeds max. */
const pools = new Map<string, Entry>();
/** Least-recently-used at front; refreshed on each get. */
const lruTenants: string[] = [];

function refreshLru(tenantId: string): void {
  const i = lruTenants.indexOf(tenantId);
  if (i >= 0) {
    lruTenants.splice(i, 1);
  }
  lruTenants.push(tenantId);
}

function maxCachedPools(): number {
  const raw = process.env.TEMPLE_OPS_POOL_CACHE_MAX?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 48;
  return Number.isFinite(n) && n > 0 ? n : 48;
}

function evictLruUntilUnderCap(cap: number): void {
  while (pools.size > cap) {
    const victim = lruTenants.shift();
    if (!victim) break;
    const entry = pools.get(victim);
    if (entry) {
      pools.delete(victim);
      void entry.pool.end();
    }
  }
}

/**
 * Returns a pooled connection to this temple's operational PostgreSQL database, resolving connection
 * metadata from platform `public.temples`.
 */
export async function getOperationalPoolForTenant(tenantId: string): Promise<Pool | null> {
  const key = tenantId.trim();
  if (!key) {
    return null;
  }

  const existing = pools.get(key);
  if (existing) {
    refreshLru(key);
    return existing.pool;
  }

  const platform = requirePool();
  const { rows } = await platform.query<{
    operational_db_name: string | null;
    operational_database_url: string | null;
  }>(
    `SELECT operational_db_name, operational_database_url FROM public.temples WHERE tenant_id = $1 LIMIT 1`,
    [key]
  );
  if (rows.length === 0) {
    return null;
  }

  const cfg = poolConfigForTempleOperationalRow(rows[0]!);
  if (!cfg) {
    return null;
  }

  const pool = new Pool({ ...cfg, max: 10, idleTimeoutMillis: 30000 });
  pools.set(key, { pool });
  refreshLru(key);
  evictLruUntilUnderCap(maxCachedPools());
  return pool;
}

/** Test / shutdown helper. */
export async function endOperationalPools(): Promise<void> {
  const values = [...pools.values()];
  pools.clear();
  lruTenants.length = 0;
  await Promise.all(values.map((e) => e.pool.end()));
}
