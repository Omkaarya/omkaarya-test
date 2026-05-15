import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import type { PostgresPricingPlansRepository } from "./pricing-plans.repository.js";
import type { PostgresFeatureRegistryRepository } from "./feature-registry.repository.js";
import { expressFeatureTokensFromPayload, registryFeatureInExpressSet } from "./plan-features-merge.js";
import { isUuidString } from "./is-uuid-string.js";

function asQueryString(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return String(v[0] ?? "");
  return String(v);
}

export function createPlanFeaturesAdminRouter(
  features: PostgresFeatureRegistryRepository,
  pricingPlans: PostgresPricingPlansRepository
): Router {
  const r = Router();

  r.get(
    "/plan-features",
    asyncHandler(async (req, res) => {
      const planId = asQueryString(req.query.planId);
      if (!planId) {
        throw new HttpError(400, "planId query param is required", {
          code: "MISSING_QUERY",
          reason: "Add `?planId=<plan uuid>` to load merged feature config for that plan.",
        });
      }

      const [planFeatures, allActiveFeatures] = await Promise.all([
        features.fetchPlanFeatures(planId),
        features.fetchAllActiveFeaturesOrdered(),
      ]);

      let expressTokens = new Set<string>();
      if (isUuidString(planId)) {
        const planRow = await pricingPlans.getById(planId);
        if (planRow) {
          expressTokens = expressFeatureTokensFromPayload(planRow.features);
        }
      }

      const configMap = new Map(planFeatures.map((pf) => [pf.featureId, pf]));
      const merged = allActiveFeatures.map((f) => {
        const existing = configMap.get(f.id);
        const fromExpress =
          !existing &&
          expressTokens.size > 0 &&
          registryFeatureInExpressSet(f.name, f.key, expressTokens);
        return {
          featureId: f.id,
          featureName: f.name,
          featureKey: f.key,
          moduleKey: f.moduleKey,
          hasLimit: f.hasLimit,
          limitType: f.limitType,
          description: f.description,
          isEnabled: existing ? existing.isEnabled : fromExpress,
          limitValue: existing?.limitValue ?? null,
        };
      });

      sendSuccess(
        res,
        200,
        merged,
        "Plan feature config loaded",
        "Merged the global feature registry with per-plan `plan_features` rows; when no row exists, inclusion is inferred from Express `pricing_plans.features` (name or key) for UUID plans."
      );
    })
  );

  r.post(
    "/plan-features",
    asyncHandler(async (req, res) => {
      const { planId, features: featList } = req.body ?? {};
      if (!planId || !Array.isArray(featList)) {
        throw new HttpError(400, "planId and features array are required", {
          code: "VALIDATION_ERROR",
          reason: "POST a JSON body with `planId` and `features: [...]` to upsert plan feature toggles.",
        });
      }

      await features.upsertPlanFeatures(
        featList.map((f: { featureId: string; isEnabled: boolean; limitValue?: number | null }) => ({
          planId,
          featureId: f.featureId,
          isEnabled: f.isEnabled,
          limitValue: f.limitValue,
        }))
      );

      if (isUuidString(planId)) {
        const allActive = await features.fetchAllActiveFeaturesOrdered();
        const byId = new Map<string, boolean>(
          featList.map((x: { featureId: string; isEnabled: boolean }) => [x.featureId, x.isEnabled])
        );
        const featureNames = allActive.filter((f) => byId.get(f.id) === true).map((f) => f.name);
        const existing = await pricingPlans.getById(planId);
        let includedSeats = 3;
        let extraSeatPriceMonthly = 0;
        if (existing) {
          includedSeats = existing.includedSeats;
          extraSeatPriceMonthly = existing.extraSeatPriceMonthly;
        }
        await pricingPlans.update(planId, {
          features: featureNames,
          includedSeats,
          extraSeatPriceMonthly,
        });
      }

      sendSuccess(
        res,
        200,
        { saved: true },
        "Plan features saved",
        "Per-plan `plan_features` rows were upserted; the pricing plan JSONB may be synced when applicable."
      );
    })
  );

  return r;
}
