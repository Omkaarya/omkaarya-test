import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdminHeaders({ Accept: "text/csv" });
    if (!auth.ok) return auth.response;

    const target = `${apiUrl("/api/billing/revenue-dashboard/export")}${request.nextUrl.search}`;
    const res = await fetch(target, { method: "GET", headers: auth.headers, cache: "no-store" });
    const csv = await res.text();
    if (!res.ok) {
      return nextJsonError(res.status, "UPSTREAM_ERROR", "Failed to export revenue dashboard", csv);
    }
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="revenue-dashboard.csv"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to export revenue dashboard";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
