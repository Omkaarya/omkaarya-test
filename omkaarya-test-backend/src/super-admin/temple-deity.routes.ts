import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTempleDeityRepository } from "./temple-deity.repository.js";
import { templeDeitySelectionBodySchema } from "./validation.js";

const deitySelectionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createTempleDeityRouter(deities: PostgresTempleDeityRepository): Router {
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

      const result = await deities.saveDeitySelection({
        sessionEmail: body.sessionEmail,
        templeId: body.templeId,
        primaryDeityId: body.primaryDeityId,
        subDeityIds: body.subDeityIds,
        customDeityNote,
        preferCustomLater: prefer,
      });

      if (!result.ok) {
        throw new HttpError(404, "Temple not found for this session or temple id.");
      }

      res.json({ success: true, message: "Deity selection saved" });
    })
  );

  return r;
}
