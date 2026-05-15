import { TEMPLE_DEFAULT_ROLES } from "@/lib/temple-default-roles";

export type PricingPlanRoleQuota = { roleName: string; count: number };

/** Fallback when API sends no role breakdown (3-seat starter shape). */
export const DEFAULT_PRICING_ROLE_QUOTAS: PricingPlanRoleQuota[] = [
  { roleName: "Temple Admin", count: 1 },
  { roleName: "Head Priest", count: 1 },
  { roleName: "Accountant", count: 1 },
];

const EXTRA_SEAT_ROLE_NAMES = ["Trustee", "Manager", "Priest"] as const;

const SEAT_ROLE_FILL_ORDER: string[] = [
  ...TEMPLE_DEFAULT_ROLES.map((r) => r.name),
  ...EXTRA_SEAT_ROLE_NAMES,
];

function parseDeclaredSeatTotal(p: Record<string, unknown>): number | undefined {
  for (const key of ["includedSeats", "included_seats", "totalSeats", "total_seats"] as const) {
    const v = p[key];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.trunc(v);
  }
  return undefined;
}

function parseRoleQuotasFromApi(p: Record<string, unknown>): PricingPlanRoleQuota[] {
  const raw =
    p.roleQuotas ?? p.role_quotas ?? p.seatQuotas ?? p.seat_quotas ?? null;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw
    .map((item): PricingPlanRoleQuota | null => {
      if (typeof item !== "object" || item === null) return null;
      const o = item as Record<string, unknown>;
      const roleName = String(o.roleName ?? o.role_name ?? o.role ?? "").trim();
      const count = Math.max(0, Number(o.count ?? o.seats ?? 0) || 0);
      if (!roleName || count <= 0) return null;
      return { roleName, count };
    })
    .filter((x): x is PricingPlanRoleQuota => x !== null);
}

/** One seat per role in standard order until `total` is reached. */
export function buildRoleQuotasForSeatCount(total: number): PricingPlanRoleQuota[] {
  const target = Math.max(0, Math.trunc(total));
  if (target === 0) return [];

  const quotas: PricingPlanRoleQuota[] = [];
  let remaining = target;
  let i = 0;

  while (remaining > 0 && i < SEAT_ROLE_FILL_ORDER.length) {
    quotas.push({ roleName: SEAT_ROLE_FILL_ORDER[i], count: 1 });
    remaining -= 1;
    i += 1;
  }

  if (remaining > 0) {
    quotas.push({ roleName: "Additional seats", count: remaining });
  }

  return quotas;
}

/** Add roles (1 seat each) until quota rows sum to `targetTotal`. */
function expandRoleQuotasToTotal(
  quotas: PricingPlanRoleQuota[],
  targetTotal: number
): PricingPlanRoleQuota[] {
  const current = quotas.reduce((s, r) => s + r.count, 0);
  if (current >= targetTotal) return quotas;

  const next = quotas.map((q) => ({ ...q }));
  const existing = new Set(next.map((q) => q.roleName));
  let remaining = targetTotal - current;

  for (const roleName of SEAT_ROLE_FILL_ORDER) {
    if (remaining <= 0) break;
    if (existing.has(roleName)) continue;
    next.push({ roleName, count: 1 });
    existing.add(roleName);
    remaining -= 1;
  }

  if (remaining > 0) {
    next.push({ roleName: "Additional seats", count: remaining });
  }

  return next;
}

/**
 * Align included seat total with role rows for pricing plan cards.
 * Fixes API rows where includedSeats is 5 but roleQuotas is missing or only lists 3 roles.
 */
export function normalizePricingPlanSeats(p: Record<string, unknown>): {
  totalSeats: number;
  roleQuotas: PricingPlanRoleQuota[];
} {
  const declaredTotal = parseDeclaredSeatTotal(p);
  let roleQuotas = parseRoleQuotasFromApi(p);
  let seatsFromRoles = roleQuotas.reduce((s, r) => s + r.count, 0);

  if (seatsFromRoles === 0) {
    if (declaredTotal != null && declaredTotal > 0) {
      roleQuotas = buildRoleQuotasForSeatCount(declaredTotal);
    } else {
      roleQuotas = DEFAULT_PRICING_ROLE_QUOTAS;
    }
    seatsFromRoles = roleQuotas.reduce((s, r) => s + r.count, 0);
  } else if (declaredTotal != null && declaredTotal > seatsFromRoles) {
    roleQuotas = expandRoleQuotasToTotal(roleQuotas, declaredTotal);
    seatsFromRoles = declaredTotal;
  }

  const totalSeats = seatsFromRoles > 0 ? seatsFromRoles : declaredTotal ?? 3;

  return { totalSeats, roleQuotas };
}
