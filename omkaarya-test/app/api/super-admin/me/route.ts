import { nextJsonError, nextJsonSuccess } from "@/lib/api-envelope";
import { getSuperAdminSessionProfile } from "@/lib/super-admin-auth";

export async function GET() {
  try {
    const profile = await getSuperAdminSessionProfile();
    if (!profile) {
      return nextJsonError(
        401,
        "UNAUTHORIZED",
        "Super-admin authentication required",
        "Sign in with a super-admin account to continue."
      );
    }
    return nextJsonSuccess(200, profile, "Profile loaded", "Current super-admin session");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load super-admin profile";
    return nextJsonError(503, "PROFILE_UNAVAILABLE", "Could not load session profile", message);
  }
}
