import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { isUuidString } from "@/lib/is-uuid";
import { fetchRolePermissions, saveRolePermissions } from "@/lib/sa-users-db";
import type { AccessLevel } from "@/lib/sa-users-db";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin-roles/[id]/permissions — Get all permissions for a role. */
export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const rid = id.trim();
  if (!isUuidString(rid)) return nextJsonError(400, "INVALID_ID", "Invalid role ID", "ID must be a UUID.");
  try {
    const permissions = await fetchRolePermissions(rid);
    return nextJsonSuccess(200, permissions, "Role permissions loaded", `Permissions for role ${rid} returned.`);
  } catch (err) {
    return nextJsonError(500, "SA_PERMS_FETCH_FAILED", "Failed to fetch permissions", String(err));
  }
}

/** PUT /api/admin-roles/[id]/permissions — Save (replace) all permissions for a role. */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const rid = id.trim();
  if (!isUuidString(rid)) return nextJsonError(400, "INVALID_ID", "Invalid role ID", "ID must be a UUID.");
  try {
    const body = await request.json();
    const { permissions } = body as {
      permissions: Array<{ featureKey: string; accessLevel: AccessLevel }>;
    };
    if (!Array.isArray(permissions)) {
      return nextJsonError(400, "VALIDATION_ERROR", "permissions must be an array", "Provide a permissions array in the request body.");
    }
    await saveRolePermissions(rid, permissions);
    const saved = await fetchRolePermissions(rid);
    return nextJsonSuccess(200, saved, "Permissions saved", `Permissions for role ${rid} updated successfully.`);
  } catch (err) {
    return nextJsonError(500, "SA_PERMS_SAVE_FAILED", "Failed to save permissions", String(err));
  }
}
