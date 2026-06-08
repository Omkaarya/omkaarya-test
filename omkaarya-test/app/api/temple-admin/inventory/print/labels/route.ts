import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export const POST = (req: NextRequest) =>
  proxyTempleAdmin(req, "/api/temple-admin/inventory/print/labels", { method: "POST", forwardSearch: false });
