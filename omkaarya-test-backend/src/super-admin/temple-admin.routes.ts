import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTempleAdminProfileRepository } from "./temple-admin-profile.repository.js";
import { templeAdminProfileBodySchema } from "./validation.js";

const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
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
        throw new HttpError(404, "User not found for this session email.");
      }
      res.json({ success: true, profile: record });
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
          throw new HttpError(404, "User not found for this session email.");
        }
        throw new HttpError(409, "That email is already in use.");
      }

      res.json({ success: true, message: "Profile saved" });
    })
  );

  return r;
}
