import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

/** GET /api/temple-default-roles */
export async function GET(_request: NextRequest) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const res = await fetch(apiUrl("/api/temple-default-roles"), {
      method: "GET",
      headers: auth.headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load temple roles";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
