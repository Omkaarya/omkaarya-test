import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const res = await fetch(apiUrl("/api/temple-admin/plan-selection"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Temple plan selection error:", error);
    const r = error instanceof Error ? error.message : "The Next.js proxy failed before reaching the API.";
    return nextJsonError(500, "PROXY_ERROR", "Internal server error", r);
  }
}
