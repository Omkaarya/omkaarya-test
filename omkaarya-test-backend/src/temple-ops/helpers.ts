import type { Response } from "express";
import type { Pool } from "pg";
import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";
import { HttpError } from "../middleware/http-error.js";
import type { TempleSessionLocals } from "./middleware/require-temple-jwt.js";

export function templeSession(res: Response): TempleSessionLocals {
  return (res.locals as { templeSession?: TempleSessionLocals }).templeSession!;
}

/**
 * Returns the operational pool for the current request's tenant, or throws a stable HttpError
 * when the tenant has no operational database configured. Use this in handlers that mutate state.
 */
export async function requireTenantPool(res: Response): Promise<Pool> {
  const tenantId = templeSession(res).tenantId;
  const pool = await getOperationalPoolForTenant(tenantId);
  if (!pool) {
    throw new HttpError(
      503,
      "Temple operational database is not configured for this tenant.",
      {
        code: "TEMPLE_OPS_DB_MISSING",
        reason:
          "Set temples.operational_db_name (or operational_database_url) and TEMPLE_OPS_DB_* / run temple-ops migrations.",
      }
    );
  }
  return pool;
}

/** Returns the operational pool, or null when unconfigured. Use in read-only handlers that should respond with empty data instead of erroring. */
export async function getTenantPoolOrNull(res: Response): Promise<Pool | null> {
  const tenantId = templeSession(res).tenantId;
  return getOperationalPoolForTenant(tenantId);
}
