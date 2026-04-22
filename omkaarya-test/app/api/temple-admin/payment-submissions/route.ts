import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    const res = await fetch(apiUrl("/api/temple-admin/payment-submissions"), {
      method: "POST",
      body: form,
      // Let fetch set multipart boundary automatically.
      headers: { Accept: "application/json" },
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Temple payment submission proxy error:", error);
    const r = error instanceof Error ? error.message : "The Next.js proxy failed before reaching the API.";
    return nextJsonError(500, "PROXY_ERROR", "Internal server error", r);
  }
}

