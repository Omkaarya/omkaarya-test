import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { fetchPlanFeatures, upsertPlanFeatures } from "@/lib/plan-features-db";
import { fetchAllActiveFeaturesOrdered } from "@/lib/features-db";

/** node-pg forwards PostgreSQL error codes (e.g. 42P01 = undefined_table). */
function pgErrorCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const c = (err as { code?: unknown }).code;
  return typeof c === "string" ? c : undefined;
}

const SCHEMA_MISSING = {
  code: "schema_missing" as const,
  error:
    "Feature registry tables are missing. From `omkaarya-test-backend` run: npm run migrate (applies 015_feature_registry_and_plan_features.sql for public.features and public.plan_features).",
};

const DB_NOT_CONFIGURED = {
  code: "db_not_configured" as const,
  error:
    "Database not configured. Set DATABASE_URL or DB_USER/DB_HOST/DB_NAME in `omkaarya-test/.env.local`, or add them to `omkaarya-test-backend/.env` (Next loads that file in local dev).",
};

/** GET /api/plan-features?planId=xxx — Get feature configs for a plan. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");
    if (!planId) {
      return NextResponse.json({ error: "planId query param is required" }, { status: 400 });
    }

    const [planFeatures, allActiveFeatures] = await Promise.all([
      fetchPlanFeatures(planId),
      fetchAllActiveFeaturesOrdered(),
    ]);

    // Merge: all active registry features; plan_features row enables (default off)
    const configMap = new Map(planFeatures.map((pf) => [pf.featureId, pf]));
    const merged = allActiveFeatures.map((f) => {
      const existing = configMap.get(f.id);
      return {
        featureId: f.id,
        featureName: f.name,
        featureKey: f.key,
        moduleKey: f.moduleKey,
        hasLimit: f.hasLimit,
        limitType: f.limitType,
        description: f.description,
        isEnabled: existing ? existing.isEnabled : false,
        limitValue: existing?.limitValue ?? null,
      };
    });

    return NextResponse.json(merged);
  } catch (err) {
    console.error("GET /api/plan-features error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const pgc = pgErrorCode(err);
    if (message.includes("Database not configured")) {
      return NextResponse.json(DB_NOT_CONFIGURED, { status: 503 });
    }
    if (
      pgc === "42P01" ||
      (message.includes("does not exist") &&
        (message.includes("plan_features") || /\bfeatures\b/.test(message)))
    ) {
      return NextResponse.json(SCHEMA_MISSING, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to fetch plan features" }, { status: 500 });
  }
}

/** POST /api/plan-features — Bulk upsert feature configs for a plan. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, features } = body as {
      planId: string;
      features: Array<{ featureId: number; isEnabled: boolean; limitValue?: number | null }>;
    };

    if (!planId || !Array.isArray(features)) {
      return NextResponse.json({ error: "planId and features array are required" }, { status: 400 });
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
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRe.test(planId)) {
      const allActive = await fetchAllActiveFeaturesOrdered();
      const byId = new Map(features.map((x) => [x.featureId, x.isEnabled]));
      const featureNames = allActive
        .filter((f) => byId.get(f.id) === true)
        .map((f) => f.name);
      try {
        const sync = await fetch(apiUrl(`/api/pricing-plans/${encodeURIComponent(planId)}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: featureNames }),
        });
        if (!sync.ok) {
          console.error("POST /api/plan-features: could not sync pricing_plans.features", await sync.text());
        }
      } catch (e) {
        console.error("POST /api/plan-features: sync to Express failed", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/plan-features error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const pgc = pgErrorCode(err);
    if (message.includes("Database not configured")) {
      return NextResponse.json(DB_NOT_CONFIGURED, { status: 503 });
    }
    if (
      pgc === "42P01" ||
      (message.includes("does not exist") &&
        (message.includes("plan_features") || /\bfeatures\b/.test(message)))
    ) {
      return NextResponse.json(SCHEMA_MISSING, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to save plan features" }, { status: 500 });
  }
}
