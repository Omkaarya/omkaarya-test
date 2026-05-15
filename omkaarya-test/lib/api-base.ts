/**
 * Absolute URL to the Express backend. Use only from **server** code (e.g. Next.js
 * `app/api/.../route.ts` proxies, server actions via `fetchInternalApiJson`).
 *
 * Browser `fetch()` should use same-origin paths like `/api/temples` so the Next proxy runs
 * and CORS does not block reading the response body.
 */
const DEFAULT_DEV_BASE = "http://localhost:4000";

function normalizeBase(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, "");
}

/** Resolved backend origin (no path). */
export function getApiBaseUrl(): string {
  const fromServer = normalizeBase(process.env.API_BASE_URL);
  const fromPublic = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL);
  return fromServer ?? fromPublic ?? DEFAULT_DEV_BASE;
}

/** True when production would call localhost (misconfigured Vercel env). */
export function isApiBaseMisconfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const base = getApiBaseUrl();
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(base);
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
