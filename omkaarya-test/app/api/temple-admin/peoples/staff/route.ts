import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export const GET = (req: NextRequest) =>
  proxyTempleAdmin(req, "/api/temple-admin/peoples/staff", { method: "GET" });

export const POST = (req: NextRequest) =>
  proxyTempleAdmin(req, "/api/temple-admin/peoples/staff", { method: "POST", forwardSearch: false });
