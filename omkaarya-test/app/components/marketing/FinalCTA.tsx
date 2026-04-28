export function FinalCTA() {
  return (
    <section className="final-cta" id="cta-final">
      <div className="final-cta-arch-top"></div>
      <div className="final-cta-waves-left">
        <svg viewBox="0 0 200 900" fill="none" preserveAspectRatio="none">
          <path d="M180 0C180 0 60 150 80 300C100 450 180 400 160 550C140 700 60 650 80 900" stroke="rgba(217,84,21,0.08)" strokeWidth="2" fill="none"/>
          <path d="M150 0C150 0 30 180 50 330C70 480 150 430 130 580C110 730 30 680 50 900" stroke="rgba(217,84,21,0.12)" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="final-cta-waves-right">
        <svg viewBox="0 0 200 900" fill="none" preserveAspectRatio="none">
          <path d="M20 0C20 0 140 150 120 300C100 450 20 400 40 550C60 700 140 650 120 900" stroke="rgba(217,84,21,0.08)" strokeWidth="2" fill="none"/>
          <path d="M50 0C50 0 170 180 150 330C130 480 50 430 70 580C90 730 170 680 150 900" stroke="rgba(217,84,21,0.12)" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      <div className="final-cta-content">
        <span className="pill-tag dark">✦ Get Started Today</span>
        <h2 className="final-cta-h2">Ready to give your<br/>temple a digital home?</h2>
        <p className="final-cta-sub">Join temples across 6 countries already using Omkaarya. Request a demo — we'll have you live within 24 hours of your call.</p>
        <div className="final-cta-buttons">
          <a href="#" className="btn-orange-glow">Request a Demo <span className="arrow">→</span></a>
          <a href="#contact" className="btn-dark-outline">Contact Us</a>
        </div>
        <p className="final-cta-note">Every temple personally verified · support@omkaarya.com</p>
      </div>
      <div className="final-cta-arch-bottom"></div>
    </section>
  );
}
