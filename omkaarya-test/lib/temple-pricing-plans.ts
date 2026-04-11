/** Static pricing tiers for temple onboarding (UI only until billing API exists). */

import type { LucideIcon } from "lucide-react";
import { Layers2, Zap } from "lucide-react";

export type TemplePlanId = "basic" | "business" | "enterprise";

export type TemplePricingPlan = {
  id: TemplePlanId;
  name: string;
  /** Shown in circular icon frame */
  Icon: LucideIcon;
  /** Display price when annual toggle is on (per month, billed annually) */
  priceAnnualPerMonth: number;
  /** Display price when monthly billing */
  priceMonthly: number;
  features: string[];
};

/**
 * Annual shows $10 / $20 / $40 per month billed annually (design).
 * Monthly is ~20% higher than effective annual monthly for messaging consistency.
 */
export const TEMPLE_PRICING_PLANS: TemplePricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    Icon: Zap,
    priceAnnualPerMonth: 10,
    priceMonthly: 13,
    features: [
      "Access to all basic features",
      "Basic reporting and analytics",
      "Up to 10 individual users",
      "20 GB individual data each user",
      "Basic chat and email support",
    ],
  },
  {
    id: "business",
    name: "Business",
    Icon: Layers2,
    priceAnnualPerMonth: 20,
    priceMonthly: 25,
    features: [
      "200+ integrations",
      "Advanced reporting and analytics",
      "Up to 20 individual users",
      "40 GB individual data each user",
      "Priority chat and email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    Icon: Layers2,
    priceAnnualPerMonth: 40,
    priceMonthly: 50,
    features: [
      "Advanced custom fields",
      "Audit log and data history",
      "Unlimited individual users",
      "Unlimited individual data",
      "Personalized + priority service",
    ],
  },
];

export function getTemplePlanById(id: TemplePlanId): TemplePricingPlan | undefined {
  return TEMPLE_PRICING_PLANS.find((p) => p.id === id);
}
