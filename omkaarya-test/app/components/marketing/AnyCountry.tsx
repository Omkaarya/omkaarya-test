export function AnyCountry() {
  return (
    <section className="any-country" id="any-country">
      <div className="any-country-waves-left">
        <svg viewBox="0 0 200 900" fill="none" preserveAspectRatio="none">
          <path d="M180 0C180 0 60 150 80 300C100 450 180 400 160 550C140 700 60 650 80 900" stroke="rgba(217,84,21,0.08)" strokeWidth="2" fill="none"/>
          <path d="M150 0C150 0 30 180 50 330C70 480 150 430 130 580C110 730 30 680 50 900" stroke="rgba(217,84,21,0.12)" strokeWidth="2" fill="none"/>
          <path d="M120 0C120 0 0 200 20 360C40 520 120 460 100 620C80 780 0 720 20 900" stroke="rgba(217,84,21,0.16)" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="any-country-waves-right">
        <svg viewBox="0 0 200 900" fill="none" preserveAspectRatio="none">
          <path d="M20 0C20 0 140 150 120 300C100 450 20 400 40 550C60 700 140 650 120 900" stroke="rgba(217,84,21,0.08)" strokeWidth="2" fill="none"/>
          <path d="M50 0C50 0 170 180 150 330C130 480 50 430 70 580C90 730 170 680 150 900" stroke="rgba(217,84,21,0.12)" strokeWidth="2" fill="none"/>
          <path d="M80 0C80 0 200 200 180 360C160 520 80 460 100 620C120 780 200 720 180 900" stroke="rgba(217,84,21,0.16)" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      <div className="any-country-content">
        <div className="any-country-card">
          <div className="any-country-temple-icon">🛕</div>
          <h2 className="any-country-headline">Any country.<br/>Any temple.</h2>
          <div className="flag-grid">
            <div className="flag-cell"><span className="flag-emoji">🇬🇧</span><span className="flag-name">UK</span></div>
            <div className="flag-cell"><span className="flag-emoji">🇺🇸</span><span className="flag-name">US</span></div>
            <div className="flag-cell"><span className="flag-emoji">🇨🇦</span><span className="flag-name">Canada</span></div>
            <div className="flag-cell"><span className="flag-emoji">🇦🇺</span><span className="flag-name">Australia</span></div>
            <div className="flag-cell"><span className="flag-emoji">🇸🇬</span><span className="flag-name">Singapore</span></div>
            <div className="flag-cell"><span className="flag-emoji">🇱🇰</span><span className="flag-name">Sri Lanka</span></div>
            <div className="flag-cell soon"><span className="flag-emoji">🇩🇪</span><span className="flag-name">Germany</span><span className="soon-label">Soon</span></div>
            <div className="flag-cell soon"><span className="flag-emoji">🇫🇷</span><span className="flag-name">France</span><span className="soon-label">Soon</span></div>
            <div className="flag-cell soon"><span className="flag-emoji">🇳🇱</span><span className="flag-name">Netherlands</span><span className="soon-label">Soon</span></div>
            <div className="flag-cell soon"><span className="flag-emoji">🇳🇴</span><span className="flag-name">Norway</span><span className="soon-label">Soon</span></div>
            <div className="flag-cell soon"><span className="flag-emoji">🇩🇰</span><span className="flag-name">Denmark</span><span className="soon-label">Soon</span></div>
            <div className="flag-cell soon"><span className="flag-emoji">🇮🇹</span><span className="flag-name">Italy</span><span className="soon-label">Soon</span></div>
            <div className="flag-cell placeholder"><span className="flag-emoji">🌍</span><span className="flag-name">Your country?</span></div>
            <div className="flag-cell placeholder"><span className="flag-emoji">+</span></div>
            <div className="flag-cell placeholder"><span className="flag-emoji">+</span></div>
          </div>
        </div>

        <div className="any-country-cta-pill">
          <span className="acp-text">Get your temple live on Omkaarya <span className="saffron-underline">Instantly</span></span>
          <a href="#cta-final" className="acp-link">Request a Demo ›</a>
        </div>
        <div className="any-country-chips">
          <span>📋 Easy onboarding</span>
          <span>✅ Verified in 48 hours</span>
          <span>🚀 Live in 24 hours</span>
        </div>
      </div>
    </section>
  );
}
