import { NextResponse } from "next/server";
import { updateFeature, toggleFeatureActive } from "@/lib/features-db";

/** PUT /api/features/[id] — Update a feature. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const featureId = parseInt(id, 10);
    if (isNaN(featureId)) {
      return NextResponse.json({ error: "Invalid feature ID" }, { status: 400 });
    }

    const body = await request.json();
    const feature = await updateFeature(featureId, body);
    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (err) {
    console.error("PUT /api/features/[id] error:", err);
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}

/** PATCH /api/features/[id] — Toggle active status. */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const featureId = parseInt(id, 10);
    if (isNaN(featureId)) {
      return NextResponse.json({ error: "Invalid feature ID" }, { status: 400 });
    }

    const feature = await toggleFeatureActive(featureId);
    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (err) {
    console.error("PATCH /api/features/[id] error:", err);
    return NextResponse.json({ error: "Failed to toggle feature" }, { status: 500 });
  }
}
