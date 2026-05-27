import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireTempleAdminHeaders } from "@/lib/temple-admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTempleAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const search = new URLSearchParams(request.nextUrl.search);
    search.set("sessionEmail", auth.session.email);
    const target = `${apiUrl("/api/temple-admin/temple-profile")}?${search.toString()}`;
    const res = await fetch(target, {
      method: "GET",
      headers: auth.headers,
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load temple profile from backend";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireTempleAdminHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    if (!auth.ok) return auth.response;

    const payload = await request.json().catch(() => ({}));
    const body = {
      ...(typeof payload === "object" && payload !== null ? payload : {}),
      sessionEmail: auth.session.email,
    };

    const res = await fetch(apiUrl("/api/temple-admin/temple-profile/details"), {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Temple profile details PATCH error:", error);
    const r = error instanceof Error ? error.message : "The Next.js proxy failed before reaching the API.";
    return nextJsonError(500, "PROXY_ERROR", "Internal server error", r);
  }
}
