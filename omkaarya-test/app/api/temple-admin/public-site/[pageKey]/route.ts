import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export async function GET(req: NextRequest, ctx: { params: Promise<{ pageKey: string }> }) {
  const { pageKey } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/public-site/${encodeURIComponent(pageKey)}`, { method: "GET" });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ pageKey: string }> }) {
  const { pageKey } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/public-site/${encodeURIComponent(pageKey)}`, {
    method: "PUT",
    forwardSearch: false,
  });
}
