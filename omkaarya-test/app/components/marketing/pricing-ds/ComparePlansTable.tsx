"use client";

import React from "react";
import { Button } from "../../ds/atoms/Button";

const CheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-success-500">
    <rect width="20" height="20" rx="10" fill="currentColor" fillOpacity="0.1"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M14.707 6.29289C15.0975 6.68342 15.0975 7.31658 14.707 7.70711L8.70711 13.7071C8.31658 14.0976 7.68342 14.0976 7.29289 13.7071L4.29289 10.7071C3.90237 10.3166 3.90237 9.68342 4.29289 9.29289C4.68342 8.90237 5.31658 8.90237 5.70711 9.29289L8 11.5858L13.2929 6.29289C13.6834 5.90237 14.3166 5.90237 14.707 6.29289Z" fill="currentColor"/>
  </svg>
);

const MinusIcon = () => (
  <span className="text-gray-300 font-bold">—</span>
);

export type PricingPlanComparisonCell = {
  enabled: boolean;
  limit: number | null;
};

export type PricingPlanComparisonRow = {
  featureId: string;
  name: string;
  key: string;
  moduleKey: string;
  hasLimit: boolean;
  values: Record<string, PricingPlanComparisonCell>;
};

export type PricingPlanComparisonResponse = {
  plans: { id: string; name: string }[];
  features: PricingPlanComparisonRow[];
};

export function ComparePlansTable({
  comparison,
  priceByPlanId,
}: {
  comparison: PricingPlanComparisonResponse;
  priceByPlanId?: Record<string, { monthlyCents: number; yearlyCents: number }>;
}) {
  const plans = comparison.plans.slice(0, 3);

  function dollarsFromCents(cents: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((cents ?? 0) / 100);
  }

  return (
    <div className="w-full max-w-6xl mt-24 mb-16 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Gradient Area */}
      <div className="relative pt-10 pb-6 px-8 text-center border-b border-gray-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b from-brand-50 to-transparent opacity-50 pointer-events-none" />
        <h2 className="text-2xl font-bold text-gray-900 relative z-10">Compare plans</h2>
      </div>

      {/* Sticky Table Header */}
      <div className="grid grid-cols-4 px-6 py-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="col-span-1 flex flex-col justify-end pb-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">Features</span>
        </div>

        {plans.map((p, idx) => {
          const monthlyCents = priceByPlanId?.[p.id]?.monthlyCents;
          return (
            <div
              key={p.id}
              className={`col-span-1 flex flex-col items-center text-center px-4 ${
                idx > 0 ? "border-l border-gray-100" : ""
              }`}
            >
              <span className="text-sm font-semibold text-gray-900 mb-1">{p.name}</span>
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {typeof monthlyCents === "number" ? dollarsFromCents(monthlyCents) : "—"}
                </span>
                <span className="text-xs text-gray-500">/month</span>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-full text-xs h-9 font-semibold text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
              >
                Start free
              </Button>
            </div>
          );
        })}
      </div>

      {/* Feature Rows */}
      <div className="flex flex-col w-full text-sm">
        {comparison.features.map((f) => (
          <div key={f.featureId} className="grid grid-cols-4 px-6 py-4 border-b border-gray-100 items-center">
            <div className="text-gray-600 font-medium">{f.name}</div>
            {plans.map((p) => {
              const cell = f.values[p.id];
              const enabled = cell?.enabled === true;
              const limit = cell?.limit ?? null;
              return (
                <div key={`${f.featureId}-${p.id}`} className="flex justify-center">
                  {enabled ? (
                    f.hasLimit && limit !== null ? (
                      <span className="text-gray-700 font-semibold">{limit}</span>
                    ) : (
                      <CheckCircle />
                    )
                  ) : (
                    <MinusIcon />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </div>
  );
}
