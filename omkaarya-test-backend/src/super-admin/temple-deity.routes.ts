import { Router } from "express";
import rateLimit from "express-rate-limit";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTempleDeityRepository } from "./temple-deity.repository.js";
import type { PostgresMasterDeitiesRepository } from "./master-deities.repository.js";
import { templeDeitySelectionBodySchema } from "./validation.js";

const deitySelectionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createTempleDeityRouter(
  deities: PostgresTempleDeityRepository,
  masterDeities: PostgresMasterDeitiesRepository
): Router {
  const r = Router();

  r.post(
    "/temple-admin/deity-selection",
    deitySelectionLimiter,
    validateBody(templeDeitySelectionBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as {
        sessionEmail: string;
        templeId: string;
        primaryDeityId: string;
        subDeityIds: string[];
        customDeityNote?: string;
        preferCustomLater?: boolean;
      };

      const noteRaw = body.customDeityNote;
      const customDeityNote =
        noteRaw === undefined || noteRaw === null
          ? null
          : noteRaw.trim() === ""
            ? null
            : noteRaw.trim();

      const prefer =
        body.preferCustomLater === undefined ? null : Boolean(body.preferCustomLater);

      const slugCheck = await masterDeities.assertAllSlugsActiveAndExist([
        body.primaryDeityId,
        ...body.subDeityIds,
      ]);
      if (!slugCheck.ok) {
        throw new HttpError(400, "Invalid or inactive deity id(s).", {
          code: "INVALID_DEITY_IDS",
          reason: `Unknown or inactive slugs: ${slugCheck.invalid.join(", ")}`,
        });
      }

      const result = await deities.saveDeitySelection({
        sessionEmail: body.sessionEmail,
        templeId: body.templeId,
        primaryDeityId: body.primaryDeityId,
        subDeityIds: body.subDeityIds,
        customDeityNote,
        preferCustomLater: prefer,
      });

      if (!result.ok) {
        throw new HttpError(404, "Temple not found for this session or temple id.", {
          code: "TEMPLE_NOT_FOUND",
          reason: "The session user is not associated with the given `templeId`, or the tenant id is wrong.",
        });
      }

      sendSuccess(
        res,
        200,
        { saved: true },
        "Deity selection saved",
        "Primary and sub-deity fields on the `temples` row were updated for this onboarding step."
      );
    })
  );

  return r;
}
