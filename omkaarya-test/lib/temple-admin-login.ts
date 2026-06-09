/** Canonical unified sign-in path. */
export const UNIFIED_LOGIN_PATH = "/login";

const TEMPLE_ADMIN_PUBLIC_PATHS = new Set([
  UNIFIED_LOGIN_PATH,
  "/temple-admin/forgot-password",
]);

export function isTempleAdminPublicPath(pathname: string): boolean {
  return TEMPLE_ADMIN_PUBLIC_PATHS.has(pathname);
}

/** Hard navigation — replaces history so Back cannot return to a protected page after logout. */
export function redirectToTempleAdminSignin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === UNIFIED_LOGIN_PATH) return;
  window.location.replace(UNIFIED_LOGIN_PATH);
}
