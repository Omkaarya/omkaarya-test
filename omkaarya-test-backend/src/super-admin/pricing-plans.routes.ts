import { Router } from "express";
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
    throw new HttpError(400, "Invalid pricing plan id");
  }
  return parsed.data;
}

export function createPricingPlansRouter(repository: PostgresPricingPlansRepository): Router {
  const r = Router();

  r.get(
    "/pricing-plans",
    asyncHandler(async (_req, res) => {
      const plans = await repository.getAll();
      res.json({ success: true, data: plans });
    })
  );

  r.get(
    "/pricing-plans/:id",
    asyncHandler(async (req, res) => {
      const id = requirePricingPlanId(req.params.id);
      const plan = await repository.getById(id);
      if (!plan) {
        throw new HttpError(404, "Pricing plan not found");
      }
      res.json({ success: true, data: plan });
    })
  );

  r.post(
    "/pricing-plans",
    validateBody(createPricingPlanBodySchema),
    asyncHandler(async (req, res) => {
      const plan = await repository.create(req.body);
      res.status(201).json({ success: true, data: plan });
    })
  );

  r.patch(
    "/pricing-plans/:id",
    validateBody(updatePricingPlanBodySchema),
    asyncHandler(async (req, res) => {
      const id = requirePricingPlanId(req.params.id);
      const plan = await repository.update(id, req.body);
      if (!plan) {
        throw new HttpError(404, "Pricing plan not found");
      }
      res.json({ success: true, data: plan });
    })
  );

  r.delete(
    "/pricing-plans/:id",
    asyncHandler(async (req, res) => {
      const id = requirePricingPlanId(req.params.id);
      const success = await repository.delete(id);
      if (!success) {
        throw new HttpError(404, "Pricing plan not found");
      }
      res.json({ success: true, message: "Pricing plan deleted successfully" });
    })
  );

  return r;
}
