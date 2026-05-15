import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin-roles/[id]/permissions */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const res = await fetch(apiUrl(`/api/admin-roles/${encodeURIComponent(id)}/permissions`), {
      method: "GET",
      headers: auth.headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch permissions";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

/** PUT /api/admin-roles/[id]/permissions */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireSuperAdminHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.text();
    const res = await fetch(apiUrl(`/api/admin-roles/${encodeURIComponent(id)}/permissions`), {
      method: "PUT",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save permissions";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
