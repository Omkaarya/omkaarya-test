import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg, { type PoolConfig } from "pg";
import { getPoolConfig } from "./config.js";

/** Backend package root (folder that contains `migrations/` and `src/`). */
export const BACKEND_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const PLATFORM_MIGRATIONS_DIR = join(BACKEND_ROOT, "migrations");
export const TEMPLE_OPS_MIGRATIONS_DIR = join(BACKEND_ROOT, "migrations-temple-ops");

/**
 * Applies any `*.sql` files in `migrationsDir` not yet recorded in `schema_migrations` on the target database.
 */
export async function runPendingMigrationsFromDir(
  migrationsDir: string,
  config: PoolConfig
): Promise<{ applied: string[]; skipped: string[] }> {
  if (!existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const client = new pg.Client(config);
  await client.connect();

  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const done = new Set(
      (await client.query<{ name: string }>("SELECT name FROM schema_migrations")).rows.map((r) => r.name)
    );

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.warn(`[migrate] No .sql files in ${migrationsDir}`);
    }

    for (const file of files) {
      if (done.has(file)) {
        skipped.push(file);
        continue;
      }
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        applied.push(file);
        console.log(`[migrate] ok  ${file}`);
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    }
  } finally {
    await client.end();
  }

  return { applied, skipped };
}

/**
 * Platform database: `migrations/*.sql` using `DATABASE_URL` / `DB_*`.
 */
export async function runPendingMigrations(): Promise<{ applied: string[]; skipped: string[] }> {
  const config = getPoolConfig();
  if (!config) {
    throw new Error("Missing database config. Set DATABASE_URL or DB_USER, DB_HOST, DB_NAME.");
  }
  return runPendingMigrationsFromDir(PLATFORM_MIGRATIONS_DIR, config);
}

/**
 * Temple operational database (per-tenant): `migrations-temple-ops/*.sql` using an explicit pool config.
 */
export async function runPendingTempleOpsMigrations(
  templeOpsPoolConfig: PoolConfig
): Promise<{ applied: string[]; skipped: string[] }> {
  return runPendingMigrationsFromDir(TEMPLE_OPS_MIGRATIONS_DIR, templeOpsPoolConfig);
}
