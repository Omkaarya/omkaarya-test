import type { AccessLevel } from "@/lib/sa-users-db";

export type TempleDefaultRole = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  color: string;
  permissions: string[];
};

export const TEMPLE_DEFAULT_ROLES: TempleDefaultRole[] = [
  {
    id: "temple-admin",
    name: "Temple Admin",
    description: "Full access to all modules and settings.",
    isSystem: true,
    color: "orange",
    permissions: [
      "dashboard-analytics.view",
      "devotee-crm.create", "devotee-crm.read", "devotee-crm.update", "devotee-crm.delete", "devotee-crm.export",
      "pooja-bookings.create", "pooja-bookings.read", "pooja-bookings.update", "pooja-bookings.delete",
      "donations.create", "donations.read", "donations.update", "donations.delete", "donations.export",
      "inventory.create", "inventory.read", "inventory.update", "inventory.delete",
      "purchase-orders.create", "purchase-orders.read", "purchase-orders.update",
      "finance.create", "finance.read", "finance.update", "finance.delete", "finance.export",
      "reports.read", "reports.export",
      "master-data.create", "master-data.read", "master-data.update", "master-data.delete",
      "settings.create", "settings.read", "settings.update", "settings.delete",
    ],
  },
  {
    id: "operations-manager",
    name: "Operations Manager",
    description: "Manages daily operations. No finance delete or settings changes.",
    isSystem: true,
    color: "blue",
    permissions: [
      "dashboard-analytics.view",
      "devotee-crm.create", "devotee-crm.read", "devotee-crm.update", "devotee-crm.delete", "devotee-crm.export",
      "pooja-bookings.create", "pooja-bookings.read", "pooja-bookings.update", "pooja-bookings.delete",
      "donations.create", "donations.read", "donations.update", "donations.export",
      "inventory.create", "inventory.read", "inventory.update",
      "purchase-orders.create", "purchase-orders.read", "purchase-orders.update",
      "finance.read",
      "reports.read", "reports.export",
      "master-data.create", "master-data.read", "master-data.update",
      "settings.read",
    ],
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Manages donations, finance transactions and financial exports.",
    isSystem: true,
    color: "emerald",
    permissions: [
      "dashboard-analytics.view",
      "devotee-crm.read",
      "donations.create", "donations.read", "donations.update", "donations.delete", "donations.export",
      "finance.create", "finance.read", "finance.update", "finance.delete", "finance.export",
      "purchase-orders.read",
      "inventory.read",
      "reports.read", "reports.export",
      "master-data.read",
      "settings.read",
    ],
  },
  {
    id: "head-priest",
    name: "Head Priest",
    description: "Oversees puja bookings, seva schedules and devotee records.",
    isSystem: true,
    color: "yellow",
    permissions: [
      "dashboard-analytics.view",
      "devotee-crm.read",
      "pooja-bookings.create", "pooja-bookings.read", "pooja-bookings.update",
      "donations.read",
      "master-data.read", "master-data.update",
      "reports.read",
    ],
  },
  {
    id: "counter-staff",
    name: "Counter Staff / POS",
    description: "Handles walk-in donations, POS transactions and devotee check-ins.",
    isSystem: false,
    color: "purple",
    permissions: [
      "dashboard-analytics.view",
      "devotee-crm.create", "devotee-crm.read",
      "pooja-bookings.create", "pooja-bookings.read",
      "donations.create", "donations.read",
      "inventory.read",
      "master-data.read",
    ],
  },
];

const TEMPLE_ROLE_SLUGS = new Set(TEMPLE_DEFAULT_ROLES.map((r) => r.id));

export function isTempleDefaultRoleSlug(slug: string): boolean {
  return TEMPLE_ROLE_SLUGS.has(slug.trim());
}

export function getTempleDefaultRole(slug: string): TempleDefaultRole | null {
  return TEMPLE_DEFAULT_ROLES.find((r) => r.id === slug.trim()) ?? null;
}

/** Map resource.action permission strings to feature-registry access levels. */
export function templePermissionsToAccessEntries(
  permissions: string[]
): Array<{ featureKey: string; accessLevel: AccessLevel }> {
  const byFeature = new Map<string, { read: boolean; write: boolean }>();

  for (const perm of permissions) {
    const dot = perm.lastIndexOf(".");
    if (dot <= 0) continue;
    const featureKey = perm.slice(0, dot);
    const action = perm.slice(dot + 1);
    const entry = byFeature.get(featureKey) ?? { read: false, write: false };
    if (action === "view" || action === "read" || action === "export") entry.read = true;
    if (action === "create" || action === "update" || action === "delete") entry.write = true;
    byFeature.set(featureKey, entry);
  }

  const result: Array<{ featureKey: string; accessLevel: AccessLevel }> = [];
  for (const [featureKey, { read, write }] of byFeature) {
    if (write) result.push({ featureKey, accessLevel: "full" });
    else if (read) result.push({ featureKey, accessLevel: "view" });
  }
  return result;
}

/** Convert feature-registry access levels back to resource.action strings. */
export function accessEntriesToTemplePermissions(
  entries: Array<{ featureKey: string; accessLevel: AccessLevel }>
): string[] {
  const out: string[] = [];
  for (const { featureKey, accessLevel } of entries) {
    if (accessLevel === "none") continue;
    if (accessLevel === "view") {
      out.push(`${featureKey}.read`);
      continue;
    }
    out.push(
      `${featureKey}.create`,
      `${featureKey}.read`,
      `${featureKey}.update`,
      `${featureKey}.delete`
    );
  }
  return out;
}

export function defaultTempleRoleAccessEntries(slug: string): Array<{ featureKey: string; accessLevel: AccessLevel }> {
  const role = getTempleDefaultRole(slug);
  if (!role) return [];
  return templePermissionsToAccessEntries(role.permissions);
}
