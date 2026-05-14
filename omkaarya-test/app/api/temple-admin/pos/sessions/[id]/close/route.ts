import { NextRequest } from "next/server";
import { proxyTempleAdmin } from "@/lib/temple-admin-proxy";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyTempleAdmin(req, `/api/temple-admin/pos/sessions/${encodeURIComponent(id)}/close`, {
    method: "POST",
    forwardSearch: false,
  });
}
