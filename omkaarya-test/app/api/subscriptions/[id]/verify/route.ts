import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";

export async function POST(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const res = await fetch(apiUrl(`/api/subscriptions/${encodeURIComponent(id)}/verify`), {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to verify subscription";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
