/**
 * Lazy PostgreSQL pool. Configure either:
 * - `DATABASE_URL` (full connection string), or
 * - `DB_USER`, `DB_HOST`, `DB_NAME`, and optionally `DB_PASS`, `DB_PORT` (default 5432).
 * No connection is opened until the pool is first used.
 */
import { Pool } from "pg";
import { getPoolConfig } from "./config.js";

let pool: Pool | null = null;
let missingConfigLogged = false;

export { getPoolConfig } from "./config.js";

export function getPool(): Pool | null {
  const config = getPoolConfig();
  if (!config) {
    if (!missingConfigLogged) {
      console.warn(
        "[db] No database config: set DATABASE_URL or DB_USER, DB_HOST, DB_NAME (and optional DB_PASS, DB_PORT)."
      );
      missingConfigLogged = true;
    }
    return null;
  }
  if (!pool) {
    pool = new Pool(config);
  }
  return pool;
}

export function requirePool(): Pool {
  const p = getPool();
  if (!p) {
    throw new Error("Database pool is not available");
  }
  return p;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
