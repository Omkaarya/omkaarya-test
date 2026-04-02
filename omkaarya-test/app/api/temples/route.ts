import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";

export async function GET(request: NextRequest) {
  try {
    const target = `${apiUrl("/api/temples")}${request.nextUrl.search}`;
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load temples from backend";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
