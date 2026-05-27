/** Canonical temple-admin sign-in path (address bar). */
export const TEMPLE_ADMIN_SIGNIN_PATH = "/temple-admin/signin";

const TEMPLE_ADMIN_PUBLIC_PATHS = new Set([
  TEMPLE_ADMIN_SIGNIN_PATH,
  "/temple-admin/forgot-password",
]);

export function isTempleAdminPublicPath(pathname: string): boolean {
  return TEMPLE_ADMIN_PUBLIC_PATHS.has(pathname);
}

/** Hard navigation — replaces history so Back cannot return to a protected page after logout. */
export function redirectToTempleAdminSignin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === TEMPLE_ADMIN_SIGNIN_PATH) return;
  window.location.replace(TEMPLE_ADMIN_SIGNIN_PATH);
}
