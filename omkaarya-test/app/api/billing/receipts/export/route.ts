import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";

export async function GET(request: NextRequest) {
  try {
    const target = `${apiUrl("/api/billing/receipts/export")}${request.nextUrl.search}`;
    const res = await fetch(target, { method: "GET", headers: { Accept: "text/csv" }, cache: "no-store" });
    const csv = await res.text();
    if (!res.ok) {
      return nextJsonError(res.status, "UPSTREAM_ERROR", "Failed to export receipts", csv);
    }
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="receipts.csv"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to export receipts";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

