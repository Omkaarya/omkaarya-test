import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTempleRepository } from "./temples.repository.js";
import { storeBrandingImageIfNeeded } from "../storage/cloudinary.js";
import { templeProfileDetailsPatchBodySchema } from "./validation.js";

export function createTempleSessionProfileRouter(repo: PostgresTempleRepository): Router {
  const r = Router();

  r.get(
    "/temple-admin/temple-profile",
    asyncHandler(async (req, res) => {
      const sessionEmail = typeof req.query.sessionEmail === "string" ? req.query.sessionEmail : "";
      if (!sessionEmail.trim()) {
        throw new HttpError(400, "sessionEmail is required", {
          code: "MISSING_QUERY",
          reason: "Pass `?sessionEmail=<email>` so the server can look up the temple for this user.",
        });
      }
      const profile = await repo.getTempleSessionProfileByAdminEmail(sessionEmail);
      if (!profile) {
        throw new HttpError(404, "Temple not found for this session email.", {
          code: "TEMPLE_NOT_FOUND",
          reason: "No `temples` row is associated with the given admin email in this context.",
        });
      }
      sendSuccess(
        res,
        200,
        profile,
        "Temple session profile loaded",
        "Returns temple contact, branding, and setup fields used after sign-in in onboarding."
      );
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
        charityRegistered: boolean;
        charityRegistrationNumber: string;
      };
      const logoStored = await storeBrandingImageIfNeeded(
        body.logoDataUrl,
        "temple-logo",
        "temple-logo"
      );
      if (
        process.env.NODE_ENV !== "production" &&
        logoStored != null &&
        !/^https:\/\//i.test(logoStored)
      ) {
        console.warn(
          "[temple-profile/details] Expected HTTPS logo URL after upload (Cloudinary secure_url), got:",
          logoStored.slice(0, 80)
        );
      }
      const result = await repo.saveTempleProfileDetails({
        sessionEmail: body.sessionEmail,
        websiteUrl: body.websiteUrl,
        fax: body.fax,
        domainSubdomain: body.domainSubdomain,
        establishedYear: body.establishedYear,
        fullAddress: body.fullAddress,
        logoDataUrl: logoStored,
        charityRegistered: body.charityRegistered,
        charityRegistrationNumber: body.charityRegistrationNumber,
      });
      if (!result.ok) {
        throw new HttpError(404, "Temple not found for this session email.", {
          code: "TEMPLE_NOT_FOUND",
          reason: "The address and logo updates could not be applied because the tenant was not found for this session.",
        });
      }
      sendSuccess(
        res,
        200,
        { saved: true },
        "Profile details saved",
        "Domain, address, and optional logo fields were persisted on the `temples` record."
      );
    })
  );

  return r;
}
