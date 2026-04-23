export function HowToJoin() {
  return (
    <section className="join-section" id="how-to-join">
      <div className="join-container">
        <div className="section-header-center">
          <span className="pill-tag">✦ How To Join</span>
          <h2 className="section-h2">From request to live — in 3 simple steps</h2>
          <p className="section-sub center">No self-signup. Every temple is personally verified and onboarded by our team.</p>
        </div>

        <div className="steps-row">
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Request a Demo</h3>
            <p className="step-desc">Fill a short form with your temple name, country and contact details. Takes less than 2 minutes.</p>
            <ul className="step-bullets">
              <li><span className="arrow-prefix">→</span> Temple name, country, contact details</li>
              <li><span className="arrow-prefix">→</span> Takes less than 2 minutes</li>
              <li><span className="arrow-prefix">→</span> No commitment required</li>
            </ul>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Verification & Demo</h3>
            <p className="step-desc">Our team verifies your temple within 48 hours. Once verified, you book a demo slot.</p>
            <ul className="step-bullets">
              <li><span className="arrow-prefix">→</span> 48-hour verification process</li>
              <li><span className="arrow-prefix">→</span> Pick a demo time that suits you</li>
              <li><span className="arrow-prefix">→</span> Guided platform walkthrough</li>
            </ul>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Account Setup</h3>
            <p className="step-desc">After the demo, we set up your account, microsite and send your invitation link.</p>
            <ul className="step-bullets">
              <li><span className="arrow-prefix">→</span> Subdomain created instantly</li>
              <li><span className="arrow-prefix">→</span> No technical setup on your end</li>
              <li><span className="arrow-prefix">→</span> Live and ready for devotees</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
