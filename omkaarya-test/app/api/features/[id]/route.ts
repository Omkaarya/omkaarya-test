import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { updateFeature, toggleFeatureActive } from "@/lib/features-db";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

/** PUT /api/features/[id] — Update a feature. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const featureId = parseInt(id, 10);
    if (isNaN(featureId)) {
      return nextJsonError(400, "INVALID_ID", "Invalid feature ID", "The path segment must be a numeric feature primary key.");
    }

    const body = await request.json();
    const feature = await updateFeature(featureId, body);
    if (!feature) {
      return nextJsonError(404, "FEATURE_NOT_FOUND", "Feature not found", "No row exists for the given id.");
    }

    return nextJsonSuccess(200, feature, "Feature updated", "The feature registry row was written with the submitted fields.");
  } catch (err) {
    console.error("PUT /api/features/[id] error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "FEATURE_UPDATE_FAILED", "Failed to update feature", m);
  }
}

/** PATCH /api/features/[id] — Toggle active status. */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const featureId = parseInt(id, 10);
    if (isNaN(featureId)) {
      return nextJsonError(400, "INVALID_ID", "Invalid feature ID", "The path segment must be a numeric feature primary key.");
    }

    const feature = await toggleFeatureActive(featureId);
    if (!feature) {
      return nextJsonError(404, "FEATURE_NOT_FOUND", "Feature not found", "No row exists for the given id.");
    }

    return nextJsonSuccess(200, feature, "Feature toggled", "The feature's active flag was flipped and the updated row is returned.");
  } catch (err) {
    console.error("PATCH /api/features/[id] error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "FEATURE_TOGGLE_FAILED", "Failed to toggle feature", m);
  }
}
