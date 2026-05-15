import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/super-admin/delete-account-requests/:id — approve or reject while Pending. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const res = await fetch(apiUrl(`/api/super-admin/delete-account-requests/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update delete request";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
