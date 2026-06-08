import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { isUuidString } from "@/lib/is-uuid";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const { tenantId } = await context.params;
    if (!isUuidString(tenantId)) {
      return nextJsonError(400, "INVALID_ID", "Invalid temple id", "The path parameter must be a UUID.");
    }
    const target = apiUrl(`/api/temples/${encodeURIComponent(tenantId)}`);
    const res = await fetch(target, {
      method: "GET",
      headers: auth.headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load temple";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const { tenantId } = await context.params;
    if (!isUuidString(tenantId)) {
      return nextJsonError(400, "INVALID_ID", "Invalid temple id", "The path parameter must be a UUID.");
    }
    const target = apiUrl(`/api/temples/${encodeURIComponent(tenantId)}`);
    const res = await fetch(target, {
      method: "DELETE",
      headers: auth.headers,
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete temple";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const auth = await requireSuperAdminHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    if (!auth.ok) return auth.response;

    const { tenantId } = await context.params;
    if (!isUuidString(tenantId)) {
      return nextJsonError(400, "INVALID_ID", "Invalid temple id", "The path parameter must be a UUID.");
    }
    const body = await request.json();
    const target = apiUrl(`/api/temples/${encodeURIComponent(tenantId)}`);
    const res = await fetch(target, {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update temple";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
