import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";
import { requireTempleAdminHeaders } from "@/lib/temple-admin-auth";

/** @deprecated Use {@link requireTempleAdminHeaders} — requires tenant-scoped temple session. */
export async function bearerFromCookie(): Promise<string | null> {
  const auth = await requireTempleAdminHeaders();
  return auth.ok ? auth.session.token : null;
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
    const auth = await requireTempleAdminHeaders();
    if (!auth.ok) {
      return auth.response;
    }

    const target = `${apiUrl(backendPath)}${forwardSearch ? request.nextUrl.search : ""}`;
    const headers: Record<string, string> = {
      ...auth.headers,
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

/** Proxies a JSON mutation and binds `sessionEmail` to the authenticated temple-admin user. */
export async function proxyTempleAdminJsonMutation(
  request: NextRequest,
  backendPath: string,
  method: "POST" | "PATCH" | "PUT" = "POST"
): Promise<NextResponse> {
  try {
    const auth = await requireTempleAdminHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    if (!auth.ok) return auth.response;

    const raw = await request.json().catch(() => null);
    const body = {
      ...(typeof raw === "object" && raw !== null ? raw : {}),
      sessionEmail: auth.session.email,
    };

    const res = await fetch(apiUrl(backendPath), {
      method,
      headers: auth.headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upstream request failed.";
    return nextJsonError(503, "UPSTREAM_UNREACHABLE", "Could not reach the API server", message);
  }
}
