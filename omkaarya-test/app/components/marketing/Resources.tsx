export function Resources() {
  return (
    <section className="resources-section" id="resources">
      <div className="resources-container">
        <div className="section-header-center">
          <span className="pill-tag">✦ Resources</span>
          <h2 className="section-h2">Guides for temple administrators</h2>
          <p className="section-sub center">Everything you need to understand compliance, onboarding and getting the most from Omkaarya.</p>
        </div>

        <div className="resource-cards">
          <div className="resource-card">
            <div className="resource-top">
              <div className="resource-logo-mark"><div className="rlm-circle"></div><span>Omkaarya</span></div>
              <div className="resource-topic"><em>Gift Aid</em><br/><strong>Guide</strong></div>
            </div>
            <div className="resource-body">
              <div className="resource-meta">
                <span className="resource-cat">Compliance</span>
                <span className="resource-dot">·</span>
                <span className="resource-time">🕐 8 min</span>
              </div>
              <h3 className="resource-title">How Gift Aid works for Hindu temples in the UK</h3>
              <p className="resource-desc">A complete guide to HMRC Gift Aid for temple trustees — what it is, how to register and how Omkaarya automates it.</p>
              <a href="#" className="resource-btn">Read Guide ›</a>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-top">
              <div className="resource-logo-mark"><div className="rlm-circle"></div><span>Omkaarya</span></div>
              <div className="resource-topic"><em>501(c)(3)</em><br/><strong>Guide</strong></div>
            </div>
            <div className="resource-body">
              <div className="resource-meta">
                <span className="resource-cat">Compliance</span>
                <span className="resource-dot">·</span>
                <span className="resource-time">🕐 6 min</span>
              </div>
              <h3 className="resource-title">Setting up 501(c)(3) receipts for your US temple</h3>
              <p className="resource-desc">Everything your temple needs to know about IRS 501(c)(3) compliance and how Omkaarya generates receipts automatically.</p>
              <a href="#" className="resource-btn">Read Guide ›</a>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-top">
              <div className="resource-logo-mark"><div className="rlm-circle"></div><span>Omkaarya</span></div>
              <div className="resource-topic"><em>Panchangam</em><br/><strong>Guide</strong></div>
            </div>
            <div className="resource-body">
              <div className="resource-meta">
                <span className="resource-cat">Temple Management</span>
                <span className="resource-dot">·</span>
                <span className="resource-time">🕐 5 min</span>
              </div>
              <h3 className="resource-title">Panchangam explained — 4 regional traditions</h3>
              <p className="resource-desc">Tamil, Telugu, Karnataka and Kerala traditions explained. How Omkaarya displays the right Panchangam for your community.</p>
              <a href="#" className="resource-btn">Read Guide ›</a>
            </div>
          </div>
        </div>

        <div className="resources-more">
          <a href="#" className="btn-outline-pill">View all resources ›</a>
        </div>
      </div>
    </section>
  );
}
