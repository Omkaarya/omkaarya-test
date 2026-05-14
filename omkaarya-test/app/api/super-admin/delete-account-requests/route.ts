import { NextRequest } from "next/server";
import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { listDeleteAccountRequests } from "@/lib/delete-account-requests-db";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

function parseIntParam(v: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(v ?? "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** GET /api/super-admin/delete-account-requests — paginated queue with stats. */
export async function GET(request: NextRequest) {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  try {
    const sp = request.nextUrl.searchParams;
    const page = parseIntParam(sp.get("page"), 1, 1, 10_000);
    const pageSize = parseIntParam(sp.get("pageSize"), 10, 1, 100);
    const q = sp.get("q") ?? "";
    const statusRaw = sp.get("status") ?? "All";
    const status =
      statusRaw === "Pending" || statusRaw === "Approved" || statusRaw === "Rejected" || statusRaw === "All"
        ? statusRaw
        : "All";

    const data = await listDeleteAccountRequests({ q, status, page, pageSize });
    return nextJsonSuccess(200, data, "Delete requests loaded", "Paginated delete-account requests returned.");
  } catch (err) {
    console.error("GET /api/super-admin/delete-account-requests error:", err);
    const m = err instanceof Error ? err.message : String(err);
    return nextJsonError(500, "DELETE_REQUESTS_LIST_FAILED", "Failed to load delete requests", m);
  }
}
