import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import type { PostgresTempleOnboardingProgressRepository } from "./temple-onboarding-progress.repository.js";
import type { TempleSessionLocals } from "../temple-ops/middleware/require-temple-jwt.js";

export function createTempleOnboardingProgressRouter(
  repo: PostgresTempleOnboardingProgressRepository
): Router {
  const r = Router();

  r.get(
    "/temple-admin/onboarding-progress",
    asyncHandler(async (_req, res) => {
      const session = (res.locals as { templeSession?: TempleSessionLocals }).templeSession;
      if (!session?.email) {
        throw new HttpError(401, "Temple session required.", {
          code: "UNAUTHORIZED",
          reason: "Sign in with a temple administrator account to continue.",
        });
      }

      const progress = await repo.getProgressBySessionEmail(session.email);
      if (!progress) {
        throw new HttpError(404, "Temple not found for this session.", {
          code: "TEMPLE_NOT_FOUND",
          reason: "No temple is associated with the authenticated admin email.",
        });
      }

      sendSuccess(
        res,
        200,
        progress,
        "Onboarding progress loaded",
        "Flags indicate which onboarding steps remain for this temple admin."
      );
    })
  );

  return r;
}
