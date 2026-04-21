"use client";

import Link from "next/link";
import { useState } from "react";
import { Settings2, Check, Minus, ArrowRight, Clock, CreditCard, Sparkles } from "lucide-react";

// ── Plan data matching Figma ───────────────────────────────────────

const PLANS = [
  {
    id: "Prarambha",
    name: "Prarambha",
    price: "$20",
    period: "/per month",
    description: "Ideal for small temples starting digital management of daily activities and donations.",
    setupFee: "$49 one-time",
    trial: "7 days",
    seats: "3",
    extraSeat: "$6/seat/month",
    included: [
      "Devotee management",
      "Pooja booking (online + manual)",
      "Donations + basic receipts",
      "Temple microsite (subdomain)",
      "Panchangam display",
      "Standard roles",
      "Inventory management - Basic",
    ],
    notIncluded: [
      "Compliance tax receipts",
      "Full microsite + SEO branding",
      "Custom domain",
      "Extended roles",
      "Custom roles",
      "Priority support",
      "Advanced analytics",
    ],
  },
  {
    id: "Sankalpa",
    name: "Sankalpa",
    price: "$49",
    period: "/per month",
    popular: true,
    description: "Ideal for growing temples wanting compliance receipts and advanced features.",
    setupFee: "$99 one-time",
    trial: "14 days",
    seats: "5",
    extraSeat: "$5/seat/month",
    included: [
      "Everything in Prarambha",
      "Compliance tax receipts",
      "Full microsite + SEO branding",
      "Inventory management",
      "Extended roles (Trustee · Accountant)",
      "Priority support",
      "Advanced analytics",
    ],
    notIncluded: [
      "Custom domain",
      "Custom roles",
    ],
  },
  {
    id: "Aaradhana",
    name: "Aaradhana",
    price: "$99",
    period: "/per month",
    description: "Ideal for established temples wanting full control with unlimited customisation for overall operations.",
    setupFee: "$149 one-time",
    trial: "14 days",
    seats: "10",
    extraSeat: "$4/seat/month",
    included: [
      "Everything in Sankalpa",
      "Custom domain",
      "Custom roles",
      "Up to 10 user seats",
      "Dedicated onboarding support",
    ],
    notIncluded: [],
  },
];

export default function PricingPlansPage() {
  const [billedYearly, setBilledYearly] = useState<Record<string, boolean>>({});

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))]">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="border-b border-zinc-100 p-6 dark:border-zinc-800 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400 mb-3">
            <Sparkles className="h-3 w-3" />
            Seva Plans
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Plans built for every size of temple
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Every temple is verified before onboarding. Configure features per plan to control what each tier gets.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 p-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden"
            >
              {/* Card Content */}
              <div className="p-6">
                {/* Plan name + badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
                      <span className="text-xs font-bold text-white dark:text-zinc-900">
                        {plan.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {plan.name}
                    </span>
                  </div>
                  {plan.popular && (
                    <span className="rounded-full border border-zinc-300 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
                      Most Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{plan.price}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{plan.period}</span>
                </div>

                {/* Description */}
                <p className="mb-5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {plan.description}
                </p>

                {/* Meta details */}
                <div className="space-y-2 text-sm mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Setup fee:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{plan.setupFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Trial:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{plan.trial}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Included seats:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{plan.seats}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Extra seat:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{plan.extraSeat}</span>
                  </div>
                </div>

                {/* Billed yearly toggle */}
                <div className="flex items-center gap-2.5 mb-6">
                  <button
                    type="button"
                    onClick={() => setBilledYearly((prev) => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      billedYearly[plan.id]
                        ? "bg-zinc-900 dark:bg-zinc-100"
                        : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                        billedYearly[plan.id] ? "translate-x-4 dark:bg-zinc-900" : "dark:bg-zinc-300"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Billed yearly</span>
                </div>

                {/* Divider */}
                <hr className="border-zinc-100 dark:border-zinc-800 mb-5" />

                {/* Included */}
                <div className="mb-5">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">Included</h4>
                  <ul className="space-y-2.5">
                    {plan.included.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Not Included */}
                {plan.notIncluded.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">Not Included</h4>
                    <ul className="space-y-2.5">
                      {plan.notIncluded.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-400 dark:text-zinc-500">
                          <Minus className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Configure Button - dark, full width at bottom */}
              <div className="mt-auto px-6 pb-6">
                <Link
                  href={`/super-admin/pricing-plans/${encodeURIComponent(plan.id)}/features`}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <Settings2 className="h-4 w-4" />
                  Configure Features
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Cancel anytime.
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              No credit card required.
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              No hidden fees.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
