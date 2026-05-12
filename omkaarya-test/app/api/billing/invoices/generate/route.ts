import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdminHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => ({}));
    const res = await fetch(apiUrl("/api/billing/invoices/generate"), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate invoice";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

