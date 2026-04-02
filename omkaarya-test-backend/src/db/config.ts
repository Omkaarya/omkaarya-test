import type { PoolConfig } from "pg";

/** Shared by `pool.ts` and CLI scripts (`migrate`, `seed`). */
export function getPoolConfig(): PoolConfig | null {
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
