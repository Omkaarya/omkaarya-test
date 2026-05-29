import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/subscriptions/[id] — extend or change plan */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireSuperAdminHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.text();
    const res = await fetch(apiUrl(`/api/subscriptions/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update subscription";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
