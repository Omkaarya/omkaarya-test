/**
 * Shared types for `GET /api/pricing-plans` (cents, JSON features list).
 * UI surfaces marketing names: Prarambha, Sankalpa, Aaradhana.
 */

export type ApiPricingPlan = {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  popular: boolean;
  includedSeats: number;
  extraSeatPriceMonthly: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPricingPlanId(s: string | null | undefined): s is string {
  return Boolean(s && UUID_RE.test(s.trim()));
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

/** Per-month display when “annual” billing: effective monthly from yearly price. */
export function effectiveMonthlyFromYearlyCents(yearlyCents: number): number {
  return Math.round(yearlyCents / 12);
}

export function getPlanByIdFromList(
  list: ApiPricingPlan[],
  id: string | undefined
): ApiPricingPlan | undefined {
  if (!id) return undefined;
  return list.find((p) => p.id === id);
}
