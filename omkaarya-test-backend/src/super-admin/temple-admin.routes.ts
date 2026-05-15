import { Router } from "express";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTempleAdminProfileRepository } from "./temple-admin-profile.repository.js";
import { templeAdminProfileBodySchema } from "./validation.js";

const profileLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
});

export function createTempleAdminProfileRouter(
  profiles: PostgresTempleAdminProfileRepository
): Router {
  const r = Router();

  r.get(
    "/temple-admin/profile",
    profileLimiter,
    asyncHandler(async (req, res) => {
      const sessionEmail = typeof req.query.sessionEmail === "string" ? req.query.sessionEmail : "";
      const record = await profiles.getAdminProfileByEmail(sessionEmail);
      if (!record) {
        throw new HttpError(404, "User not found for this session email.", {
          code: "USER_NOT_FOUND",
          reason: "No `users` row exists for the `sessionEmail` query parameter, or the email is not linked to a temple flow.",
        });
      }
      sendSuccess(
        res,
        200,
        { profile: record },
        "Profile loaded",
        "The current temple-admin profile and roles were loaded for the session user."
      );
    })
  );

  r.post(
    "/temple-admin/profile",
    profileLimiter,
    validateBody(templeAdminProfileBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as {
        sessionEmail: string;
        email: string;
        fullName: string;
        roles: string[];
        phone: string;
      };
      const result = await profiles.saveAdminProfile({
        sessionEmail: body.sessionEmail,
        email: body.email,
        fullName: body.fullName,
        phone: body.phone,
        roles: body.roles,
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          throw new HttpError(404, "User not found for this session email.", {
            code: "USER_NOT_FOUND",
            reason: "The session could not be matched to a `users` row to update.",
          });
        }
        throw new HttpError(409, "That email is already in use.", {
          code: "EMAIL_CONFLICT",
          reason: "Another account already uses the new email, so the profile was not changed.",
        });
      }

      sendSuccess(
        res,
        200,
        { saved: true },
        "Profile saved",
        "The admin profile fields in `users` were updated and remain tied to the temple onboarding session."
      );
    })
  );

  return r;
}
