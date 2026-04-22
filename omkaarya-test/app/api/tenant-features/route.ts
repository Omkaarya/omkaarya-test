import { NextResponse } from "next/server";
import { fetchTenantFeatures } from "@/lib/plan-features-db";

/**
 * GET /api/tenant-features?tenantId=xxx
 * Returns effective features for a tenant (based on their plan).
 * Used by tenant portal for access control.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");
    if (!tenantId) {
      return NextResponse.json({ error: "tenantId query param is required" }, { status: 400 });
    }

    const features = await fetchTenantFeatures(tenantId);
    return NextResponse.json(features);
  } catch (err) {
    console.error("GET /api/tenant-features error:", err);
    return NextResponse.json({ error: "Failed to fetch tenant features" }, { status: 500 });
  }
}
