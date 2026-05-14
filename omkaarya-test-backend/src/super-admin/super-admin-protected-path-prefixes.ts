/**
 * URL path prefixes (relative to the `/api` mount) that require a platform super-admin JWT.
 * Keep in sync with the Next.js app: `lib/super-admin-api-paths.ts` (cookie gate + proxies).
 */
export const SUPER_ADMIN_JWT_PATH_PREFIXES = [
  "/temples",
  "/billing",
  "/super-admin",
  "/subscriptions",
  "/pricing-plans",
] as const;
