import type { RequestHandler } from "express";
import { jwtVerify } from "jose";
import { getPool } from "../../db/pool.js";
import { HttpError } from "../../middleware/http-error.js";

export type TempleSessionLocals = {
  email: string;
  tenantId: string;
  platformUserId: string;
};

function jwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim() || "";
  return new TextEncoder().encode(secret);
}

/**
 * Verifies Bearer JWT (same secret as Next.js), requires `tenantId`, and validates user against platform DB.
 */
export const requireTempleJwtSession: RequestHandler = async (_req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
      throw new HttpError(500, "Server misconfigured: JWT_SECRET is missing.", {
        code: "CONFIG_ERROR",
        reason: "JWT_SECRET must match the Next.js app for temple-operational APIs.",
      });
    }

    const raw = typeof _req.headers.authorization === "string" ? _req.headers.authorization.trim() : "";
    const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : "";
    if (!token) {
      throw new HttpError(401, "Authentication required.", {
        code: "UNAUTHORIZED",
        reason: "Missing Bearer token.",
      });
    }

    const { payload } = await jwtVerify(token, jwtSecretKey(), { algorithms: ["HS256"] });

    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const tenantClaim =
      typeof payload.tenantId === "string"
        ? payload.tenantId.trim()
        : payload.tenant_id != null
          ? String(payload.tenant_id).trim()
          : "";

    if (!email || !tenantClaim) {
      throw new HttpError(403, "Temple session required.", {
        code: "FORBIDDEN",
        reason: "This endpoint is only available for temple administrators with a tenant context.",
      });
    }

    const pool = getPool();
    if (!pool) {
      throw new HttpError(503, "Platform database unavailable.", {
        code: "SERVICE_UNAVAILABLE",
        reason: "Cannot validate session.",
      });
    }

    const uidClaim = payload.userId;
    const userIdStr = typeof uidClaim === "number" ? String(uidClaim) : typeof uidClaim === "string" ? uidClaim.trim() : "";

    const userRes = await pool.query<{ id: string; tenant_id: string | null }>(
      `SELECT id, tenant_id FROM public.users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
      [email]
    );

    if (userRes.rows.length === 0) {
      throw new HttpError(401, "Invalid session.", {
        code: "INVALID_SESSION",
        reason: "User not found for this email.",
      });
    }

    const u = userRes.rows[0]!;
    if (u.tenant_id !== tenantClaim) {
      throw new HttpError(403, "Tenant mismatch.", {
        code: "FORBIDDEN",
        reason: "Session tenant does not match the user record.",
      });
    }

    const normalizedClaim = userIdStr.trim().toLowerCase();
    const normalizedDb = String(u.id).trim().toLowerCase();
    if (normalizedClaim && normalizedClaim !== normalizedDb) {
      throw new HttpError(403, "Invalid session.", {
        code: "INVALID_SESSION",
        reason: "User id claim does not match the user record.",
      });
    }

    (res.locals as { templeSession: TempleSessionLocals }).templeSession = {
      email,
      tenantId: tenantClaim,
      platformUserId: String(u.id),
    };
    next();
  } catch (e) {
    if (e instanceof HttpError) {
      next(e);
      return;
    }
    next(
      new HttpError(401, "Invalid or expired token.", {
        code: "INVALID_TOKEN",
        reason: e instanceof Error ? e.message : "Verification failed.",
      })
    );
  }
};
