import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json().catch(() => ({}))) as { verifiedBy?: string };
    const res = await fetch(apiUrl(`/api/billing/payment-submissions/${encodeURIComponent(id)}/confirm`), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ verifiedBy: body.verifiedBy ?? "Super Admin" }),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to confirm payment";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
