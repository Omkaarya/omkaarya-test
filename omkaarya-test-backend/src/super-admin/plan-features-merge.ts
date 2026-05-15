/**
 * Merge helpers: Postgres `plan_features` vs `pricing_plans.features` (string[] names/keys).
 */

export function normalizePlanFeatureToken(s: string): string {
  return s.trim().toLowerCase();
}

export function expressFeatureTokensFromPayload(raw: unknown): Set<string> {
  const set = new Set<string>();
  if (!Array.isArray(raw)) return set;
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      set.add(normalizePlanFeatureToken(item));
    }
  }
  return set;
}

export function registryFeatureInExpressSet(
  featureName: string,
  featureKey: string,
  expressTokens: Set<string>
): boolean {
  if (expressTokens.size === 0) return false;
  return (
    expressTokens.has(normalizePlanFeatureToken(featureName)) ||
    expressTokens.has(normalizePlanFeatureToken(featureKey))
  );
}
