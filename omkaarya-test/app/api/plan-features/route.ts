import { apiUrl } from "@/lib/api-base";
import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { fetchPlanFeatures, upsertPlanFeatures } from "@/lib/plan-features-db";
import { fetchAllActiveFeaturesOrdered } from "@/lib/features-db";
import {
  expressFeatureTokensFromPayload,
  registryFeatureInExpressSet,
} from "@/lib/plan-features-merge";
import { isUuidString } from "@/lib/is-uuid";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

/** node-pg forwards PostgreSQL error codes (e.g. 42P01 = undefined_table). */
function pgErrorCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const c = (err as { code?: unknown }).code;
  return typeof c === "string" ? c : undefined;
}

const SCHEMA_MISSING_REASON =
  "Feature registry tables are missing. From `omkaarya-test-backend` run: npm run migrate (applies 015_feature_registry_and_plan_features.sql for public.features and public.plan_features).";

const DB_NOT_CONFIGURED_REASON =
  "Database not configured. Set DATABASE_URL or DB_USER/DB_HOST/DB_NAME in `omkaarya-test/.env.local`, or add them to `omkaarya-test-backend/.env` (Next loads that file in local dev).";

/** GET /api/plan-features?planId=xxx — Get feature configs for a plan. */
export async function GET(request: Request) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");
    if (!planId) {
      return nextJsonError(400, "MISSING_QUERY", "planId query param is required", "Add `?planId=<plan uuid>` to load merged feature config for that plan.");
    }

    const [planFeatures, allActiveFeatures] = await Promise.all([
      fetchPlanFeatures(planId),
      fetchAllActiveFeaturesOrdered(),
    ]);

    let expressTokens = new Set<string>();
    if (isUuidString(planId)) {
      try {
        const exRes = await fetch(apiUrl(`/api/pricing-plans/${encodeURIComponent(planId)}`), {
          method: "GET",
          headers: { ...auth.headers, Accept: "application/json" },
          cache: "no-store",
        });
        if (exRes.ok) {
          const ej = (await exRes.json().catch(() => null)) as {
            success?: boolean;
            data?: { features?: unknown };
          };
          const raw = ej?.success ? ej?.data?.features : undefined;
          expressTokens = expressFeatureTokensFromPayload(raw);
        }
      } catch {
        /* Express unavailable — fall back to plan_features only */
      }
    }

    // Merge: plan_features row wins when present; else default from Express `features` name/key list
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

    return nextJsonSuccess(
      200,
      merged,
      "Plan feature config loaded",
      "Merged the global feature registry with per-plan `plan_features` rows; when no row exists, inclusion is inferred from Express `pricing_plans.features` (name or key) for UUID plans."
    );
  } catch (err) {
    console.error("GET /api/plan-features error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const pgc = pgErrorCode(err);
    if (message.includes("Database not configured")) {
      return nextJsonError(503, "DB_NOT_CONFIGURED", "Database not configured", DB_NOT_CONFIGURED_REASON);
    }
    if (
      pgc === "42P01" ||
      (message.includes("does not exist") && (message.includes("plan_features") || /\bfeatures\b/.test(message)))
    ) {
      return nextJsonError(503, "SCHEMA_MISSING", "Feature registry tables are missing", SCHEMA_MISSING_REASON);
    }
    return nextJsonError(500, "PLAN_FEATURES_GET_FAILED", "Failed to fetch plan features", message);
  }
}

/** POST /api/plan-features — Bulk upsert feature configs for a plan. */
export async function POST(request: Request) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { planId, features } = body as {
      planId: string;
      features: Array<{ featureId: string; isEnabled: boolean; limitValue?: number | null }>;
    };

    if (!planId || !Array.isArray(features)) {
      return nextJsonError(
        400,
        "VALIDATION_ERROR",
        "planId and features array are required",
        "POST a JSON body with `planId` and `features: [...]` to upsert plan feature toggles."
      );
    }

    await upsertPlanFeatures(
      features.map((f) => ({
        planId,
        featureId: f.featureId,
        isEnabled: f.isEnabled,
        limitValue: f.limitValue,
      }))
    );

    // Keep Express `pricing_plans.features` JSONB in sync (super-admin list / comparison)
    if (isUuidString(planId)) {
      const allActive = await fetchAllActiveFeaturesOrdered();
      const byId = new Map(features.map((x) => [x.featureId, x.isEnabled]));
      const featureNames = allActive
        .filter((f) => byId.get(f.id) === true)
        .map((f) => f.name);
      try {
        let includedSeats = 3;
        let extraSeatPriceMonthly = 0;
        const getRes = await fetch(apiUrl(`/api/pricing-plans/${encodeURIComponent(planId)}`), {
          method: "GET",
          headers: { ...auth.headers, Accept: "application/json" },
          cache: "no-store",
        });
        if (getRes.ok) {
          const gj = (await getRes.json().catch(() => null)) as {
            success?: boolean;
            data?: {
              includedSeats?: unknown;
              totalSeats?: unknown;
              extraSeatPriceMonthly?: unknown;
            };
          };
          const d = gj?.success ? gj?.data : undefined;
          if (d) {
            if (typeof d.includedSeats === "number" && Number.isFinite(d.includedSeats)) {
              includedSeats = d.includedSeats;
            } else if (typeof d.totalSeats === "number" && Number.isFinite(d.totalSeats)) {
              includedSeats = d.totalSeats;
            }
            if (typeof d.extraSeatPriceMonthly === "number" && Number.isFinite(d.extraSeatPriceMonthly)) {
              extraSeatPriceMonthly = d.extraSeatPriceMonthly;
            }
          }
        }
        const sync = await fetch(apiUrl(`/api/pricing-plans/${encodeURIComponent(planId)}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...auth.headers },
          body: JSON.stringify({
            features: featureNames,
            includedSeats,
            extraSeatPriceMonthly,
          }),
        });
        if (!sync.ok) {
          console.error("POST /api/plan-features: could not sync pricing_plans.features", await sync.text());
        }
      } catch (e) {
        console.error("POST /api/plan-features: sync to Express failed", e);
      }
    }

    return nextJsonSuccess(200, { saved: true }, "Plan features saved", "Per-plan `plan_features` rows were upserted; the pricing plan JSONB may be synced when applicable.");
  } catch (err) {
    console.error("POST /api/plan-features error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const pgc = pgErrorCode(err);
    if (message.includes("Database not configured")) {
      return nextJsonError(503, "DB_NOT_CONFIGURED", "Database not configured", DB_NOT_CONFIGURED_REASON);
    }
    if (
      pgc === "42P01" ||
      (message.includes("does not exist") && (message.includes("plan_features") || /\bfeatures\b/.test(message)))
    ) {
      return nextJsonError(503, "SCHEMA_MISSING", "Feature registry tables are missing", SCHEMA_MISSING_REASON);
    }
    return nextJsonError(500, "PLAN_FEATURES_SAVE_FAILED", "Failed to save plan features", message);
  }
}
