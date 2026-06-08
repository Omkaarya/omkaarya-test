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
  return formatMoneyFromCents(cents, "USD");
}

/** Format cents; null/undefined treated as zero (never "—" for amounts). */
export function formatMoneyOrZero(cents: number | null | undefined, currency = "USD"): string {
  const value = typeof cents === "number" && Number.isFinite(cents) ? cents : 0;
  return formatMoneyFromCents(value, currency);
}

/** Format cents using ISO currency code (defaults to INR for platform pricing). */
export function formatMoneyFromCents(cents: number, currency = "INR"): string {
  const code = (currency || "INR").toUpperCase();
  const locale = code === "INR" ? "en-IN" : code === "GBP" ? "en-GB" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(cents / 100);
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

export type PricingPlanComparisonData = {
  plans: { id: string; name: string }[];
  features: {
    featureId: string;
    name: string;
    key: string;
    moduleKey: string;
    hasLimit: boolean;
    values: Record<string, { enabled: boolean; limit: number | null }>;
  }[];
};

type PublicPricingApiBody = {
  success?: boolean;
  data?: {
    plans?: ApiPricingPlan[];
    comparison?: PricingPlanComparisonData;
  };
};

/** Temple onboarding uses public pricing (no super-admin auth). */
export async function fetchPublicPricingCatalog(): Promise<
  | { ok: true; plans: ApiPricingPlan[]; comparison: PricingPlanComparisonData | null }
  | { ok: false; message: string }
> {
  try {
    const res = await fetch("/api/public/pricing", { cache: "no-store", credentials: "same-origin" });
    const json = (await res.json().catch(() => null)) as PublicPricingApiBody | null;
    if (!res.ok || !json?.success || !Array.isArray(json.data?.plans)) {
      return { ok: false, message: "Could not load pricing plans." };
    }
    return {
      ok: true,
      plans: json.data.plans,
      comparison: json.data.comparison ?? null,
    };
  } catch {
    return { ok: false, message: "Network error while loading plans." };
  }
}
