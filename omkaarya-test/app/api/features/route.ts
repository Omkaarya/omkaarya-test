import { NextResponse } from "next/server";
import { fetchAllFeatures, insertFeature } from "@/lib/features-db";

/** GET /api/features — List all features (for Feature Registry admin page). */
export async function GET() {
  try {
    const features = await fetchAllFeatures();
    return NextResponse.json(features);
  } catch (err) {
    console.error("GET /api/features error:", err);
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 });
  }
}

/** POST /api/features — Create a new feature. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, key, moduleKey, description, hasLimit, limitType, isVisibleInPlanConfig } = body;

    if (!name || !key || !moduleKey) {
      return NextResponse.json({ error: "name, key, and moduleKey are required" }, { status: 400 });
    }

    const feature = await insertFeature({
      name,
      key,
      moduleKey,
      description,
      hasLimit,
      limitType,
      isVisibleInPlanConfig,
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create feature";
    // Handle unique constraint violation on key
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "Feature key already exists" }, { status: 409 });
    }
    console.error("POST /api/features error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
