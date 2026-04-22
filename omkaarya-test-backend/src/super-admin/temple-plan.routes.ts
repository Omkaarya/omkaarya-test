import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresTemplePlanRepository } from "./temple-plan.repository.js";
import { templePlanSelectionBodySchema } from "./validation.js";

const planSelectionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
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
          throw new HttpError(400, "Invalid or unsupported pricing plan.");
        }
        throw new HttpError(404, "Temple not found for this session or temple id.");
      }

      res.json({ success: true, message: "Plan selection saved" });
    })
  );

  return r;
}
