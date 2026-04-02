import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { TemplesService } from "./temples.service.js";
import type { CreateTemplePayload } from "./types.js";
import { createTempleBodySchema } from "./validation.js";

export function createTemplesRouter(temples: TemplesService): Router {
  const r = Router();

  r.get(
    "/temples",
    asyncHandler(async (req, res) => {
      try {
        const params = new URLSearchParams();
        for (const [key, raw] of Object.entries(req.query)) {
          if (raw === undefined) continue;
          const value = Array.isArray(raw) ? raw[0] : raw;
          params.set(key, String(value));
        }
        const payload = await temples.listTemples(params);
        res.json(payload);
      } catch (e) {
        throw new HttpError(500, "Failed to load temples", { cause: e });
      }
    })
  );

  r.post(
    "/temples/create",
    validateBody(createTempleBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as CreateTemplePayload;
      try {
        const { templeId } = await temples.createTemple(body);
        res.json({
          success: true,
          templeId,
          inviteQueued: true,
          message: "Temple created successfully. Invite email has been queued.",
        });
      } catch (e) {
        throw new HttpError(500, "Failed to create temple.", { cause: e });
      }
    })
  );

  return r;
}
