import type { Metadata } from "next";
import { HeroSection } from "../components/marketing/HeroSection";
import { BentoFeatures } from "../components/marketing/BentoFeatures";
import { CoreFeatures } from "../components/marketing/CoreFeatures";
import { WhyItMatters } from "../components/marketing/WhyItMatters";
import { ComplianceBanner } from "../components/marketing/ComplianceBanner";
import { Comparison } from "../components/marketing/Comparison";
import { HowToJoin } from "../components/marketing/HowToJoin";
import { AnyCountry } from "../components/marketing/AnyCountry";
import { PricingTable } from "../components/marketing/PricingTable";
import { TestimonialMarquee } from "../components/marketing/TestimonialMarquee";
import { Resources } from "../components/marketing/Resources";
import { FaqAccordion } from "../components/marketing/FaqAccordion";
import { FinalCTA } from "../components/marketing/FinalCTA";

export const metadata: Metadata = {
  title: "Omkaarya",
  description: "Complete management platform for Hindu temples worldwide.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BentoFeatures />
      <CoreFeatures />
      <WhyItMatters />
      <ComplianceBanner />
      <Comparison />
      <HowToJoin />
      <AnyCountry />
      <PricingTable />
      
      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-container">
          <div className="section-header-center">
            <span className="pill-tag">✦ Testimonials</span>
            <h2 className="section-h2">What Temple Administrators Say</h2>
            <p className="section-sub center">From small community temples to large established mandirs across 6 countries — here's what trustees and administrators are saying about Omkaarya.</p>
          </div>
          <div className="testimonial-carousel">
            <TestimonialMarquee />
          </div>
          <div className="testimonial-stats">
            <div className="ts-stat"><div className="ts-num">24+</div><div className="ts-label">Active temples</div></div>
            <div className="ts-stat"><div className="ts-num">6</div><div className="ts-label">Countries served</div></div>
            <div className="ts-stat no-border"><div className="ts-num">5 days</div><div className="ts-label">Average verification</div></div>
          </div>
        </div>
      </section>

      <Resources />
      <FaqAccordion />
      <FinalCTA />
    </>
  );
}
