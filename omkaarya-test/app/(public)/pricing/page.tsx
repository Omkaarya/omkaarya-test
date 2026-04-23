import { Metadata } from "next";
import { PricingHeader } from "../../components/marketing/pricing-ds/PricingHeader";
import { PricingCards } from "../../components/marketing/pricing-ds/PricingCards";
import { ComparePlansTable } from "../../components/marketing/pricing-ds/ComparePlansTable";
import { AppDownloadBanners } from "../../components/marketing/pricing-ds/AppDownloadBanners";
import { FaqSection } from "../../components/marketing/pricing-ds/FaqSection";
import { PricingCTA } from "../../components/marketing/pricing-ds/PricingCTA";

export const metadata: Metadata = {
  title: "Pricing | Omkaarya",
  description: "Flexible plans that grow with you. Simple pricing built for every scale.",
};

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex flex-col items-center">
        <PricingHeader />
        <PricingCards />
        <ComparePlansTable />
        <AppDownloadBanners />
        <FaqSection />
      </div>
      <PricingCTA />
    </div>
  );
}
