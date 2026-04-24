import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { fetchAllSaUsers, insertSaUser, deleteSaUser } from "@/lib/sa-users-db";

/** GET /api/admin-users — List all super admin users. */
export async function GET() {
  try {
    const users = await fetchAllSaUsers();
    return nextJsonSuccess(200, users, "Admin users loaded", "All super admin users returned.");
  } catch (err) {
    console.error("GET /api/admin-users error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "SA_USERS_LIST_FAILED", "Failed to fetch admin users", m);
  }
}

/** POST /api/admin-users — Create a new super admin user. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, roleId, isActive } = body;

    if (!name || !email) {
      return nextJsonError(400, "VALIDATION_ERROR", "name and email are required", "Provide both name and email in the request body.");
    }

    const user = await insertSaUser({ name, email, roleId, isActive });
    return nextJsonSuccess(201, user, "Admin user created", "A new super admin user was added to the system.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    if (message.includes("unique") || message.includes("duplicate")) {
      return nextJsonError(409, "EMAIL_CONFLICT", "Email already exists", "Another user already uses this email address.");
    }
    console.error("POST /api/admin-users error:", err);
    return nextJsonError(500, "SA_USER_CREATE_FAILED", "Failed to create admin user", message);
  }
}
