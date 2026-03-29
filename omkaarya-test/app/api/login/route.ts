import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "@/lib/pg-config";

let pool: Pool | null = null;

function getPool(): Pool | null {
  const config = getPoolConfig();
  if (!config) return null;
  if (!pool) pool = new Pool(config);
  return pool;
}

export async function POST(request: NextRequest) {
  try {
    const { email, tempPassword } = await request.json();

    if (!email || !tempPassword) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const p = getPool();
    if (!p) {
      return NextResponse.json(
        { error: "Database not configured. Set DATABASE_URL or DB_* in .env.local." },
        { status: 503 }
      );
    }

    const client = await p.connect();
    try {
      const result = await client.query(
        "SELECT 1 FROM public.users WHERE email = $1 AND temp_password = $2 LIMIT 1",
        [email, tempPassword]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      return NextResponse.json({ success: true, message: "Login successful" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
