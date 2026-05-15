import type { PoolConfig } from "pg";
import { getPoolConfig } from "./config.js";

export type TempleOperationalConnectionRow = {
  operational_db_name: string | null;
  operational_database_url: string | null;
};

/**
 * True when we can build a pg config for a per-temple DB: either TEMPLE_OPS_DB_* / DB_* host+user,
 * or a full platform DATABASE_URL / DB_HOST+DB_USER (same cluster; only database name changes).
 */
export function hasTempleOpsConnectionBasis(): boolean {
  if (getTempleOpsDiscreteEnvFromProcess()) {
    return true;
  }
  const platform = getPoolConfig();
  if (!platform) {
    return false;
  }
  const cs = platform.connectionString?.trim();
  if (cs) {
    return true;
  }
  return Boolean(platform.host && platform.user);
}

/** Same server as platform DB, different `database` (used when DB_HOST is unset but DATABASE_URL is set). */
export function poolConfigFromPlatformWithOperationalDatabase(operationalDbName: string): PoolConfig | null {
  const platform = getPoolConfig();
  if (!platform) {
    return null;
  }
  const name = operationalDbName.trim();
  if (!name) {
    return null;
  }

  const cs = platform.connectionString?.trim();
  if (cs) {
    try {
      const u = new URL(cs);
      u.pathname = `/${name}`;
      return { connectionString: u.href };
    } catch {
      return null;
    }
  }

  if (platform.host && platform.user) {
    return {
      host: platform.host,
      user: platform.user,
      password: platform.password ?? "",
      port: platform.port ?? 5432,
      database: name,
    };
  }

  return null;
}

/** Discrete temple-ops host/user/port/password, with TEMPLE_OPS_* falling back to platform DB_* when unset (same role; only database name differs per temple). */
export function getTempleOpsDiscreteEnvFromProcess(): {
  host: string;
  user: string;
  password: string;
  port: number;
} | null {
  const host = (process.env.TEMPLE_OPS_DB_HOST ?? process.env.DB_HOST)?.trim();
  const user = (process.env.TEMPLE_OPS_DB_USER ?? process.env.DB_USER)?.trim();
  if (!host || !user) {
    return null;
  }
  const rawPort = (process.env.TEMPLE_OPS_DB_PORT ?? process.env.DB_PORT)?.trim();
  const port = rawPort ? Number.parseInt(rawPort, 10) : 5432;
  const passExplicit = process.env.TEMPLE_OPS_DB_PASS;
  const password = passExplicit !== undefined ? passExplicit : (process.env.DB_PASS ?? "");
  return {
    host,
    user,
    password,
    port: Number.isFinite(port) && port > 0 ? port : 5432,
  };
}

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

  const discrete = getTempleOpsDiscreteEnvFromProcess();
  if (discrete) {
    return {
      host: discrete.host,
      user: discrete.user,
      database: name,
      password: discrete.password,
      port: discrete.port,
    };
  }

  return poolConfigFromPlatformWithOperationalDatabase(name);
}
