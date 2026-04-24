"use client";

import React, { useState } from "react";
import { PricingPlanCard, PricingFeature } from "../../ds/molecules/PricingPlanCard";

export function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(true);

  // Common features list for demonstration
  const allFeatures = [
    "Devotee management",
    "Pooja booking (online + manual)",
    "Donations + basic receipts",
    "Temple microsite (subdomain)",
    "Panchangam display",
    "Compliance tax receipts",
    "Full microsite + SEO branding",
    "Custom domain",
    "Inventory management",
    "Multi-admin (up to 3 users)",
    "Priority support",
    "Advanced analytics",
  ];

  const prarambhaFeatures: PricingFeature[] = allFeatures.map((f, i) => ({
    id: `p-${i}`,
    name: f,
    included: i < 5,
  }));

  const sankalpaFeatures: PricingFeature[] = allFeatures.map((f, i) => ({
    id: `s-${i}`,
    name: f,
    included: i < 9,
  }));

  const aaradhanaFeatures: PricingFeature[] = allFeatures.map((f, i) => ({
    id: `a-${i}`,
    name: f,
    included: true,
  }));

  return (
    <div className="w-full flex flex-col items-center">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <PricingPlanCard
          id="prarambha"
          name="Prarambha"
          price={isAnnual ? 187 : 19}
          billingCycle={isAnnual ? "yearly" : "monthly"}
          setupFee={"$49 (one-time)"}
          description="Ideal for small temples starting digital management of daily activities and donations."
          isAnnual={isAnnual}
          onToggleAnnual={setIsAnnual}
          features={[
            { id: "seat", name: `3 Seats included (+$6/mo per extra seat)`, included: true },
            ...prarambhaFeatures.slice(1)
          ]}
          badgeText="3 Seats"
        />

        <PricingPlanCard
          id="sankalpa"
          name="Sankalpa"
          price={isAnnual ? 539 : 49}
          billingCycle={isAnnual ? "yearly" : "monthly"}
          setupFee={"$159 (one-time)"}
          description="Ideal for small temples starting digital management of daily activities and donations."
          isAnnual={isAnnual}
          onToggleAnnual={setIsAnnual}
          features={[
            { id: "seat", name: `5 Seats included (+$5/mo per extra seat)`, included: true },
            ...sankalpaFeatures.slice(1)
          ]}
          badgeText="5 Seats"
        />

        <PricingPlanCard
          id="aaradhana"
          name="Aaradhana"
          price={isAnnual ? 1089 : 99}
          billingCycle={isAnnual ? "yearly" : "monthly"}
          setupFee={"$249 (one-time)"}
          description="Ideal for small temples starting digital management of daily activities and donations."
          isAnnual={isAnnual}
          onToggleAnnual={setIsAnnual}
          features={[
            { id: "seat", name: `10 Seats included (+$${isAnnual ? 3 : 4}/mo per extra seat)`, included: true },
            ...aaradhanaFeatures.slice(1)
          ]}
          isSelected={true}
          badgeText="10 Seats"
        />
      </div>
    </div>
  );
}
