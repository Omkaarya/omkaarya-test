import type { Metadata } from "next";
import { HeroSection } from "../components/marketing/HeroSection";
import { BentoFeatures } from "../components/marketing/BentoFeatures";
import { CoreFeatures } from "../components/marketing/CoreFeatures";
import { WhyItMatters, type WhyItMattersDashboardPayload } from "../components/marketing/WhyItMatters";
import { ComplianceBanner } from "../components/marketing/ComplianceBanner";
import { Comparison } from "../components/marketing/Comparison";
import { HowToJoin } from "../components/marketing/HowToJoin";
import { AnyCountry } from "../components/marketing/AnyCountry";
import { PricingTable } from "../components/marketing/PricingTable";
import { TestimonialMarquee, type MarketingTestimonial } from "../components/marketing/TestimonialMarquee";
import { Resources } from "../components/marketing/Resources";
import { FaqAccordion } from "../components/marketing/FaqAccordion";
import { FinalCTA } from "../components/marketing/FinalCTA";
import { apiUrl } from "@/lib/api-base";

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

type PublicOverview = {
  totalTemples: number;
  totalDevotees: number;
  countriesServed: number;
  activeCount: number;
  trialCount: number;
  latestTempleCreatedAt: string | null;
};

type PublicTempleListItem = {
  name: string;
  city: string;
  countryCode: string;
  countryFlag: string;
  plan: string;
  status: string;
};

type PublicTemplesResponse = {
  data: PublicTempleListItem[];
  limit: number;
  offset: number;
};

type PublicWhyItMattersDashboardResponse = {
  source: "database" | "defaults";
  dashboard: WhyItMattersDashboardPayload;
};

export const metadata: Metadata = {
  title: "Omkaarya",
  description: "Complete management platform for Hindu temples worldwide.",
};

export default async function HomePage() {
  const [overview, temples, testimonials, whyDashboard] = await Promise.all([
    fetchApiData<PublicOverview>("/api/public/overview"),
    fetchApiData<PublicTemplesResponse>("/api/public/temples?limit=6&offset=0"),
    fetchApiData<MarketingTestimonial[]>("/api/public/testimonials"),
    fetchApiData<PublicWhyItMattersDashboardResponse>("/api/public/why-it-matters-dashboard"),
  ]);

  const tItems = (testimonials ?? []).slice(0, 8);
  const templeItems = (temples?.data ?? []).slice(0, 6);
  const stats = {
    activeTemples: overview?.activeCount ?? overview?.totalTemples ?? 0,
    countries: overview?.countriesServed ?? 0,
    devotees: overview?.totalDevotees ?? 0,
  };

  return (
    <>
      <HeroSection />
      <BentoFeatures />
      <CoreFeatures />
      <WhyItMatters dashboard={whyDashboard?.dashboard ?? null} />
      <ComplianceBanner />
      <Comparison />
      <HowToJoin />
      <AnyCountry />
      <PricingTable />

      {!!templeItems.length && (
        <section className="testimonials-section" id="temples">
          <div className="testimonials-container">
            <div className="section-header-center">
              <span className="pill-tag">✦ Trusted by temples</span>
              <h2 className="section-h2">Real temples, real operations</h2>
              <p className="section-sub center">
                A small sample of temples currently using Omkaarya across different countries and plans.
              </p>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {templeItems.map((t) => (
                <div
                  key={`${t.name}-${t.city}-${t.countryCode}`}
                  className="rounded-2xl border"
                  style={{
                    borderColor: "rgba(0,0,0,0.08)",
                    background: "rgba(255,255,255,0.85)",
                    padding: "14px 14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{t.name}</div>
                      <div style={{ color: "rgba(0,0,0,0.6)", fontSize: 12, marginTop: 6 }}>
                        {t.city} · {t.countryCode}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 18 }}>{t.countryFlag}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "rgba(217,84,21,0.10)",
                        color: "rgba(217,84,21,0.95)",
                      }}
                    >
                      {t.plan}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "rgba(0,0,0,0.06)",
                        color: "rgba(0,0,0,0.72)",
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-container">
          <div className="section-header-center">
            <span className="pill-tag">✦ Testimonials</span>
            <h2 className="section-h2">What Temple Administrators Say</h2>
            <p className="section-sub center">From small community temples to large established mandirs across 6 countries — here's what trustees and administrators are saying about Omkaarya.</p>
          </div>
          <div className="testimonial-carousel">
            <TestimonialMarquee items={tItems} />
          </div>
          <div className="testimonial-stats">
            <div className="ts-stat"><div className="ts-num">{stats.activeTemples.toLocaleString()}</div><div className="ts-label">Active temples</div></div>
            <div className="ts-stat"><div className="ts-num">{stats.countries.toLocaleString()}</div><div className="ts-label">Countries served</div></div>
            <div className="ts-stat no-border"><div className="ts-num">{stats.devotees.toLocaleString()}</div><div className="ts-label">Devotees onboarded</div></div>
          </div>
        </div>
      </section>

      <Resources />
      <FaqAccordion />
      <FinalCTA />
    </>
  );
}
