import type { PoolConfig } from "pg";

export type TempleOperationalConnectionRow = {
  operational_db_name: string | null;
  operational_database_url: string | null;
};

/**
 * Build a pg pool config for a temple operational database from directory row + shared TEMPLE_OPS_* env.
 */
export function poolConfigForTempleOperationalRow(row: TempleOperationalConnectionRow): PoolConfig | null {
  const url = row.operational_database_url?.trim();
  if (url) {
    if (process.env.TEMPLE_OPS_ALLOW_DATABASE_URL?.trim() !== "1") {
      return null;
    }

    const allowedHosts = (process.env.TEMPLE_OPS_ALLOWED_DATABASE_URL_HOSTS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    try {
      const parsed = new URL(url);
      const protocolAllowed = parsed.protocol === "postgres:" || parsed.protocol === "postgresql:";
      const hostAllowed = allowedHosts.length > 0 && allowedHosts.includes(parsed.hostname.toLowerCase());
      if (!protocolAllowed || !hostAllowed) {
        return null;
      }
    } catch {
      return null;
    }

    return { connectionString: url };
  }

  const name = row.operational_db_name?.trim();
  if (!name) {
    return null;
  }

  const host = process.env.TEMPLE_OPS_DB_HOST?.trim();
  const user = process.env.TEMPLE_OPS_DB_USER?.trim();
  if (!host || !user) {
    return null;
  }

  const rawPort = process.env.TEMPLE_OPS_DB_PORT?.trim();
  const port = rawPort ? Number.parseInt(rawPort, 10) : 5432;

  return {
    host,
    user,
    database: name,
    password: process.env.TEMPLE_OPS_DB_PASS ?? "",
    port: Number.isFinite(port) && port > 0 ? port : 5432,
  };
}
