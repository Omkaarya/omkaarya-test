import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTempleRepository } from "./temples.repository.js";
import { templeProfileDetailsPatchBodySchema } from "./validation.js";

export function createTempleSessionProfileRouter(repo: PostgresTempleRepository): Router {
  const r = Router();

  r.get(
    "/temple-admin/temple-profile",
    asyncHandler(async (req, res) => {
      const sessionEmail = typeof req.query.sessionEmail === "string" ? req.query.sessionEmail : "";
      if (!sessionEmail.trim()) {
        throw new HttpError(400, "sessionEmail is required");
      }
      const profile = await repo.getTempleSessionProfileByAdminEmail(sessionEmail);
      if (!profile) {
        throw new HttpError(404, "Temple not found for this session email.");
      }
      res.json(profile);
    })
  );

  r.patch(
    "/temple-admin/temple-profile/details",
    validateBody(templeProfileDetailsPatchBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as {
        sessionEmail: string;
        websiteUrl: string;
        fax: { countryCode: string; nationalNumber: string };
        domainSubdomain: string;
        establishedYear: string;
        fullAddress: {
          countryIso: string;
          state: string;
          city: string;
          postalCode: string;
          street: string;
        };
        logoDataUrl: string | null;
      };
      const result = await repo.saveTempleProfileDetails({
        sessionEmail: body.sessionEmail,
        websiteUrl: body.websiteUrl,
        fax: body.fax,
        domainSubdomain: body.domainSubdomain,
        establishedYear: body.establishedYear,
        fullAddress: body.fullAddress,
        logoDataUrl: body.logoDataUrl,
      });
      if (!result.ok) {
        throw new HttpError(404, "Temple not found for this session email.");
      }
      res.json({ success: true, message: "Profile details saved" });
    })
  );

  return r;
}
