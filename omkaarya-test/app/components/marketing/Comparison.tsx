export function Comparison() {
  return (
    <section className="comparison-section" id="comparison">
      <div className="comparison-arch-top"></div>
      <div className="comparison-waves-left">
        <svg viewBox="0 0 200 900" fill="none" preserveAspectRatio="none">
          <path d="M180 0C180 0 60 150 80 300C100 450 180 400 160 550C140 700 60 650 80 900" stroke="rgba(217,84,21,0.06)" strokeWidth="2" fill="none"/>
          <path d="M150 0C150 0 30 180 50 330C70 480 150 430 130 580C110 730 30 680 50 900" stroke="rgba(217,84,21,0.09)" strokeWidth="2" fill="none"/>
          <path d="M120 0C120 0 0 200 20 360C40 520 120 460 100 620C80 780 0 720 20 900" stroke="rgba(217,84,21,0.12)" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="comparison-waves-right">
        <svg viewBox="0 0 200 900" fill="none" preserveAspectRatio="none">
          <path d="M20 0C20 0 140 150 120 300C100 450 20 400 40 550C60 700 140 650 120 900" stroke="rgba(217,84,21,0.06)" strokeWidth="2" fill="none"/>
          <path d="M50 0C50 0 170 180 150 330C130 480 50 430 70 580C90 730 170 680 150 900" stroke="rgba(217,84,21,0.09)" strokeWidth="2" fill="none"/>
          <path d="M80 0C80 0 200 200 180 360C160 520 80 460 100 620C120 780 200 720 180 900" stroke="rgba(217,84,21,0.12)" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="comparison-grid-bg"></div>

      <div className="comparison-floating-icon">🛕</div>

      <div className="comparison-content">
        <span className="pill-tag dark">✦ Why Omkaarya</span>
        <h2 className="section-h2 white">How Omkaarya simplifies<br/>what temples struggle with daily</h2>
        <p className="section-sub grey">Manual spreadsheets, WhatsApp bookings and HMRC forms take days. Omkaarya does it in seconds.</p>

        <div className="comparison-table">
          <div className="ct-header">
            <div className="ct-col feature-col">Features</div>
            <div className="ct-col">Manual / Others</div>
            <div className="ct-col omkaarya-col">Omkaarya</div>
          </div>
          <div className="ct-row">
            <div className="ct-col feature-col"><strong>Gift Aid / tax receipts</strong><span>Compliance documentation</span></div>
            <div className="ct-col manual-col">Days of manual work</div>
            <div className="ct-col ok-col">Auto-generated instantly</div>
          </div>
          <div className="ct-row alt">
            <div className="ct-col feature-col"><strong>Pooja bookings</strong><span>Scheduling & management</span></div>
            <div className="ct-col manual-col">Phone calls & WhatsApp</div>
            <div className="ct-col ok-col">Online 24/7 via microsite</div>
          </div>
          <div className="ct-row">
            <div className="ct-col feature-col"><strong>Devotee records</strong><span>Member management</span></div>
            <div className="ct-col manual-col">Scattered Excel files</div>
            <div className="ct-col ok-col">Centralised, searchable</div>
          </div>
          <div className="ct-row alt">
            <div className="ct-col feature-col"><strong>Compliance verification</strong><span>Charity registration</span></div>
            <div className="ct-col manual-col">Unknown, no system</div>
            <div className="ct-col ok-col">5 business days, guided</div>
          </div>
          <div className="ct-row">
            <div className="ct-col feature-col"><strong>Temple website</strong><span>Online presence</span></div>
            <div className="ct-col manual-col">Expensive developer</div>
            <div className="ct-col ok-col">Live in under 10 minutes</div>
          </div>
          <div className="ct-row alt">
            <div className="ct-col feature-col"><strong>Panchangam</strong><span>Religious calendar</span></div>
            <div className="ct-col manual-col">Separate app or printout</div>
            <div className="ct-col ok-col">Built in, 4 regional variants</div>
          </div>
        </div>

        <div className="comparison-cta-row">
          <a href="#cta-final" className="btn-orange-glow">Request a Demo <span className="arrow">→</span></a>
          <a href="#contact" className="btn-dark-outline">Contact Us</a>
        </div>
      </div>
      <div className="comparison-arch-bottom"></div>
    </section>
  );
}
