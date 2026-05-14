import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { verifyToken } from "@/lib/auth-utils";
import { nextJsonError } from "@/lib/api-envelope";

/** Reads the `auth_token` cookie and returns it after lightweight verification. */
export async function bearerFromCookie(): Promise<string | null> {
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

/**
 * Proxies a temple-admin request to the Express backend with Bearer auth derived from the
 * `auth_token` cookie. Forwards the search string, JSON body for non-GET methods, and the
 * upstream JSON envelope verbatim to the caller.
 */
export async function proxyTempleAdmin(
  request: NextRequest,
  backendPath: string,
  options: { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; forwardSearch?: boolean } = {}
): Promise<NextResponse> {
  const method = options.method ?? "GET";
  const forwardSearch = options.forwardSearch ?? true;
  try {
    const token = await bearerFromCookie();
    if (!token) {
      return nextJsonError(401, "UNAUTHORIZED", "Not authenticated", "Sign in again to continue.");
    }

    const target = `${apiUrl(backendPath)}${forwardSearch ? request.nextUrl.search : ""}`;
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    let body: BodyInit | undefined;
    if (method !== "GET" && method !== "DELETE") {
      headers["Content-Type"] = "application/json";
      const raw = await request.json().catch(() => null);
      body = JSON.stringify(raw ?? {});
    }

    const res = await fetch(target, { method, headers, body, cache: "no-store" });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upstream request failed.";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
