export function ComplianceBanner() {
  return (
    <section className="compliance-section" id="compliance-section">
      <div className="compliance-container">
        <div className="compliance-visual">
          <div className="compliance-visual-card">
            <div className="compliance-inner-receipt">
              <div className="cir-header">Gift Aid Receipt</div>
              <div className="cir-row"><span>Charity</span><span>Shiva Mandir London</span></div>
              <div className="cir-row"><span>HMRC No.</span><span>1234567</span></div>
              <div className="cir-row"><span>Donor</span><span>Ramesh Kumar</span></div>
              <div className="cir-row"><span>Amount</span><span>£125.00</span></div>
              <div className="cir-row highlight"><span>Gift Aid</span><span>£31.25</span></div>
            </div>
            <div className="compliance-float-badge b1">Gift Aid verified ✓</div>
            <div className="compliance-float-badge b2">Receipt auto-generated · £125.00</div>
            <div className="compliance-float-badge b3">HMRC charity no. 1234567</div>
          </div>
        </div>
        <div className="compliance-text">
          <span className="pill-tag">✦ Compliance Made Simple</span>
          <h2 className="section-h2 left">Turn every donation into<br/>a tax receipt — automatically</h2>
          <p className="section-sub left">Submit your charity documents once. Pepulux verifies them within 5 business days. Every donation after that generates a fully compliant receipt — forever.</p>
          <div className="compliance-country-cards">
            <div className="ccc"><div className="ccc-flag">🇬🇧</div><div className="ccc-label">Gift Aid</div><div className="ccc-sub">HMRC</div></div>
            <div className="ccc"><div className="ccc-flag">🇺🇸</div><div className="ccc-label">501(c)(3)</div><div className="ccc-sub">IRS</div></div>
            <div className="ccc"><div className="ccc-flag">🇦🇺</div><div className="ccc-label">DGR</div><div className="ccc-sub">ATO + more</div></div>
          </div>
          <div className="compliance-stats">
            <div className="cs"><div className="cs-num">3 days</div><div className="cs-label">Saved per year</div></div>
            <div className="cs"><div className="cs-num">5 days</div><div className="cs-label">Verification</div></div>
            <div className="cs"><div className="cs-num">6</div><div className="cs-label">Countries</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
