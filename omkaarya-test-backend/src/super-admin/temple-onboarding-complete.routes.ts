import { Router } from "express";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTempleOnboardingCompleteRepository } from "./temple-onboarding-complete.repository.js";
import { templeOnboardingCompleteBodySchema } from "./validation.js";

const onboardingCompleteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
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
        throw new HttpError(404, "Temple not found for this session or temple id.", {
          code: "TEMPLE_NOT_FOUND",
          reason: "The temple could not be found for the session, so completion was not written.",
        });
      }

      sendSuccess(
        res,
        200,
        { complete: true },
        "Onboarding completion recorded",
        "The `temples` row was updated with a completion timestamp for this flow."
      );
    })
  );

  return r;
}
