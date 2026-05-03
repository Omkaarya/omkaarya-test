import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, saveUser } from "@/lib/mock-db";
import { signToken, setAuthCookie } from "@/lib/auth-utils";
import { nextJsonError } from "@/lib/api-envelope";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { email, password } = payload;

    if (!email || !password) {
      return nextJsonError(400, "VALIDATION_ERROR", "Validation failed", "Email and password are required.");
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return nextJsonError(409, "CONFLICT", "User exists", "User with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await saveUser(newUser);

    // Generate JWT and set it as HTTP-only cookie
    const token = await signToken({ userId: newUser.id, email: newUser.email });
    await setAuthCookie(token);

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: { id: newUser.id, email: newUser.email }
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    const r = error instanceof Error ? error.message : "Internal server error during registration.";
    return nextJsonError(500, "INTERNAL_ERROR", "Registration failed", r);
  }
}
