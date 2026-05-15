import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { superAdminBearerFromCookie } from "@/lib/super-admin-auth";

export async function GET() {
  try {
    const session = await superAdminBearerFromCookie();
    if (!session) {
      return nextJsonError(
        401,
        "UNAUTHORIZED",
        "Super-admin authentication required",
        "Sign in with a super-admin account to continue."
      );
    }

    const res = await fetch(apiUrl("/api/super-admin/me"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load super-admin profile";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
