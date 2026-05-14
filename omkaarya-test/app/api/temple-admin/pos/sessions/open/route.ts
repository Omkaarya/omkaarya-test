import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export const POST = (req: NextRequest) =>
  proxyTempleAdmin(req, "/api/temple-admin/pos/sessions/open", { method: "POST", forwardSearch: false });
