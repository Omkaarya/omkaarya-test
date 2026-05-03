import { Metadata } from "next";
import { PricingHeader } from "../../components/marketing/pricing-ds/PricingHeader";
import { PricingCards } from "../../components/marketing/pricing-ds/PricingCards";
import { ComparePlansTable } from "../../components/marketing/pricing-ds/ComparePlansTable";
import { AppDownloadBanners } from "../../components/marketing/pricing-ds/AppDownloadBanners";
import { FaqSection } from "../../components/marketing/pricing-ds/FaqSection";
import { PricingCTA } from "../../components/marketing/pricing-ds/PricingCTA";
import { apiUrl } from "@/lib/api-base";
import type { PublicPricingPlan } from "../../components/marketing/pricing-ds/PricingCards";
import type { PricingPlanComparisonResponse } from "../../components/marketing/pricing-ds/ComparePlansTable";

export const metadata: Metadata = {
  title: "Pricing | Omkaarya",
  description: "Flexible plans that grow with you. Simple pricing built for every scale.",
};

type ApiSuccessBody<T> = { success: true; data: T };

async function fetchApiData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(apiUrl(path), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as unknown;
    if (json && typeof json === "object" && "success" in json && (json as any).success === true) {
      return (json as ApiSuccessBody<T>).data;
    }
    return null;
  } catch {
    return null;
  }
}

type PublicPricingResponse = {
  plans: PublicPricingPlan[];
  comparison: PricingPlanComparisonResponse;
};

export default async function PricingPage() {
  const pricing = await fetchApiData<PublicPricingResponse>("/api/public/pricing");
  const plans = pricing?.plans ?? [];
  const comparison = pricing?.comparison ?? { plans: [], features: [] };
  const priceByPlanId: Record<string, { monthlyCents: number; yearlyCents: number }> = {};
  for (const p of plans) {
    priceByPlanId[p.id] = { monthlyCents: p.priceMonthly, yearlyCents: p.priceYearly };
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex flex-col items-center">
        <PricingHeader />
        <PricingCards plans={plans} />
        <ComparePlansTable comparison={comparison} priceByPlanId={priceByPlanId} />
        <AppDownloadBanners />
        <FaqSection />
      </div>
      <PricingCTA />
    </div>
  );
}
