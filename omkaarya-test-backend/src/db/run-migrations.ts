import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { getPoolConfig } from "./config.js";

/** Backend package root (folder that contains `migrations/` and `src/`). */
const BACKEND_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MIGRATIONS_DIR = join(BACKEND_ROOT, "migrations");

/**
 * Applies any `migrations/*.sql` files not yet recorded in `schema_migrations`.
 */
export async function runPendingMigrations(): Promise<{ applied: string[]; skipped: string[] }> {
  const config = getPoolConfig();
  if (!config) {
    throw new Error("Missing database config. Set DATABASE_URL or DB_USER, DB_HOST, DB_NAME.");
  }

  if (!existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
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

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.warn(`[migrate] No .sql files in ${MIGRATIONS_DIR}`);
    }

    for (const file of files) {
      if (done.has(file)) {
        skipped.push(file);
        continue;
      }
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
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
