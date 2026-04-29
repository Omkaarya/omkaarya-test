import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/mock-db";
import { signToken, setAuthCookie } from "@/lib/auth-utils";
import { nextJsonError } from "@/lib/api-envelope";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { email, tempPassword, password } = payload;
    const loginPassword = password || tempPassword;

    if (!email || !loginPassword) {
      return nextJsonError(400, "VALIDATION_ERROR", "Validation failed", "Email and password are required.");
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return nextJsonError(401, "AUTH_ERROR", "Authentication failed", "Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(loginPassword, user.passwordHash);
    if (!isMatch) {
      return nextJsonError(401, "AUTH_ERROR", "Authentication failed", "Invalid email or password.");
    }

    const token = await signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({ 
      message: "Login successful",
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    const r = error instanceof Error ? error.message : "Internal server error during login.";
    return nextJsonError(500, "INTERNAL_ERROR", "Login failed", r);
  }
}
