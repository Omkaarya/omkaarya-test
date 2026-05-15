import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });
  res.cookies.set("auth_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  return res;
}
