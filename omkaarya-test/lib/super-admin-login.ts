/** Canonical super-admin sign-in path (address bar). */
export const SUPER_ADMIN_LOGIN_PATH = "/super-admin/login";

const SUPER_ADMIN_PUBLIC_PATHS = new Set([
  SUPER_ADMIN_LOGIN_PATH,
  "/super-admin/invite",
]);

export function isSuperAdminPublicPath(pathname: string): boolean {
  return SUPER_ADMIN_PUBLIC_PATHS.has(pathname);
}

/** Hard navigation — replaces history so Back cannot return to a protected page after logout. */
export function redirectToSuperAdminLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === SUPER_ADMIN_LOGIN_PATH) return;
  window.location.replace(SUPER_ADMIN_LOGIN_PATH);
}
