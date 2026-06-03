/**
 * Temple onboarding / profile APIs that must use a tenant-scoped JWT (not open `sessionEmail` alone).
 * Align with Next.js `lib/temple-admin-api-paths.ts` protected proxies.
 */
export const TEMPLE_ONBOARDING_JWT_PATH_PREFIXES = [
  "/temple-admin/profile",
  "/temple-admin/deity-selection",
  "/temple-admin/plan-selection",
  "/temple-admin/payment-onboarding",
  "/temple-admin/payment-submissions",
  "/temple-admin/onboarding-complete",
  "/temple-admin/temple-profile",
  "/temple-admin/billing/invoices",
  "/temple-admin/onboarding-progress",
] as const;
