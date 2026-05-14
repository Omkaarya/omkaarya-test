import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/inventory/transfers/${encodeURIComponent(id)}/lines`, {
    method: "GET",
  });
}
