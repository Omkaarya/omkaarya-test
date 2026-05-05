import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { verifyToken } from "@/lib/auth-utils";
import { nextJsonError } from "@/lib/api-envelope";

async function bearerFromCookie(): Promise<string | null> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token?.trim()) {
    return null;
  }
  const payload = await verifyToken(token);
  if (!payload?.email || typeof payload.email !== "string") {
    return null;
  }
  return token;
}

export async function GET(request: NextRequest) {
  try {
    const token = await bearerFromCookie();
    if (!token) {
      return nextJsonError(401, "UNAUTHORIZED", "Not authenticated", "Sign in again to load inventory.");
    }

    const target = `${apiUrl("/api/temple-admin/inventory/products")}${request.nextUrl.search}`;
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Inventory request failed.";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await bearerFromCookie();
    if (!token) {
      return nextJsonError(401, "UNAUTHORIZED", "Not authenticated", "Sign in again to create a product.");
    }

    const body = await request.json().catch(() => null);
    const target = apiUrl("/api/temple-admin/inventory/products");
    const res = await fetch(target, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body ?? {}),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Inventory request failed.";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
