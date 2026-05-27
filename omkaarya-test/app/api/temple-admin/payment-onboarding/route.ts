import { NextRequest } from "next/server";
import { proxyTempleAdminJsonMutation } from "@/lib/temple-admin-proxy";

export async function POST(req: NextRequest) {
  return proxyTempleAdminJsonMutation(req, "/api/temple-admin/payment-onboarding", "POST");
}
