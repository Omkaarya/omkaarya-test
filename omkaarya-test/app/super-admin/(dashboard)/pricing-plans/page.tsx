"use client";

import Link from "next/link";
import { Tag, Layers2, Zap, Settings2, Users, CheckCircle2 } from "lucide-react";

// ── Plan data (matches temple-pricing-plans.ts plan names used in DB) ──

const PLANS = [
  {
    id: "Prarambha",
    name: "Prarambha",
    tier: "Basic",
    Icon: Zap,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    priceMonthly: "£10",
    priceLabel: "/mo billed annually",
    description: "Essential temple management tools for small temples getting started.",
    highlights: ["Core modules", "Up to 2 devices", "Basic analytics", "Email support"],
  },
  {
    id: "Sankalpa",
    name: "Sankalpa",
    tier: "Business",
    Icon: Layers2,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    priceMonthly: "£20",
    priceLabel: "/mo billed annually",
    description: "Advanced features for growing temples with dedicated management needs.",
    highlights: ["All modules", "Up to 5 devices", "Advanced reports", "Priority support"],
    popular: true,
  },
  {
    id: "Aaradhana",
    name: "Aaradhana",
    tier: "Enterprise",
    Icon: Layers2,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
    priceMonthly: "£40",
    priceLabel: "/mo billed annually",
    description: "Full platform access with unlimited features and dedicated support.",
    highlights: ["Unlimited everything", "Custom domain", "API access", "Dedicated manager"],
  },
];

export default function PricingPlansPage() {
  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))]">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Pricing Plans
              </h1>
              <span className="rounded-md bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
                {PLANS.length} plans
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Configure which features are available on each pricing tier
            </p>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 p-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border ${plan.border} ${plan.bg} p-6 transition-shadow hover:shadow-md`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-4 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
                  Most popular
                </span>
              )}

              {/* Icon + Tier */}
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${plan.bg}`}>
                  <plan.Icon className={`h-5 w-5 ${plan.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h2>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{plan.tier} tier</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{plan.priceMonthly}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{plan.priceLabel}</span>
              </div>

              {/* Description */}
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>

              {/* Highlights */}
              <ul className="mb-6 flex-1 space-y-2">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {h}
                  </li>
                ))}
              </ul>

              {/* Configure Button */}
              <Link
                href={`/super-admin/pricing-plans/${encodeURIComponent(plan.id)}/features`}
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <Settings2 className="h-4 w-4" />
                Configure Features
              </Link>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <Tag className="mr-1 inline-block h-3.5 w-3.5" />
            Features are defined in the{" "}
            <Link href="/super-admin/system-settings/feature-registry" className="font-medium text-[var(--brand-primary)] hover:underline">
              Feature Registry
            </Link>
            . Only active, plan-visible features appear in the configuration below.
          </p>
        </div>
      </div>
    </div>
  );
}
