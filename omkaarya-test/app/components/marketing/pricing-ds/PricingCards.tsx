"use client";

import React, { useState } from "react";
import { PricingPlanCard, PricingFeature } from "../../ds/molecules/PricingPlanCard";

export type PublicPricingPlan = {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number; // cents
  priceYearly: number; // cents
  popular: boolean;
  includedSeats: number;
  extraSeatPriceMonthly: number; // cents
  features: string[];
};

function dollarsFromCents(cents: number): number {
  return Math.round((cents / 100) * 100) / 100;
}

const SETUP_FEE_BY_PLAN_NAME: Record<string, string> = {
  prarambha: "$49 (one-time)",
  sankalpa: "$159 (one-time)",
  aaradhana: "$249 (one-time)",
};

export function PricingCards({ plans }: { plans: PublicPricingPlan[] }) {
  const [isAnnual, setIsAnnual] = useState(true);

  const allFeatures = Array.from(
    new Set(plans.flatMap((p) => (Array.isArray(p.features) ? p.features : [])))
  ).sort((a, b) => a.localeCompare(b));

  const orderedPlans = [...plans].sort((a, b) => {
    const aPrice = isAnnual ? a.priceYearly : a.priceMonthly;
    const bPrice = isAnnual ? b.priceYearly : b.priceMonthly;
    if (aPrice !== bPrice) return aPrice - bPrice;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {orderedPlans.slice(0, 3).map((plan) => {
          const key = plan.name.trim().toLowerCase();
          const planFeatures = new Set(plan.features ?? []);
          const features: PricingFeature[] = [
            {
              id: `${plan.id}-seats`,
              name: `${plan.includedSeats} Seats included (+$${dollarsFromCents(plan.extraSeatPriceMonthly)}/mo per extra seat)`,
              included: true,
            },
            ...allFeatures.map((f) => ({
              id: `${plan.id}-${f}`,
              name: f,
              included: planFeatures.has(f),
            })),
          ];

          const priceCents = isAnnual ? plan.priceYearly : plan.priceMonthly;
          return (
            <PricingPlanCard
              key={plan.id}
              id={plan.id}
              name={plan.name}
              price={dollarsFromCents(priceCents)}
              billingCycle={isAnnual ? "yearly" : "monthly"}
              setupFee={SETUP_FEE_BY_PLAN_NAME[key] ?? "$—"}
              description={
                plan.description ??
                "Flexible plan designed for temple operations: devotees, bookings, donations, and more."
              }
              isAnnual={isAnnual}
              onToggleAnnual={setIsAnnual}
              features={features}
              isSelected={plan.popular}
              badgeText={`${plan.includedSeats} Seats`}
              ctaText="Request demo"
            />
          );
        })}
      </div>
    </div>
  );
}
