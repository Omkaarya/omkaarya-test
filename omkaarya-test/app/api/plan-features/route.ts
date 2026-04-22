import { NextResponse } from "next/server";
import { fetchPlanFeatures, upsertPlanFeatures } from "@/lib/plan-features-db";
import { fetchVisibleFeatures } from "@/lib/features-db";

/** GET /api/plan-features?planId=xxx — Get feature configs for a plan. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");
    if (!planId) {
      return NextResponse.json({ error: "planId query param is required" }, { status: 400 });
    }

    const [planFeatures, allFeatures] = await Promise.all([
      fetchPlanFeatures(planId),
      fetchVisibleFeatures(),
    ]);

    // Merge: return all visible features with their plan config (if any)
    const configMap = new Map(planFeatures.map((pf) => [pf.featureId, pf]));
    const merged = allFeatures.map((f) => {
      const existing = configMap.get(f.id);
      return {
        featureId: f.id,
        featureName: f.name,
        featureKey: f.key,
        moduleKey: f.moduleKey,
        hasLimit: f.hasLimit,
        limitType: f.limitType,
        description: f.description,
        isEnabled: existing?.isEnabled ?? true, // default enabled
        limitValue: existing?.limitValue ?? null,
      };
    });

    return NextResponse.json(merged);
  } catch (err) {
    console.error("GET /api/plan-features error:", err);
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/plan-features error:", err);
    return NextResponse.json({ error: "Failed to save plan features" }, { status: 500 });
  }
}
