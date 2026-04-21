/**
 * Module ↔ Feature Key Mapping
 *
 * Consistent mapping between tenant portal modules (sidebar nav groups)
 * and feature registry keys. Used across:
 *   - Sidebar rendering (hide disabled modules)
 *   - Route protection (block access to disabled modules)
 *   - API validation (block actions for disabled features)
 *
 * IMPORTANT: Feature keys must be stable and never changed after creation.
 */

export const MODULE_FEATURE_MAP: Record<string, string> = {
  pooja: "pooja_management",
  donation: "donation_management",
  inventory: "inventory_management",
  finance: "finance_management",
  device: "device_management",
  staff: "staff_management",
  pos: "counter_sales",
  events: "events_management",
  devotee: "devotee_crm",
  notification: "sms_notifications",
  domain: "custom_domain",
  integration: "api_access",
} as const;

/** All known module keys. */
export const MODULE_KEYS = Object.keys(MODULE_FEATURE_MAP) as readonly string[];

/** Reverse map: feature key → module key. */
export const FEATURE_MODULE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MODULE_FEATURE_MAP).map(([mod, feat]) => [feat, mod])
);

/**
 * Get the feature key for a given module.
 * Returns undefined if the module is not mapped (pass-through — allowed by default).
 */
export function getFeatureKeyForModule(moduleKey: string): string | undefined {
  return MODULE_FEATURE_MAP[moduleKey];
}

/**
 * Get the module key for a given feature key.
 */
export function getModuleKeyForFeature(featureKey: string): string | undefined {
  return FEATURE_MODULE_MAP[featureKey];
}
