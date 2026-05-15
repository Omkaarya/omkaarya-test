/**
 * Next.js `app/api/*` path prefixes that proxy to the Express super-admin API
 * (`requireSuperAdminJwt` on `/billing`, `/temples`, `/subscriptions`, `/pricing-plans`, `/super-admin`)
 * or are super-admin-only admin surfaces (features, plan matrix, RBAC).
 *
 * Used by `middleware.ts` for an early session check and should stay aligned with routes that call
 * {@link requireSuperAdminHeaders}.
 */
export const SUPER_ADMIN_PROTECTED_API_PREFIXES: readonly string[] = [
  "/api/billing",
  "/api/temples",
  "/api/subscriptions",
  "/api/pricing-plans",
  "/api/super-admin",
  "/api/features",
  "/api/plan-features",
  "/api/admin-users",
  "/api/admin-roles",
  "/api/temple-default-roles",
];

export function isSuperAdminProtectedApiPath(pathname: string): boolean {
  return SUPER_ADMIN_PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
