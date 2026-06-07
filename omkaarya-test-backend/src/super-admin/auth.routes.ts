import { Router } from "express";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { sendError, sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { AuthService } from "./auth.service.js";
import { loginBodySchema, setPasswordBodySchema, superAdminRegisterBodySchema } from "./validation.js";
import { getPool } from "../db/pool.js";
import { hashPasswordCredential } from "./password-credentials.js";
import type { PostgresSaRbacRepository } from "./sa-rbac.repository.js";

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

const setPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

const superAdminRegisterLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export function createAuthRouter(auth: AuthService, saRbac?: PostgresSaRbacRepository): Router {
  const r = Router();

  /**
   * POST /api/super-admin/register
   *
   * Creates (or updates) a user row with role Super Admin.
   * Requires header x-super-admin-register-token matching SUPER_ADMIN_REGISTER_TOKEN.
   */
  r.post(
    "/super-admin/register",
    superAdminRegisterLimiter,
    validateBody(superAdminRegisterBodySchema),
    asyncHandler(async (req, res) => {
      const token = (req.header("x-super-admin-register-token") ?? "").trim();
      const expected = (process.env.SUPER_ADMIN_REGISTER_TOKEN ?? "").trim();

      if (!expected) {
        return sendError(
          res,
          503,
          "NOT_CONFIGURED",
          "Registration unavailable",
          "SUPER_ADMIN_REGISTER_TOKEN is not configured on the server."
        );
      }
      if (!token || token !== expected) {
        return sendError(
          res,
          403,
          "FORBIDDEN",
          "Forbidden",
          "Missing or invalid super-admin registration token."
        );
      }

      const pool = getPool();
      if (!pool) {
        throw new HttpError(500, "Database not configured", {
          code: "DB_NOT_CONFIGURED",
          reason: "The PostgreSQL pool is not configured, so users cannot be created.",
        });
      }

      const body = req.body as {
        email: string;
        tempPassword?: string;
        permanentPassword?: string;
        fullName?: string;
        whatsapp?: string;
        roles?: string[];
      };

      const email = body.email.trim().toLowerCase();
      const roles = (body.roles?.length ? body.roles : ["Super Admin"]).map((r) => r.trim()).filter(Boolean);
      const fullName = typeof body.fullName === "string" ? body.fullName.trim() : null;
      const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : null;

      const permanentPassword = (body.permanentPassword ?? "").trim();
      const tempPassword = (body.tempPassword ?? "").trim();

      const passwordHash = permanentPassword ? await hashPasswordCredential(permanentPassword) : null;
      const effectiveTemp = passwordHash ? null : tempPassword ? await hashPasswordCredential(tempPassword) : null;

      const client = await pool.connect();
      try {
        const q = await client.query<{ id: string; tenant_id: string | null }>(
          `INSERT INTO public.users (email, temp_password, password_hash, full_name, whatsapp, roles)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO UPDATE SET
             temp_password = COALESCE(EXCLUDED.temp_password, public.users.temp_password),
             password_hash = COALESCE(EXCLUDED.password_hash, public.users.password_hash),
             full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
             whatsapp = COALESCE(EXCLUDED.whatsapp, public.users.whatsapp),
             roles = CASE
               WHEN $7::boolean THEN EXCLUDED.roles
               ELSE public.users.roles
             END
           RETURNING id, tenant_id`,
          [email, effectiveTemp, passwordHash, fullName, whatsapp, roles, Boolean(body.roles?.length)]
        );

        sendSuccess(
          res,
          201,
          {
            userId: q.rows[0]!.id,
            tenantId: q.rows[0]!.tenant_id,
            email,
            roles,
            firstLogin: passwordHash ? false : true,
          },
          "Super-admin registered",
          "A super-admin user was created (or updated) in the application database."
        );
      } finally {
        client.release();
      }
    })
  );

  r.post(
    "/login",
    loginLimiter,
    validateBody(loginBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as { email: string; password?: string; tempPassword?: string };
      const password = (body.password ?? body.tempPassword ?? "").trim();
      const result = await auth.login(body.email, password);
      if (!result.ok) {
        if ("billingDenied" in result && result.billingDenied) {
          throw new HttpError(403, result.billingDenied.message, {
            code: result.billingDenied.code,
            reason: result.billingDenied.message,
          });
        }
        throw new HttpError(401, "Invalid credentials", {
          code: "INVALID_CREDENTIALS",
          reason: "The email and password did not match a user, or the account cannot log in in this way.",
        });
      }

      if (saRbac) {
        try {
          await saRbac.touchLastLogin(body.email);
        } catch {
          /* non-fatal */
        }
      }

      sendSuccess(
        res,
        200,
        {
          firstLogin: result.firstLogin,
          userId: result.userId,
          tenantId: result.tenantId,
        },
        "Login successful",
        "The session is authenticated; `firstLogin` is true if this is the initial password set flow."
      );
    })
  );

  r.post(
    "/set-password",
    setPasswordLimiter,
    validateBody(setPasswordBodySchema),
    asyncHandler(async (req, res) => {
      const { email, tempPassword, newPassword } = req.body as {
        email: string;
        tempPassword: string;
        newPassword: string;
      };
      const ok = await auth.setPermanentPassword(email, tempPassword, newPassword);
      if (!ok) {
        throw new HttpError(400, "Could not set password. Check your email and temporary password.", {
          code: "SET_PASSWORD_FAILED",
          reason: "The temporary password may be wrong or expired, or the user record could not be updated.",
        });
      }
      sendSuccess(
        res,
        200,
        { passwordUpdated: true },
        "Password updated",
        "The user now has a permanent password; temporary credentials are no longer required."
      );
    })
  );

  return r;
}
