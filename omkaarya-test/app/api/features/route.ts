import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { fetchAllFeatures, insertFeature } from "@/lib/features-db";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

/** GET /api/features — List all features (for Feature Registry admin page). */
export async function GET() {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  try {
    const features = await fetchAllFeatures();
    return nextJsonSuccess(200, features, "Feature registry list loaded", "All feature definitions from the database are returned in display order.");
  } catch (err) {
    console.error("GET /api/features error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "FEATURES_LIST_FAILED", "Failed to fetch features", m);
  }
}

/** POST /api/features — Create a new feature. */
export async function POST(request: Request) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { name, key, moduleKey, description, hasLimit, limitType, isVisibleInPlanConfig } = body;

    if (!name || !key || !moduleKey) {
      return nextJsonError(
        400,
        "VALIDATION_ERROR",
        "name, key, and moduleKey are required",
        "Provide all three string fields in the request body to create a feature."
      );
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

    return nextJsonSuccess(201, feature, "Feature created", "A new row was inserted into the feature registry with the given key.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create feature";
    // Handle unique constraint violation on key
    if (message.includes("unique") || message.includes("duplicate")) {
      return nextJsonError(
        409,
        "FEATURE_KEY_CONFLICT",
        "Feature key already exists",
        "Another feature already uses this key; choose a different key or update the existing row."
      );
    }
    console.error("POST /api/features error:", err);
    return nextJsonError(500, "FEATURE_CREATE_FAILED", "Failed to create feature", message);
  }
}
