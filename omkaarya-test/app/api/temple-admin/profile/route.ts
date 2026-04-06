import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const res = await fetch(apiUrl("/api/temple-admin/profile"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Temple admin profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
