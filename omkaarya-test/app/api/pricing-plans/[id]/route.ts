import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const target = apiUrl(`/api/pricing-plans/${id}`);
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load pricing plan";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const target = apiUrl(`/api/pricing-plans/${id}`);
    const res = await fetch(target, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update pricing plan";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const target = apiUrl(`/api/pricing-plans/${id}`);
    const res = await fetch(target, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete pricing plan";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
