import type { RequestHandler } from "express";
import { jwtVerify } from "jose";
import { getPool } from "../../db/pool.js";
import { HttpError } from "../../middleware/http-error.js";

function jwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(500, "Server misconfigured: JWT_SECRET is missing.", {
        code: "CONFIG_ERROR",
        reason: "JWT_SECRET is required before protected super-admin APIs can be used.",
      });
    }
    return new TextEncoder().encode("local-development-only-secret");
  }
  return new TextEncoder().encode(secret);
}

export const requireSuperAdminJwt: RequestHandler = async (req, res, next) => {
  try {
    const raw = typeof req.headers.authorization === "string" ? req.headers.authorization.trim() : "";
    const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : "";
    if (!token) {
      throw new HttpError(401, "Authentication required.", {
        code: "UNAUTHORIZED",
        reason: "Missing Bearer token.",
      });
    }

    const { payload } = await jwtVerify(token, jwtSecretKey(), { algorithms: ["HS256"] });
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const tenantId =
      typeof payload.tenantId === "string"
        ? payload.tenantId.trim()
        : typeof payload.tenant_id === "string"
          ? payload.tenant_id.trim()
          : "";

    if (!email || tenantId) {
      throw new HttpError(403, "Super-admin session required.", {
        code: "FORBIDDEN",
        reason: "This endpoint requires a platform super-admin session.",
      });
    }

    const pool = getPool();
    if (!pool) {
      throw new HttpError(503, "Platform database unavailable.", {
        code: "SERVICE_UNAVAILABLE",
        reason: "Cannot validate super-admin session.",
      });
    }

    const { rows } = await pool.query<{ id: string; roles: string[] | null }>(
      `SELECT id, roles FROM public.users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
      [email]
    );
    const roles = rows[0]?.roles ?? [];
    if (!Array.isArray(roles) || !roles.some((r) => r.trim().toLowerCase() === "super admin")) {
      throw new HttpError(403, "Super-admin role required.", {
        code: "FORBIDDEN",
        reason: "The authenticated user does not have the Super Admin role.",
      });
    }

    (res.locals as { superAdminSession?: { email: string; platformUserId: string } }).superAdminSession = {
      email,
      platformUserId: rows[0]!.id,
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
        reason: "Token verification failed.",
      })
    );
  }
};
