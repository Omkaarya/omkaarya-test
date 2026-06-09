import pg from "pg";
import { resolveTempleOpsPgSuperuserUrl } from "../db/temple-ops-config.js";

/**
 * Drops a temple operational PostgreSQL database when superuser URL is configured.
 * No-op with a warning when no CREATE DATABASE URL is available.
 */
export async function dropTempleOperationalDatabase(dbName: string): Promise<void> {
  const name = dbName.trim();
  if (!name) return;

  const superUrl = resolveTempleOpsPgSuperuserUrl();
  if (!superUrl) {
    console.warn(
      `[drop-temple-ops-database] No CREATE DATABASE URL — skipping DROP DATABASE for "${name}".`
    );
    return;
  }

  const superClient = new pg.Client({ connectionString: superUrl });
  await superClient.connect();
  try {
    await superClient.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [name]
    );
    const ident = `"${name.replace(/"/g, '""')}"`;
    await superClient.query(`DROP DATABASE IF EXISTS ${ident}`);
    console.log(`[drop-temple-ops-database] dropped database "${name}"`);
  } finally {
    await superClient.end();
  }
}
