import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";

export async function GET(request: NextRequest) {
  try {
    const target = `${apiUrl("/api/billing/receipts/kpis")}${request.nextUrl.search}`;
    const res = await fetch(target, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load receipt KPIs";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

