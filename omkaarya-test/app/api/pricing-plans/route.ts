import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const target = `${apiUrl("/api/pricing-plans")}${request.nextUrl.search}`;
    const res = await fetch(target, {
      method: "GET",
      headers: auth.headers,
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load pricing plans";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdminHeaders({ "Content-Type": "application/json" });
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const target = apiUrl("/api/pricing-plans");
    const res = await fetch(target, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create pricing plan";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
