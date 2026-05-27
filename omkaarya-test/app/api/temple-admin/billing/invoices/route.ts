import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireTempleAdminHeaders } from "@/lib/temple-admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTempleAdminHeaders({ Accept: "application/json" });
    if (!auth.ok) return auth.response;

    const search = new URLSearchParams(request.nextUrl.search);
    search.set("sessionEmail", auth.session.email);
    const target = `${apiUrl("/api/temple-admin/billing/invoices")}?${search.toString()}`;
    const res = await fetch(target, {
      method: "GET",
      headers: auth.headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load open invoices";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
