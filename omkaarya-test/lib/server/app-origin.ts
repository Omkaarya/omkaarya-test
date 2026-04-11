import { headers } from "next/headers";

function firstHeaderValue(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

/**
 * Computes this Next.js app's origin (scheme + host) on the server.
 *
 * Order:
 * - Reverse-proxy headers (x-forwarded-*)
 * - Direct Host header
 * - Config fallback (NEXT_PUBLIC_APP_URL)
 * - Dev fallback (http://localhost:3000)
 */
export async function getAppOrigin(): Promise<string> {
  const h = await headers();

  const proto =
    firstHeaderValue(h.get("x-forwarded-proto")) ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const host =
    firstHeaderValue(h.get("x-forwarded-host")) ||
    h.get("host")?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/^https?:\/\//, "") ||
    "localhost:3000";

  return `${proto}://${host}`;
}

