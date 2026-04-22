import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
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
      return nextJsonError(
        400,
        "MISSING_QUERY",
        "tenantId query param is required",
        "Pass `?tenantId=<uuid>` so the server can resolve the tenant's plan and effective features."
      );
    }

    const features = await fetchTenantFeatures(tenantId);
    return nextJsonSuccess(
      200,
      features,
      "Tenant features loaded",
      "Effective feature flags for this tenant were derived from its plan and registry."
    );
  } catch (err) {
    console.error("GET /api/tenant-features error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "TENANT_FEATURES_FAILED", "Failed to fetch tenant features", m);
  }
}
