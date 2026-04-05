import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";

export async function POST(request: NextRequest) {
  try {
    // const payload = await request.json();
    // const res = await fetch(apiUrl("/api/temples/create"), {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", Accept: "application/json" },
    //   body: JSON.stringify(payload),
    // });

    // const data = await res.json().catch(() => null);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create temple.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
