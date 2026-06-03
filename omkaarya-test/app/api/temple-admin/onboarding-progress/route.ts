import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

/** GET /api/temple-admin/onboarding-progress — server-backed onboarding step flags. */
export async function GET(request: NextRequest) {
  return proxyTempleAdmin(request, "/api/temple-admin/onboarding-progress", { method: "GET" });
}
