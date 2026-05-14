import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export const GET = (req: NextRequest) =>
  proxyTempleAdmin(req, "/api/temple-admin/pos/orders", { method: "GET" });

export const POST = (req: NextRequest) =>
  proxyTempleAdmin(req, "/api/temple-admin/pos/orders", { method: "POST", forwardSearch: false });
