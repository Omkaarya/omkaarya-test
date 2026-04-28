import { DashboardMockup } from "./DashboardMockup";

export function HeroSection() {
  return (
    <section className="hero" id="hero">
      {/* Wave shapes */}
      <div className="hero-wave hero-wave-left">
        <svg viewBox="0 0 200 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M180 0C180 0 60 150 80 300C100 450 180 400 160 550C140 700 60 650 80 900" stroke="rgba(217,84,21,0.08)" strokeWidth="2" fill="none"/>
          <path d="M150 0C150 0 30 180 50 330C70 480 150 430 130 580C110 730 30 680 50 900" stroke="rgba(217,84,21,0.12)" strokeWidth="2" fill="none"/>
          <path d="M120 0C120 0 0 200 20 360C40 520 120 460 100 620C80 780 0 720 20 900" stroke="rgba(217,84,21,0.16)" strokeWidth="2" fill="none"/>
          <path d="M90 0C90 0 -20 220 0 390C20 560 90 500 70 660C50 820 -20 760 0 900" stroke="rgba(217,84,21,0.20)" strokeWidth="2" fill="none"/>
          <path d="M60 0C60 0 -40 250 -20 420C0 590 60 530 40 700C20 870 -40 800 -20 900" stroke="rgba(217,84,21,0.25)" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="hero-wave hero-wave-right">
        <svg viewBox="0 0 200 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M20 0C20 0 140 150 120 300C100 450 20 400 40 550C60 700 140 650 120 900" stroke="rgba(217,84,21,0.08)" strokeWidth="2" fill="none"/>
          <path d="M50 0C50 0 170 180 150 330C130 480 50 430 70 580C90 730 170 680 150 900" stroke="rgba(217,84,21,0.12)" strokeWidth="2" fill="none"/>
          <path d="M80 0C80 0 200 200 180 360C160 520 80 460 100 620C120 780 200 720 180 900" stroke="rgba(217,84,21,0.16)" strokeWidth="2" fill="none"/>
          <path d="M110 0C110 0 220 220 200 390C180 560 110 500 130 660C150 820 220 760 200 900" stroke="rgba(217,84,21,0.20)" strokeWidth="2" fill="none"/>
          <path d="M140 0C140 0 240 250 220 420C200 590 140 530 160 700C180 870 240 800 220 900" stroke="rgba(217,84,21,0.25)" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      <div className="hero-content">
        {/* Announcement pill */}
        <div className="hero-announcement">
          <span className="pulse-dot"></span>
          <span className="announcement-badge">New</span>
          <span className="announcement-text">Panchangam now supports 4 regional traditions</span>
          <a href="#" className="announcement-link">Learn more ›</a>
        </div>

        {/* Headline */}
        <h1 className="hero-headline">
          The Complete Platform<br/>
          For Hindu Temples Worldwide
        </h1>

        {/* Subtext */}
        <p className="hero-subtext">
          Devotee management, pooja booking, donations and tax-compliant receipts — one platform for every country where Hindu temples serve.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta-row">
          <a href="#cta-final" className="btn-hero-primary">Request a Demo <span className="arrow">→</span></a>
          <a href="#core-features" className="btn-hero-secondary">See how it works</a>
        </div>

        {/* Note */}
        <p className="hero-note">
          <svg className="hero-note-arrow" width="28" height="20" viewBox="0 0 28 20" fill="none"><path d="M26 18C20 14 14 6 2 2" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 3"/><path d="M6 1L2 2L3 6" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Every temple verified · Demo within 48 hours
        </p>

        <DashboardMockup />
      </div>
    </section>
  );
}
