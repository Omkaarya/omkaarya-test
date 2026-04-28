"use client";

export function BentoFeatures() {
  return (
    <>
      {/* Feature Strip Section */}
      <section className="feature-strip-section" id="feature-strip">
        <div className="feature-strip">
          <div className="feature-strip-card">
            <div className="strip-connector-dot"></div>
            <div className="strip-icon">📋</div>
            <div className="strip-title">Tax receipts, automated</div>
            <div className="strip-desc">Gift Aid, 501(c)(3), CRA, DGR, IPC — verified once, generated on every donation.</div>
          </div>
          <div className="feature-strip-card">
            <div className="strip-connector-dot"></div>
            <div className="strip-icon">🙏</div>
            <div className="strip-title">Pooja booking online</div>
            <div className="strip-desc">Accept bookings via your microsite 24/7. No phone calls, no WhatsApp.</div>
          </div>
          <div className="feature-strip-card no-border">
            <div className="strip-connector-dot"></div>
            <div className="strip-icon">📅</div>
            <div className="strip-title">Panchangam built in</div>
            <div className="strip-desc">Tamil, Telugu, Karnataka & Kerala regional variants — maintained for all temples.</div>
          </div>
        </div>

        <div className="trusted-by">
          <div className="trusted-left">
            <div className="trusted-label">Trusted by</div>
            <div className="trusted-count">24+ Temples</div>
            <div className="trusted-sub">Serving Hindu communities across 6 countries</div>
          </div>
          <div className="trusted-right">
            <div className="scroll-track track-1">
              <div className="scroll-inner">
                <span className="temple-chip">🇬🇧 Shiva Mandir London</span>
                <span className="temple-chip">🇦🇺 Ganesh Temple Sydney</span>
                <span className="temple-chip">🇸🇬 Murugan Kovil Singapore</span>
                <span className="temple-chip">🇺🇸 Sri Venkateswara Houston</span>
                <span className="temple-chip">🇨🇦 Durga Mandir Toronto</span>
                <span className="temple-chip">🇱🇰 Siva Kovil Colombo</span>
                {/* Duplicate for seamless loop */}
                <span className="temple-chip">🇬🇧 Shiva Mandir London</span>
                <span className="temple-chip">🇦🇺 Ganesh Temple Sydney</span>
                <span className="temple-chip">🇸🇬 Murugan Kovil Singapore</span>
                <span className="temple-chip">🇺🇸 Sri Venkateswara Houston</span>
                <span className="temple-chip">🇨🇦 Durga Mandir Toronto</span>
                <span className="temple-chip">🇱🇰 Siva Kovil Colombo</span>
              </div>
            </div>
            <div className="scroll-track track-2">
              <div className="scroll-inner reverse">
                <span className="temple-chip">🇬🇧 United Kingdom</span>
                <span className="temple-chip">🇺🇸 United States</span>
                <span className="temple-chip">🇨🇦 Canada</span>
                <span className="temple-chip">🇦🇺 Australia</span>
                <span className="temple-chip">🇸🇬 Singapore</span>
                <span className="temple-chip">🇱🇰 Sri Lanka</span>
                {/* Duplicate for seamless loop */}
                <span className="temple-chip">🇬🇧 United Kingdom</span>
                <span className="temple-chip">🇺🇸 United States</span>
                <span className="temple-chip">🇨🇦 Canada</span>
                <span className="temple-chip">🇦🇺 Australia</span>
                <span className="temple-chip">🇸🇬 Singapore</span>
                <span className="temple-chip">🇱🇰 Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="bento-section" id="features-bento">
        <div className="bento-container">
          <div className="bento-header">
            <div className="bento-header-left">
              <span className="pill-tag">✦ Features</span>
              <h2 className="section-h2">Powerful tools for your <span className="saffron">🛕 temple</span></h2>
              <p className="section-sub">Manage devotees, poojas, donations and compliance receipts — built specifically for Hindu temples.</p>
            </div>
            <div className="bento-header-right">
              <a href="#cta-final" className="btn-dark-pill">Request a Demo <span className="arrow">→</span></a>
              <a href="#core-features" className="btn-outline-pill">See how it works</a>
            </div>
          </div>

          <div className="bento-grid">
            {/* Row 1 */}
            <div className="bento-card">
              <div className="bento-visual">
                <div className="mini-devotee-table">
                  <div className="mdt-row"><div className="mdt-avatar" style={{background:'#FFE0D0'}}>RK</div><div className="mdt-info"><span>Ramesh Kumar</span><span className="mdt-amt">£1,250</span></div><span className="tag-sm green">Active</span></div>
                  <div className="mdt-row"><div className="mdt-avatar" style={{background:'#D4EDDA'}}>PN</div><div className="mdt-info"><span>Priya Nair</span><span className="mdt-amt">£840</span></div><span className="tag-sm green">Active</span></div>
                  <div className="mdt-row"><div className="mdt-avatar" style={{background:'#FFE8CC'}}>SP</div><div className="mdt-info"><span>Suresh Pillai</span><span className="mdt-amt">£2,100</span></div><span className="tag-sm yellow">Inactive</span></div>
                </div>
              </div>
              <div className="bento-info">
                <div className="bento-icon-wrap">👥</div>
                <h3 className="bento-title">Devotee management</h3>
                <p className="bento-desc">Centralised records for every devotee — searchable, exportable and always up to date.</p>
                <span className="plan-tag green">All plans</span>
              </div>
            </div>

            <div className="bento-card">
              <div className="bento-visual">
                <div className="mini-pooja-cards">
                  <div className="mpc"><div className="mpc-name">🙏 Ganesh Pooja</div><div className="mpc-meta">Apr 10 · £21</div><span className="tag-sm green">Confirmed</span></div>
                  <div className="mpc"><div className="mpc-name">🙏 Abhishekam</div><div className="mpc-meta">Apr 12 · £31</div><span className="tag-sm yellow">Pending</span></div>
                  <div className="mpc"><div className="mpc-name">🙏 Lakshmi Pooja</div><div className="mpc-meta">Apr 15 · £25</div><span className="tag-sm green">Confirmed</span></div>
                </div>
              </div>
              <div className="bento-info">
                <div className="bento-icon-wrap">🙏</div>
                <h3 className="bento-title">Pooja booking</h3>
                <p className="bento-desc">Accept bookings online 24/7 via your microsite. No phone calls, no WhatsApp.</p>
                <span className="plan-tag orange">Sankalpa+</span>
              </div>
            </div>

            <div className="bento-card">
              <div className="bento-visual">
                <div className="mini-panchangam">
                  <div className="mp-row mp-header"><span>Date</span><span>Tithi</span><span>🌟</span></div>
                  <div className="mp-row"><span>Apr 9</span><span>Dvadashi</span><span>✓</span></div>
                  <div className="mp-row"><span>Apr 10</span><span>Trayodashi</span><span>—</span></div>
                  <div className="mp-row"><span>Apr 11</span><span>Chaturdashi</span><span>✓</span></div>
                  <div className="mp-row highlight"><span>Apr 12</span><span>Purnima</span><span>✓✓</span></div>
                </div>
              </div>
              <div className="bento-info">
                <div className="bento-icon-wrap">📅</div>
                <h3 className="bento-title">Panchangam</h3>
                <p className="bento-desc">Tamil, Telugu, Karnataka & Kerala — 4 regional traditions maintained for your community.</p>
                <span className="plan-tag green">All plans</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="bento-card wide">
              <div className="bento-visual">
                <div className="mini-receipt">
                  <div className="mr-header">🇬🇧 Gift Aid Receipt</div>
                  <div className="mr-row"><span>Charity No.</span><span>1234567</span></div>
                  <div className="mr-row"><span>Donor</span><span>Ramesh Kumar</span></div>
                  <div className="mr-row"><span>Amount</span><span>£125.00</span></div>
                  <div className="mr-row highlight"><span>Gift Aid Top-up</span><span>£31.25</span></div>
                  <div className="mr-footer">HMRC verified · Auto-generated</div>
                </div>
              </div>
              <div className="bento-info">
                <div className="bento-icon-wrap">📋</div>
                <h3 className="bento-title">Compliance tax receipts</h3>
                <p className="bento-desc">Gift Aid, 501(c)(3), CRA, DGR, IPC — verified once, every donation generates a receipt automatically.</p>
                <span className="plan-tag orange">Aaradhana</span>
                <span className="key-diff">Key differentiator</span>
              </div>
            </div>

            <div className="bento-card wide">
              <div className="bento-visual">
                <div className="mini-browser">
                  <div className="mini-browser-bar">
                    <span className="mini-dots"><i></i><i></i><i></i></span>
                    <span className="mini-url">shiva-mandir-london.omkaarya.com</span>
                  </div>
                  <div className="mini-browser-body">
                    <div className="mini-site-header">🛕 Shiva Mandir London</div>
                    <div className="mini-site-sub">Welcome to our temple</div>
                    <div className="mini-site-cards">
                      <div className="msc">🙏 Book Pooja</div>
                      <div className="msc">💰 Donate</div>
                      <div className="msc">📅 Calendar</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bento-info">
                <div className="bento-icon-wrap">🌐</div>
                <h3 className="bento-title">Temple microsite</h3>
                <p className="bento-desc">Your temple's own website — live in under 10 minutes. No coding, no developer needed.</p>
                <span className="plan-tag green">All plans</span>
              </div>
            </div>
          </div>

          {/* Mini CTA */}
          <div className="mini-cta-bar">
            <span className="mini-cta-text">Get your temple live in under <span className="saffron-underline">10 minutes</span></span>
            <a href="#cta-final" className="mini-cta-link">Request a Demo ›</a>
          </div>
          <div className="mini-cta-chips">
            <span>⚡ Quick onboarding</span>
            <span>🎓 No technical knowledge</span>
            <span>✕ Cancel anytime</span>
          </div>
        </div>
      </section>
    </>
  );
}
