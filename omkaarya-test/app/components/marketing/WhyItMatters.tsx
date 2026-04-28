export function WhyItMatters() {
  return (
    <section className="why-matters" id="why-matters">
      <div className="why-container">
        <div className="why-left">
          <span className="pill-tag">✦ Why It Matters</span>
          <h2 className="section-h2 left">Stop managing temples<br/>start serving devotees</h2>
          <p className="section-sub left">Omkaarya automates Gift Aid, manages pooja bookings, and keeps your temple's operations running — so trustees can focus on what matters.</p>
          <div className="why-bullets">
            <div className="why-bullet"><div className="why-bullet-icon">🧾</div><span>Auto Gift Aid receipts</span></div>
            <div className="why-bullet"><div className="why-bullet-icon">📋</div><span>Pooja booking online</span></div>
            <div className="why-bullet"><div className="why-bullet-icon">👥</div><span>Devotee records centralised</span></div>
            <div className="why-bullet"><div className="why-bullet-icon">⏰</div><span>Compliance verified in 5 days</span></div>
            <div className="why-bullet"><div className="why-bullet-icon">🌐</div><span>Temple microsite live instantly</span></div>
          </div>
          <div className="why-cta-row">
            <a href="#cta-final" className="btn-dark-pill">Request a Demo <span className="arrow">→</span></a>
            <a href="#core-features" className="btn-outline-pill">See how it works</a>
          </div>
        </div>
        <div className="why-right">
          <div className="why-visual-card">
            <div className="why-visual-inner">
              <div className="wvi-header"><span>📊</span><span>Temple Dashboard</span></div>
              <div className="wvi-stat-row">
                <div className="wvi-stat"><strong>1,240</strong><small>Devotees</small></div>
                <div className="wvi-stat"><strong>£4,820</strong><small>This Month</small></div>
              </div>
              <div className="wvi-row"><span>Ganesh Pooja — Ramesh K.</span><span className="tag-sm green">✓ Booked</span></div>
              <div className="wvi-row"><span>Donation — Priya N. — £50</span><span className="tag-sm green">✓ Receipt</span></div>
              <div className="wvi-row"><span>Abhishekam — Suresh P.</span><span className="tag-sm yellow">Pending</span></div>
            </div>
            <div className="why-floating-badge">🇬🇧 Gift Aid receipt generated · £125.00</div>
            <div className="why-bell-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          </div>
        </div>
      </div>
    </section>
  );
}
