"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Plus,
  Settings2,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ── Plan data from Figma ───────────────────────────────────────────

const PLANS = [
  {
    id: "Prarambha",
    name: "Prarambha",
    priceMonthly: "$19",
    priceYearly: "$157",
    description:
      "Ideal for small temples starting digital management of daily activities and donations.",
    included: [
      "Devotee management",
      "Pooja booking (online + manual)",
      "Donations + basic receipts",
      "Temple microsite (subdomain)",
      "Panchangam display",
      "Standard roles",
      "Inventory management - Basic",
    ],
  },
  {
    id: "Sankalpa",
    name: "Sankalpa",
    popular: true,
    priceMonthly: "$49",
    priceYearly: "$539",
    description:
      "Ideal for growing temples wanting compliance receipts and advanced features.",
    included: [
      "Devotee management",
      "Pooja booking (online + manual)",
      "Donations + basic receipts",
      "Temple microsite (subdomain)",
      "Panchangam display",
      "Compliance tax receipts",
      "Full microsite + SEO branding",
      "Inventory management",
      "Extended roles (Trustee · Accountant)",
      "Priority support",
    ],
  },
  {
    id: "Aaradhana",
    name: "Aaradhana",
    priceMonthly: "$99",
    priceYearly: "$1089",
    description:
      "Ideal for established temples wanting full control with unlimited customisation.",
    included: [
      "Devotee management",
      "Pooja booking (online + manual)",
      "Donations + basic receipts",
      "Temple microsite (subdomain)",
      "Panchangam display",
      "Compliance tax receipts",
      "Full microsite + SEO branding",
      "Inventory management",
      "Extended roles (Trustee · Accountant)",
      "Priority support",
      "Custom domain",
      "Custom roles",
      "Advanced analytics",
    ],
  },
];

// ── Feature comparison matrix ──────────────────────────────────────

type FeatureRow = {
  name: string;
  prarambha: boolean;
  sankalpa: boolean;
  aaradhana: boolean;
};

const COMPARISON_FEATURES: FeatureRow[] = [
  { name: "Devotee management", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Pooja booking (online + manual)", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Donations + basic receipts", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Compliance tax receipts", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Temple microsite (subdomain)", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Full microsite + SEO branding", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Panchangam display", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Inventory management", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Standard roles", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Extended roles (Trustee · Accountant)", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Custom roles", prarambha: false, sankalpa: false, aaradhana: true },
  { name: "Priority support", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Advanced analytics", prarambha: false, sankalpa: false, aaradhana: true },
  { name: "Custom domain", prarambha: false, sankalpa: false, aaradhana: true },
];

const SEAT_ROW = { label: "Included seats", values: ["3", "5", "10"] };
const EXTRA_SEAT_ROW = { label: "Extra seat", values: ["$6/mo", "$5/mo", "$4/mo"] };

// ── Temple Analytics mock ──────────────────────────────────────────

const TEMPLE_ANALYTICS = [
  { plan: "Prarambha", count: 45, pct: 35 },
  { plan: "Sankalpa", count: 62, pct: 48 },
  { plan: "Aaradhana", count: 22, pct: 17 },
];

// ── Main Page ──────────────────────────────────────────────────────

export default function PricingPlansPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [cardBilling, setCardBilling] = useState<Record<string, "monthly" | "yearly">>({});

  // When top tabs change, reset ALL per-card overrides so every card + toggle syncs
  const handleGlobalBillingChange = (mode: "monthly" | "yearly") => {
    setBilling(mode);
    setCardBilling({}); // clear all per-card overrides — all cards follow global
  };

  const getCardBilling = (planId: string) => cardBilling[planId] || billing;

  const toggleCardBilling = (planId: string) => {
    const current = getCardBilling(planId);
    const next = current === "yearly" ? "monthly" : "yearly";

    const updatedCardBilling = { ...cardBilling, [planId]: next };

    // Check if ALL plans now have the same billing mode → sync global tab
    const allPlanIds = PLANS.map((p) => p.id);
    const allSame = allPlanIds.every(
      (id) => (updatedCardBilling[id] || billing) === next
    );

    if (allSame) {
      // All cards match → update global tab and clear overrides
      setBilling(next);
      setCardBilling({});
    } else {
      setCardBilling(updatedCardBilling);
    }
  };
  const [featureToggles, setFeatureToggles] = useState<Record<string, Record<string, boolean>>>({});

  const togglePlanFeature = (featureName: string, planKey: string) => {
    setFeatureToggles((prev) => {
      const featureRow = prev[featureName] || {};
      return {
        ...prev,
        [featureName]: {
          ...featureRow,
          [planKey]: !(featureRow[planKey] ?? COMPARISON_FEATURES.find(f => f.name === featureName)?.[planKey as keyof FeatureRow] ?? false),
        },
      };
    });
  };

  const getFeatureValue = (featureName: string, planKey: string): boolean => {
    if (featureToggles[featureName]?.[planKey] !== undefined) {
      return featureToggles[featureName][planKey];
    }
    const feature = COMPARISON_FEATURES.find(f => f.name === featureName);
    return feature ? (feature[planKey as keyof FeatureRow] as boolean) : false;
  };

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))] space-y-6">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Pricing Plans
              </h1>
              <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                {PLANS.length} plans
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage and configure your pricing tiers
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Monthly / Yearly tabs */}
            <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => handleGlobalBillingChange("monthly")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billing === "monthly"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => handleGlobalBillingChange("yearly")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billing === "yearly"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                Yearly&nbsp;<span className="text-emerald-600 dark:text-emerald-400">Save 15%</span>
              </button>
            </div>

            {/* Create Plan button */}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              <Plus className="h-4 w-4" />
              Create Pricing Plan
            </button>
          </div>
        </div>

        {/* ─── Plan Cards ──────────────────────────────────────── */}
        <div className="grid gap-6 p-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="p-5">
                {/* Name + badge */}
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h2>
                  {plan.popular && (
                    <span className="rounded-full border border-zinc-300 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
                      Most Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {getCardBilling(plan.id) === "monthly" ? plan.priceMonthly : plan.priceYearly}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    /{getCardBilling(plan.id) === "monthly" ? "month" : "year"}
                  </span>
                </div>

                {/* Description */}
                <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {plan.description}
                </p>

                {/* Included */}
                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Included
                  </h4>
                  <ul className="space-y-1.5">
                    {plan.included.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Per-card billing toggle */}
                <div className="flex items-center gap-2.5 mt-4">
                  <button
                    type="button"
                    onClick={() => toggleCardBilling(plan.id)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      getCardBilling(plan.id) === "yearly"
                        ? "bg-zinc-900 dark:bg-zinc-100"
                        : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                        getCardBilling(plan.id) === "yearly" ? "translate-x-4 dark:bg-zinc-900" : "dark:bg-zinc-300"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Billed yearly</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-auto flex items-center gap-2 border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
                <Link
                  href={`/super-admin/pricing-plans/${encodeURIComponent(plan.id)}/features`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
                >
                  Edit Plan
                </Link>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  Available
                </button>
              </div>
              <div className="border-t border-zinc-100 px-5 py-2 dark:border-zinc-800 text-center">
                <button type="button" className="text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  Downtimes
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Hint text */}
        <div className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <Tag className="mr-1 inline-block h-3.5 w-3.5" />
            Features are defined in the{" "}
            <Link href="/super-admin/system-settings/feature-registry" className="font-medium text-[var(--brand-primary)] hover:underline">
              Feature Registry
            </Link>
            . Only active, plan-visible features appear in the configuration.
          </p>
        </div>
      </div>

      {/* ─── Feature Comparison Table ──────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Plan Comparison</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 w-[40%]">
                  Feature
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Prarambha
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Sankalpa
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Aaradhana
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {COMPARISON_FEATURES.map((feature) => (
                <tr key={feature.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {feature.name}
                  </td>
                  {(["prarambha", "sankalpa", "aaradhana"] as const).map((planKey) => {
                    const enabled = getFeatureValue(feature.name, planKey);
                    return (
                      <td key={planKey} className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => togglePlanFeature(feature.name, planKey)}
                          className={`inline-flex transition-colors ${
                            enabled
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-300 dark:text-zinc-600"
                          }`}
                          title={enabled ? "Enabled — click to disable" : "Disabled — click to enable"}
                        >
                          {enabled ? (
                            <ToggleRight className="h-6 w-6" />
                          ) : (
                            <ToggleLeft className="h-6 w-6" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Seats row */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                <td className="px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {SEAT_ROW.label}
                </td>
                {SEAT_ROW.values.map((v, i) => (
                  <td key={i} className="px-4 py-3 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {v}
                  </td>
                ))}
              </tr>

              {/* Extra seat row */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                <td className="px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {EXTRA_SEAT_ROW.label}
                </td>
                {EXTRA_SEAT_ROW.values.map((v, i) => (
                  <td key={i} className="px-4 py-3 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Temple Analytics ──────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Temple Analytics</h2>
        </div>
        <div className="p-6 space-y-4">
          {TEMPLE_ANALYTICS.map((item) => (
            <div key={item.plan} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
                {item.plan}
              </span>
              <div className="flex-1 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                {item.count} temples
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
