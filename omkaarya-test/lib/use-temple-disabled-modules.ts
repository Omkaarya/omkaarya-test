"use client";

import { useEffect, useState } from "react";
import { getFeatureAccessFromList } from "@/lib/feature-access";
import type { TenantFeatureAccess } from "@/lib/plan-features-db";

/** Maps sidebar `moduleKey` values to feature registry keys. */
const NAV_MODULE_FEATURE: Record<string, string> = {
  finance: "finance_management",
  inventory: "inventory_management",
  bookings: "pooja_management",
  pos: "counter_sales",
  kiosk: "device_management",
  prasad: "pooja_management",
  master: "pooja_management",
  peoples: "staff_management",
};

function computeDisabledModules(features: TenantFeatureAccess[]): Set<string> {
  if (features.length === 0) return new Set();
  const disabled = new Set<string>();
  for (const [moduleKey, featureKey] of Object.entries(NAV_MODULE_FEATURE)) {
    const access = getFeatureAccessFromList(features, featureKey);
    if (!access.enabled) disabled.add(moduleKey);
  }
  return disabled;
}

export function useTempleDisabledModules(): Set<string> {
  const [disabledModules, setDisabledModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const meRes = await fetch("/api/temple-admin/me", { cache: "no-store", credentials: "same-origin" });
        if (!meRes.ok) return;
        const meJson = (await meRes.json()) as { success?: boolean; data?: { tenantId?: string } };
        const tenantId = meJson.data?.tenantId?.trim();
        if (!tenantId) return;

        const featRes = await fetch(`/api/tenant-features?tenantId=${encodeURIComponent(tenantId)}`, {
          cache: "no-store",
        });
        if (!featRes.ok) return;
        const featJson = (await featRes.json()) as { success?: boolean; data?: TenantFeatureAccess[] };
        const features = featJson.success && Array.isArray(featJson.data) ? featJson.data : [];
        if (!cancelled) setDisabledModules(computeDisabledModules(features));
      } catch {
        /* keep all modules visible on error */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return disabledModules;
}
