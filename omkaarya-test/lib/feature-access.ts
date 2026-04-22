/**
 * Feature Access — Central utility for tenant portal
 *
 * Provides `getFeatureAccess(featureKey)` for checking if a feature
 * is enabled and what limits apply for the current tenant.
 *
 * **Backward compatibility:** If no plan_features data exists for the
 * tenant's plan, all features default to enabled with no limits.
 */

import type { TenantFeatureAccess } from "@/lib/plan-features-db";

// ── Types ──────────────────────────────────────────────────────────

export type FeatureAccess = {
  enabled: boolean;
  limit?: number;
};

// ── In-memory cache (per-session) ─────────────────────────────────

let cachedFeatures: TenantFeatureAccess[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

/**
 * Load tenant features from API. Caches for 1 minute to avoid
 * repeated calls within the same session.
 */
async function loadTenantFeatures(tenantId: string): Promise<TenantFeatureAccess[]> {
  const now = Date.now();
  if (cachedFeatures && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedFeatures;
  }

  try {
    const res = await fetch(`/api/tenant-features?tenantId=${encodeURIComponent(tenantId)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as TenantFeatureAccess[];
    cachedFeatures = data;
    cacheTimestamp = now;
    return data;
  } catch {
    return [];
  }
}

/**
 * Get feature access for a specific feature key.
 *
 * **Backward compatibility:** If no features are loaded (no plan_features
 * data in DB), returns { enabled: true } — all features allowed.
 */
export function getFeatureAccessFromList(
  features: TenantFeatureAccess[],
  featureKey: string
): FeatureAccess {
  // Backward compat: if no plan_features exist, allow everything
  if (features.length === 0) {
    return { enabled: true };
  }

  const match = features.find((f) => f.featureKey === featureKey);
  if (!match) {
    // Feature not in plan_features → not configured → default allowed
    return { enabled: true };
  }

  return {
    enabled: match.enabled,
    limit: match.limit ?? undefined,
  };
}

/**
 * Check if a module is accessible for the tenant.
 * Used by sidebar to show/hide nav items.
 */
export function isModuleEnabled(
  features: TenantFeatureAccess[],
  moduleKey: string
): boolean {
  if (features.length === 0) return true; // backward compat
  const moduleFeatures = features.filter((f) => f.moduleKey === moduleKey);
  if (moduleFeatures.length === 0) return true; // not configured → allowed
  return moduleFeatures.some((f) => f.enabled);
}

/**
 * Check if an action is within limits.
 * Returns { allowed: true } or { allowed: false, limit, current }.
 */
export function checkLimit(
  features: TenantFeatureAccess[],
  featureKey: string,
  currentUsage: number
): { allowed: boolean; limit?: number; current: number } {
  const access = getFeatureAccessFromList(features, featureKey);
  if (!access.enabled) {
    return { allowed: false, current: currentUsage };
  }
  if (access.limit === undefined) {
    return { allowed: true, current: currentUsage };
  }
  return {
    allowed: currentUsage < access.limit,
    limit: access.limit,
    current: currentUsage,
  };
}

/** Invalidate the feature cache (call after plan changes). */
export function invalidateFeatureCache(): void {
  cachedFeatures = null;
  cacheTimestamp = 0;
}
