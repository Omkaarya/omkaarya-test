import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { updateDeleteAccountRequestStatus } from "@/lib/delete-account-requests-db";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type PatchBody = { status?: string };

/** PATCH /api/super-admin/delete-account-requests/:id — approve or reject while Pending. */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return nextJsonError(400, "VALIDATION_ERROR", "Missing id", "Request path must include a request id.");
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return nextJsonError(400, "VALIDATION_ERROR", "Invalid JSON", "Request body must be JSON.");
  }

  const status = body.status;
  if (status !== "Approved" && status !== "Rejected") {
    return nextJsonError(
      400,
      "VALIDATION_ERROR",
      "Invalid status",
      "Body.status must be \"Approved\" or \"Rejected\"."
    );
  }

  try {
    const result = await updateDeleteAccountRequestStatus(id.trim(), status);
    switch (result.ok) {
      case true:
        return nextJsonSuccess(200, { id: id.trim(), status }, "Status updated", "Delete request status was saved.");
      case false:
        if (result.reason === "not_found") {
          return nextJsonError(404, "NOT_FOUND", "Request not found", "No delete request with this id.");
        }
        return nextJsonError(
          409,
          "INVALID_STATE",
          "Request is not pending",
          "Only pending requests can be approved or rejected."
        );
      default: {
        const _exhaust: never = result;
        return _exhaust;
      }
    }
  } catch (err) {
    console.error("PATCH /api/super-admin/delete-account-requests/[id] error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "DELETE_REQUEST_UPDATE_FAILED", "Failed to update request", m);
  }
}
