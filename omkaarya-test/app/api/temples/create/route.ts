import { NextRequest, NextResponse } from "next/server";
import { insertTempleFromPayload } from "@/lib/temples-db";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload?.temple || !payload?.admin || !payload?.planBilling) {
      return NextResponse.json(
        { error: "Invalid payload. Temple, admin and planBilling are required." },
        { status: 400 }
      );
    }

    const { templeId } = await insertTempleFromPayload(payload);

    return NextResponse.json({
      success: true,
      templeId,
      inviteQueued: true,
      message: "Temple created successfully. Invite email has been queued.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create temple.";
    if (message.includes("Database not configured")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to create temple." }, { status: 500 });
  }
}
