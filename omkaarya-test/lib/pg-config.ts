import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PoolConfig } from "pg";

let triedDevSiblingEnv = false;

/**
 * In local dev, Next is often run without `.env.local` while the Express backend
 * has `omkaarya-test-backend/.env` with `DATABASE_URL`. Load that file (once) so
 * `lib/*-db` can use the same DB. Does not run in production or on Vercel.
 */
function tryLoadDevDatabaseEnvFromSibling(): void {
  if (triedDevSiblingEnv) return;
  triedDevSiblingEnv = true;
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return;
  }

  const cwd = process.cwd();
  const candidates = [
    join(cwd, "..", "omkaarya-test-backend", ".env.local"),
    join(cwd, "..", "omkaarya-test-backend", ".env"),
    join(cwd, "omkaarya-test-backend", ".env.local"),
    join(cwd, "omkaarya-test-backend", ".env"),
  ];

  for (const file of candidates) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const m = t.match(/^(?:export\s+)?([\w.]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const k = m[1];
      let v = m[2].trim();
      if (v === "") continue;
      if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
        v = v.slice(1, -1);
      }
      if (process.env[k] === undefined) {
        process.env[k] = v;
      }
    }
  }
}

/** Same rules as `omkaarya-test-backend/src/db/config.ts` — set in `.env.local` (or share backend `.env` in dev). */
export function getPoolConfig(): PoolConfig | null {
  tryLoadDevDatabaseEnvFromSibling();

  const connectionString = process.env.DATABASE_URL?.trim();
  if (connectionString) {
    return { connectionString };
  }

  const user = process.env.DB_USER?.trim();
  const host = process.env.DB_HOST?.trim();
  const database = process.env.DB_NAME?.trim();
  if (user && host && database) {
    const rawPort = process.env.DB_PORT?.trim();
    const port = rawPort ? Number.parseInt(rawPort, 10) : 5432;
    return {
      user,
      host,
      database,
      password: process.env.DB_PASS ?? "",
      port: Number.isFinite(port) && port > 0 ? port : 5432,
    };
  }

  return null;
}
