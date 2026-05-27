/**
 * Next.js `app/api/temple-admin/*` paths that are intentionally public (no session cookie).
 * All other `/api/temple-admin` routes require a temple-admin session.
 */
export const TEMPLE_ADMIN_PUBLIC_API_PATHS = new Set<string>([
  "/api/temple-admin/deity-catalog",
]);

export function isTempleAdminPublicApiPath(pathname: string): boolean {
  return TEMPLE_ADMIN_PUBLIC_API_PATHS.has(pathname);
}

export function isTempleAdminProtectedApiPath(pathname: string): boolean {
  return pathname === "/api/temple-admin" || pathname.startsWith("/api/temple-admin/");
}
