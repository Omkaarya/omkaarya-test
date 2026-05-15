import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import type { AccessLevel } from "@/lib/sa-users-db";
import {
  fetchTempleDefaultRolePermissions,
  saveTempleDefaultRolePermissions,
} from "@/lib/temple-default-roles-db";
import { isTempleDefaultRoleSlug } from "@/lib/temple-default-roles";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type Params = { params: Promise<{ slug: string }> };

/** GET /api/temple-default-roles/[slug]/permissions — Temple default role template permissions. */
export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  const { slug } = await params;
  const roleSlug = slug.trim();
  if (!isTempleDefaultRoleSlug(roleSlug)) {
    return nextJsonError(404, "ROLE_NOT_FOUND", "Unknown temple role", `No default temple role with slug "${roleSlug}".`);
  }

  try {
    const permissions = await fetchTempleDefaultRolePermissions(roleSlug);
    return nextJsonSuccess(
      200,
      permissions,
      "Temple role permissions loaded",
      `Permissions for temple role "${roleSlug}" returned.`
    );
  } catch (err) {
    return nextJsonError(500, "TEMPLE_ROLE_PERMS_FETCH_FAILED", "Failed to fetch permissions", String(err));
  }
}

/** PUT /api/temple-default-roles/[slug]/permissions — Save temple default role template permissions. */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  const { slug } = await params;
  const roleSlug = slug.trim();
  if (!isTempleDefaultRoleSlug(roleSlug)) {
    return nextJsonError(404, "ROLE_NOT_FOUND", "Unknown temple role", `No default temple role with slug "${roleSlug}".`);
  }

  try {
    const body = await request.json();
    const { permissions } = body as {
      permissions: Array<{ featureKey: string; accessLevel: AccessLevel }>;
    };
    if (!Array.isArray(permissions)) {
      return nextJsonError(
        400,
        "VALIDATION_ERROR",
        "permissions must be an array",
        "Provide a permissions array in the request body."
      );
    }
    const saved = await saveTempleDefaultRolePermissions(roleSlug, permissions);
    return nextJsonSuccess(
      200,
      saved,
      "Permissions saved",
      `Permissions for temple role "${roleSlug}" updated successfully.`
    );
  } catch (err) {
    return nextJsonError(500, "TEMPLE_ROLE_PERMS_SAVE_FAILED", "Failed to save permissions", String(err));
  }
}
