import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export async function GET(req: NextRequest, ctx: { params: Promise<{ area: string }> }) {
  const { area } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/settings/${encodeURIComponent(area)}`, {
    method: "GET",
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ area: string }> }) {
  const { area } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/settings/${encodeURIComponent(area)}`, {
    method: "PATCH",
    forwardSearch: false,
  });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ area: string }> }) {
  const { area } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/settings/${encodeURIComponent(area)}`, {
    method: "PUT",
    forwardSearch: false,
  });
}
