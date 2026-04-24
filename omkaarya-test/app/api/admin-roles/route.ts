import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { fetchAllSaRoles, insertSaRole } from "@/lib/sa-users-db";

/** GET /api/admin-roles — List all super admin roles with user counts. */
export async function GET() {
  try {
    const roles = await fetchAllSaRoles();
    return nextJsonSuccess(200, roles, "Admin roles loaded", "All super admin roles with user counts returned.");
  } catch (err) {
    console.error("GET /api/admin-roles error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "SA_ROLES_LIST_FAILED", "Failed to fetch admin roles", m);
  }
}

/** POST /api/admin-roles — Create a new role. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name) {
      return nextJsonError(400, "VALIDATION_ERROR", "name is required", "Provide a role name in the request body.");
    }
    const role = await insertSaRole({ name, description });
    return nextJsonSuccess(201, role, "Role created", "A new super admin role was created.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create role";
    if (message.includes("unique") || message.includes("duplicate")) {
      return nextJsonError(409, "ROLE_NAME_CONFLICT", "Role name already exists", "Another role already has this name.");
    }
    console.error("POST /api/admin-roles error:", err);
    return nextJsonError(500, "SA_ROLE_CREATE_FAILED", "Failed to create role", message);
  }
}
