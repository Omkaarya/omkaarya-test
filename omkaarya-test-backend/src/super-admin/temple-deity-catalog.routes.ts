import { Router } from "express";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import type { PostgresMasterDeitiesRepository } from "./master-deities.repository.js";

const catalogLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 120,
});

/** Public catalog for temple onboarding (active deities only). Mounted before super-admin JWT. */
export function createTempleDeityCatalogRouter(masterDeities: PostgresMasterDeitiesRepository): Router {
  const r = Router();

  r.get(
    "/temple-admin/deity-catalog",
    catalogLimiter,
    asyncHandler(async (_req, res) => {
      const entries = await masterDeities.listActiveCatalogEntries();
      sendSuccess(
        res,
        200,
        { entries },
        "Deity catalog loaded",
        "Active rows from `master_deities` for temple onboarding selection."
      );
    })
  );

  return r;
}
