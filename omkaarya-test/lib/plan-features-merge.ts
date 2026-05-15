/**
 * Merge helpers for plan feature matrix: Postgres `plan_features` vs Express
 * `pricing_plans.features` (string[] of display names and/or keys).
 *
 * Create-plan and list UIs store **registry display names** in Express; older data may use **keys**.
 * Matching uses both `name` and `key` (see `registryFeatureInExpressSet`).
 */

/** Trim + lowercase for stable matching across Express JSON and registry rows. */
export function normalizePlanFeatureToken(s: string): string {
  return s.trim().toLowerCase();
}

/** Build a set of normalized tokens from Express `data.features` (names or keys). */
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

/** True if registry name or key appears in the Express-backed token set. */
export function registryFeatureInExpressSet(
  featureName: string,
  featureKey: string,
  expressTokens: Set<string>
): boolean {
  if (expressTokens.size === 0) return false;
  return expressTokens.has(normalizePlanFeatureToken(featureName)) || expressTokens.has(normalizePlanFeatureToken(featureKey));
}
