import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

/** GET /api/temples/check-subdomain — subdomain / custom host availability (super-admin). */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const target = `${apiUrl("/api/temples/check-subdomain")}${request.nextUrl.search}`;
    const res = await fetch(target, { method: "GET", headers: auth.headers, cache: "no-store" });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not verify subdomain or host";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
