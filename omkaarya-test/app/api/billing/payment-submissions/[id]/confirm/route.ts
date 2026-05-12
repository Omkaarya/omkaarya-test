import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireSuperAdminHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    const body = (await request.json().catch(() => ({}))) as { verifiedBy?: string };
    const res = await fetch(apiUrl(`/api/billing/payment-submissions/${encodeURIComponent(id)}/confirm`), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({ ...(typeof body.verifiedBy === "string" ? { verifiedBy: body.verifiedBy } : {}) }),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to confirm payment";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
