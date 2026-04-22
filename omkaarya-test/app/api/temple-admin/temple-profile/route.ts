import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";

export async function GET(request: NextRequest) {
  try {
    const target = `${apiUrl("/api/temple-admin/temple-profile")}${request.nextUrl.search}`;
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json" },
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
    const payload = await request.json();

    const res = await fetch(apiUrl("/api/temple-admin/temple-profile/details"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Temple profile details PATCH error:", error);
    const r = error instanceof Error ? error.message : "The Next.js proxy failed before reaching the API.";
    return nextJsonError(500, "PROXY_ERROR", "Internal server error", r);
  }
}
