import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";

export async function GET(request: NextRequest) {
  try {
    const target = `${apiUrl("/api/temple-admin/profile")}${request.nextUrl.search}`;
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Temple admin profile fetch error:", error);
    const r =
      error instanceof Error ? error.message : "The Next.js profile proxy failed before reaching the API.";
    return nextJsonError(500, "PROXY_ERROR", "Internal server error", r);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const res = await fetch(apiUrl("/api/temple-admin/profile"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Temple admin profile error:", error);
    const r =
      error instanceof Error ? error.message : "The Next.js profile proxy failed before reaching the API.";
    return nextJsonError(500, "PROXY_ERROR", "Internal server error", r);
  }
}
