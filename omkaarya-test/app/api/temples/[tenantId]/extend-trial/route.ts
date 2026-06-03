import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { isUuidString } from "@/lib/is-uuid";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

/** POST /api/temples/[tenantId]/extend-trial — extend trial end date (super admin). */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const auth = await requireSuperAdminHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    if (!auth.ok) return auth.response;

    const { tenantId } = await context.params;
    if (!isUuidString(tenantId)) {
      return nextJsonError(400, "INVALID_ID", "Invalid temple id", "The path parameter must be a UUID.");
    }

    const body = await request.text();
    const target = apiUrl(`/api/temples/${encodeURIComponent(tenantId)}/extend-trial`);
    const res = await fetch(target, {
      method: "POST",
      headers: auth.headers,
      body,
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to extend trial";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
