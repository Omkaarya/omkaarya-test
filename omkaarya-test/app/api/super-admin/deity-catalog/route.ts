import { nextJsonSuccess } from "@/lib/api-envelope";
import { DEITY_CATALOG } from "@/lib/deity-catalog";
import { requireSuperAdminHeaders } from "@/lib/super-admin-auth";

/** GET /api/super-admin/deity-catalog — canonical deity ids for onboarding (read-only). */
export async function GET() {
  const auth = await requireSuperAdminHeaders();
  if (!auth.ok) return auth.response;

  return nextJsonSuccess(
    200,
    { entries: DEITY_CATALOG },
    "Deity catalog loaded",
    "Static catalog entries used for temple deity selection are returned."
  );
}
