import { Router } from "express";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTemplePlanRepository } from "./temple-plan.repository.js";
import { templePlanSelectionBodySchema } from "./validation.js";

const planSelectionLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
});

export function createTemplePlanRouter(plans: PostgresTemplePlanRepository): Router {
  const r = Router();

  r.post(
    "/temple-admin/plan-selection",
    planSelectionLimiter,
    validateBody(templePlanSelectionBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as {
        sessionEmail: string;
        templeId: string;
        pricingPlanId: string;
        billing: "monthly" | "annual";
        confirmedAt?: string;
      };

      let confirmedAt: Date | null = null;
      if (typeof body.confirmedAt === "string" && body.confirmedAt.trim() !== "") {
        const d = new Date(body.confirmedAt);
        if (Number.isNaN(d.getTime())) {
          throw new HttpError(400, "Invalid confirmedAt datetime.");
        }
        confirmedAt = d;
      }

      const result = await plans.savePlanSelection({
        sessionEmail: body.sessionEmail,
        templeId: body.templeId,
        pricingPlanId: body.pricingPlanId,
        billing: body.billing,
        confirmedAt,
      });

      if (!result.ok) {
        if (result.reason === "invalid_plan") {
          throw new HttpError(400, "Invalid or unsupported pricing plan.", {
            code: "INVALID_PLAN",
            reason: "The `pricingPlanId` is missing from `pricing_plans` or the plan name is not a billable tier.",
          });
        }
        throw new HttpError(404, "Temple not found for this session or temple id.", {
          code: "TEMPLE_NOT_FOUND",
          reason: "No `temples` row matches the given `templeId` and session email, or the session is not linked to that tenant.",
        });
      }

      sendSuccess(
        res,
        200,
        { saved: true },
        "Plan selection saved",
        "The temple row was updated with the chosen `pricing_plans` id, plan name, billing cycle, and confirmation time."
      );
    })
  );

  return r;
}
