import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { fetchSaUserById, updateSaUser, deleteSaUser, toggleSaUserActive } from "@/lib/sa-users-db";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin-users/[id] — Get a single admin user. */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const uid = parseInt(id, 10);
  if (isNaN(uid)) return nextJsonError(400, "INVALID_ID", "Invalid user ID", "ID must be a number.");
  try {
    const user = await fetchSaUserById(uid);
    if (!user) return nextJsonError(404, "USER_NOT_FOUND", "User not found", `No admin user with id ${uid} exists.`);
    return nextJsonSuccess(200, user, "User loaded", "Admin user record returned.");
  } catch (err) {
    return nextJsonError(500, "SA_USER_FETCH_FAILED", "Failed to fetch user", String(err));
  }
}

/** PATCH /api/admin-users/[id] — Update or toggle an admin user. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const uid = parseInt(id, 10);
  if (isNaN(uid)) return nextJsonError(400, "INVALID_ID", "Invalid user ID", "ID must be a number.");
  try {
    const body = await request.json();
    // Support toggleActive shorthand
    if (body.toggleActive === true) {
      const user = await toggleSaUserActive(uid);
      if (!user) return nextJsonError(404, "USER_NOT_FOUND", "User not found", `No admin user with id ${uid}.`);
      return nextJsonSuccess(200, user, "User status toggled", `User is now ${user.isActive ? "active" : "inactive"}.`);
    }
    const user = await updateSaUser(uid, body);
    if (!user) return nextJsonError(404, "USER_NOT_FOUND", "User not found", `No admin user with id ${uid}.`);
    return nextJsonSuccess(200, user, "User updated", "Admin user record updated.");
  } catch (err) {
    return nextJsonError(500, "SA_USER_UPDATE_FAILED", "Failed to update user", String(err));
  }
}

/** DELETE /api/admin-users/[id] — Remove an admin user. */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const uid = parseInt(id, 10);
  if (isNaN(uid)) return nextJsonError(400, "INVALID_ID", "Invalid user ID", "ID must be a number.");
  try {
    const deleted = await deleteSaUser(uid);
    if (!deleted) return nextJsonError(404, "USER_NOT_FOUND", "User not found", `No admin user with id ${uid}.`);
    return nextJsonSuccess(200, { id: uid }, "User deleted", "The admin user was permanently removed.");
  } catch (err) {
    return nextJsonError(500, "SA_USER_DELETE_FAILED", "Failed to delete user", String(err));
  }
}
