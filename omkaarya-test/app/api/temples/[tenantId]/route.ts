import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params;
    const target = apiUrl(`/api/temples/${encodeURIComponent(tenantId)}`);
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load temple";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params;
    const body = await request.json();
    const target = apiUrl(`/api/temples/${encodeURIComponent(tenantId)}`);
    const res = await fetch(target, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update temple";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
