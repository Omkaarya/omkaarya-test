import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "text/html" });
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    const res = await fetch(apiUrl(`/api/billing/receipts/${encodeURIComponent(id)}/print`), {
      method: "GET",
      headers: auth.headers,
      cache: "no-store",
    });
    const html = await res.text();
    if (!res.ok) {
      return nextJsonError(res.status, "UPSTREAM_ERROR", "Failed to load printable receipt", html);
    }
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load printable receipt";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

