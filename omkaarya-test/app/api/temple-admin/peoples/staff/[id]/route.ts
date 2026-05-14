import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/peoples/staff/${encodeURIComponent(id)}`, {
    method: "PATCH",
    forwardSearch: false,
  });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/peoples/staff/${encodeURIComponent(id)}`, {
    method: "DELETE",
    forwardSearch: false,
  });
}
