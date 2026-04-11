import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTempleOnboardingCompleteRepository } from "./temple-onboarding-complete.repository.js";
import { templeOnboardingCompleteBodySchema } from "./validation.js";

const onboardingCompleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createTempleOnboardingCompleteRouter(
  onboarding: PostgresTempleOnboardingCompleteRepository
): Router {
  const r = Router();

  r.post(
    "/temple-admin/onboarding-complete",
    onboardingCompleteLimiter,
    validateBody(templeOnboardingCompleteBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as { sessionEmail: string; templeId: string };

      const result = await onboarding.completeOnboarding({
        sessionEmail: body.sessionEmail,
        templeId: body.templeId,
      });

      if (!result.ok) {
        throw new HttpError(404, "Temple not found for this session or temple id.");
      }

      res.json({ success: true, message: "Onboarding completion recorded" });
    })
  );

  return r;
}
