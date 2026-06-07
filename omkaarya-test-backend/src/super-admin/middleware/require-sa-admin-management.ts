import type { RequestHandler } from "express";
import { getPool } from "../../db/pool.js";
import { HttpError } from "../../middleware/http-error.js";

/**
 * Restricts admin-user / admin-role mutations to Super Admin sa_role holders
 * (or legacy platform users without an sa_users row).
 */
export const requireSaAdminManagement: RequestHandler = async (_req, res, next) => {
  try {
    const session = (
      res.locals as { superAdminSession?: { email: string; platformUserId: string } }
    ).superAdminSession;
    if (!session?.email) {
      throw new HttpError(401, "Authentication required.", {
        code: "UNAUTHORIZED",
        reason: "Missing super-admin session.",
      });
    }

    const pool = getPool();
    if (!pool) {
      throw new HttpError(503, "Platform database unavailable.", {
        code: "SERVICE_UNAVAILABLE",
        reason: "Cannot validate admin management access.",
      });
    }

    const { rows } = await pool.query<{ role_name: string | null; is_active: boolean }>(
      `SELECT r.name AS role_name, u.is_active
       FROM sa_users u
       LEFT JOIN sa_roles r ON r.id = u.role_id
       WHERE lower(trim(u.email)) = lower(trim($1))
       LIMIT 1`,
      [session.email]
    );

    const saUser = rows[0];
    if (!saUser) {
      next();
      return;
    }

    if (!saUser.is_active) {
      throw new HttpError(403, "Account inactive.", {
        code: "FORBIDDEN",
        reason: "Your super-admin portal account is inactive.",
      });
    }

    const roleName = (saUser.role_name ?? "").trim().toLowerCase();
    if (roleName !== "super admin") {
      throw new HttpError(403, "Insufficient permissions.", {
        code: "FORBIDDEN",
        reason: "Only Super Admin role holders can manage platform users and roles.",
      });
    }

    next();
  } catch (e) {
    next(e);
  }
};
