/**
 * Frontend API helper: always call the standalone Express backend.
 * This avoids hitting Next.js `app/api/*` routes (which also require DB env).
 */
export function apiUrl(path: string): string {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const base = (envBase && envBase.replace(/\/$/, "")) || "http://localhost:4000";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
