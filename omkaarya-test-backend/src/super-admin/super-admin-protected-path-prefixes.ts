/**
 * URL path prefixes (relative to the `/api` mount) that require a platform super-admin JWT.
 * Align with Next.js middleware + proxies: {@link SUPER_ADMIN_PROTECTED_API_PREFIXES} in `lib/super-admin-api-paths.ts`.
 */
export const SUPER_ADMIN_JWT_PATH_PREFIXES = [
  "/temples",
  "/billing",
  "/super-admin",
  "/subscriptions",
  "/pricing-plans",
  "/features",
  "/plan-features",
  "/admin-users",
  "/admin-roles",
  "/temple-default-roles",
] as const;
