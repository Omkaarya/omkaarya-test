import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin-users/[id] */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const res = await fetch(apiUrl(`/api/admin-users/${encodeURIComponent(id)}`), {
      method: "GET",
      headers: auth.headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch user";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

/** PATCH /api/admin-users/[id] */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireSuperAdminHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.text();
    const res = await fetch(apiUrl(`/api/admin-users/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update user";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

/** DELETE /api/admin-users/[id] */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const res = await fetch(apiUrl(`/api/admin-users/${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: auth.headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete user";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
