import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresPricingPlansRepository } from "./pricing-plans.repository.js";
import {
  createPricingPlanBodySchema,
  pricingPlanIdParamSchema,
  updatePricingPlanBodySchema,
} from "./validation.js";

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

function requirePricingPlanId(raw: string | string[] | undefined): string {
  const parsed = pricingPlanIdParamSchema.safeParse(asSingleParam(raw));
  if (!parsed.success) {
    throw new HttpError(400, "Invalid pricing plan id", {
      code: "INVALID_ID",
      reason: "The id must be a valid UUID in the path parameter.",
    });
  }
  return parsed.data;
}

export function createPricingPlansRouter(repository: PostgresPricingPlansRepository): Router {
  const r = Router();

  r.get(
    "/pricing-plans",
    asyncHandler(async (_req, res) => {
      const plans = await repository.getAll();
      sendSuccess(
        res,
        200,
        plans,
        "Pricing plans loaded",
        "All defined catalog plans are returned, ordered for display in admin and onboarding."
      );
    })
  );

  r.get(
    "/pricing-plans/comparison",
    asyncHandler(async (_req, res) => {
      const data = await repository.getComparison();
      sendSuccess(
        res,
        200,
        data,
        "Feature comparison loaded",
        "The matrix is built from the feature registry and `plan_features` for each plan."
      );
    })
  );

  r.get(
    "/pricing-plans/:id",
    asyncHandler(async (req, res) => {
      const id = requirePricingPlanId(req.params.id);
      const plan = await repository.getById(id);
      if (!plan) {
        throw new HttpError(404, "Pricing plan not found", {
          code: "PLAN_NOT_FOUND",
          reason: "No `pricing_plans` row exists for this id.",
        });
      }
      sendSuccess(
        res,
        200,
        plan,
        "Pricing plan loaded",
        "One plan row, including the JSON `features` list, is returned."
      );
    })
  );

  r.post(
    "/pricing-plans",
    validateBody(createPricingPlanBodySchema),
    asyncHandler(async (req, res) => {
      const plan = await repository.create(req.body);
      sendSuccess(
        res,
        201,
        plan,
        "Pricing plan created",
        "A new row was inserted in `pricing_plans` and is ready for feature linking and onboarding."
      );
    })
  );

  r.patch(
    "/pricing-plans/:id",
    validateBody(updatePricingPlanBodySchema),
    asyncHandler(async (req, res) => {
      const id = requirePricingPlanId(req.params.id);
      const plan = await repository.update(id, req.body);
      if (!plan) {
        throw new HttpError(404, "Pricing plan not found", {
          code: "PLAN_NOT_FOUND",
          reason: "The id is valid but there is no row to update.",
        });
      }
      sendSuccess(
        res,
        200,
        plan,
        "Pricing plan updated",
        "The row in `pricing_plans` was replaced with the merged fields."
      );
    })
  );

  r.delete(
    "/pricing-plans/:id",
    asyncHandler(async (req, res) => {
      const id = requirePricingPlanId(req.params.id);
      const success = await repository.delete(id);
      if (!success) {
        throw new HttpError(404, "Pricing plan not found", {
          code: "PLAN_NOT_FOUND",
          reason: "The id did not match any plan to delete (already removed or never existed).",
        });
      }
      sendSuccess(res, 200, { deleted: true }, "Pricing plan deleted", "The `pricing_plans` row was removed from the database.");
    })
  );

  return r;
}
