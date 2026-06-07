import { Router } from "express";
import { getPool } from "../db/pool.js";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";

function normalizeRolesFromDb(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((r) => String(r).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((r) => String(r).trim()).filter(Boolean);
        }
      } catch {
        /* fall through */
      }
    }
    if (s.includes(",")) {
      return s.split(",").map((x) => x.trim()).filter(Boolean);
    }
    return [s];
  }
  return [];
}

export function createSuperAdminSessionRouter(): Router {
  const r = Router();

  /** GET /api/super-admin/me — current platform super-admin profile (requires Bearer JWT). */
  r.get(
    "/super-admin/me",
    asyncHandler(async (_req, res) => {
      const session = (
        res.locals as { superAdminSession?: { email: string; platformUserId: string } }
      ).superAdminSession;
      if (!session?.email) {
        throw new HttpError(401, "Super-admin authentication required", {
          code: "UNAUTHORIZED",
          reason: "Sign in with a super-admin account to continue.",
        });
      }

      const pool = getPool();
      if (!pool) {
        throw new HttpError(503, "Platform database unavailable.", {
          code: "SERVICE_UNAVAILABLE",
          reason: "Cannot load super-admin profile.",
        });
      }

      const result = await pool.query<{ full_name: string | null; roles: unknown }>(
        `SELECT full_name, roles FROM public.users WHERE id = $1 LIMIT 1`,
        [session.platformUserId]
      );
      const row = result.rows[0];
      if (!row) {
        throw new HttpError(404, "User not found.", {
          code: "NOT_FOUND",
          reason: "No platform user record for this session.",
        });
      }

      const saProfile = await pool.query<{
        id: string;
        name: string;
        role_id: string | null;
        role_name: string | null;
        is_active: boolean;
        last_login: string | null;
      }>(
        `SELECT u.id, u.name, u.role_id, r.name AS role_name, u.is_active, u.last_login::text
         FROM sa_users u
         LEFT JOIN sa_roles r ON r.id = u.role_id
         WHERE lower(trim(u.email)) = lower(trim($1))
         LIMIT 1`,
        [session.email]
      );
      const sa = saProfile.rows[0];

      sendSuccess(
        res,
        200,
        {
          email: session.email,
          fullName: row.full_name?.trim() || sa?.name?.trim() || null,
          roles: normalizeRolesFromDb(row.roles),
          saUser: sa
            ? {
                id: sa.id,
                name: sa.name,
                roleId: sa.role_id,
                roleName: sa.role_name,
                isActive: sa.is_active,
                lastLogin: sa.last_login,
              }
            : null,
        },
        "Profile loaded",
        "Current super-admin session"
      );
    })
  );

  return r;
}
