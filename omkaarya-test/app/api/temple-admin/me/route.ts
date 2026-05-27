import { NextResponse } from "next/server";
import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { getTempleAdminSessionProfile } from "@/lib/temple-admin-auth";

/** GET /api/temple-admin/me — current temple-admin session (requires tenant-scoped JWT). */
export async function GET() {
  try {
    const profile = await getTempleAdminSessionProfile();
    if (!profile) {
      return nextJsonError(
        401,
        "UNAUTHORIZED",
        "Temple-admin authentication required",
        "Sign in with a temple administrator account to continue."
      );
    }

    return nextJsonSuccess(
      200,
      {
        email: profile.email,
        fullName: profile.fullName,
        tenantId: profile.tenantId,
      },
      "Profile loaded",
      "Current temple-admin session"
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load temple-admin profile";
    return nextJsonError(503, "INTERNAL_ERROR", "Session check failed", message);
  }
}
