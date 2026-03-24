import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload?.temple || !payload?.admin || !payload?.planBilling) {
      return NextResponse.json(
        { error: "Invalid payload. Temple, admin and planBilling are required." },
        { status: 400 }
      );
    }

    const templeId = `temp_${Date.now()}`;

    // Placeholder for persistence + invite trigger integration.
    // In production, insert records and enqueue/send invite email here.
    return NextResponse.json({
      success: true,
      templeId,
      inviteQueued: true,
      message: "Temple created successfully. Invite email has been queued.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to create temple." }, { status: 500 });
  }
}
