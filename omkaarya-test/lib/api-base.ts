/**
 * Absolute URL to the Express backend. Use only from **server** code (e.g. Next.js
 * `app/api/.../route.ts` proxies, server actions via `fetchInternalApiJson`).
 *
 * Browser `fetch()` should use same-origin paths like `/api/temples` so the Next proxy runs
 * and CORS does not block reading the response body.
 */
export function apiUrl(path: string): string {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const base = (envBase && envBase.replace(/\/$/, "")) || "http://localhost:4000";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
