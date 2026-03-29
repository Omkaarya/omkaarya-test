/**
 * Super-admin: set `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:4000`)
 * to call the Express backend. If unset, requests stay on Next `/api`.
 */
export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  if (!base) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
