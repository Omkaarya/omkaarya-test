export type WhyItMattersActivityStatus = "booked" | "receipt" | "pending";

export type WhyItMattersDashboardPayload = {
  headerIcon: string;
  headerTitle: string;
  devoteesFormatted: string;
  monthAmountDisplay: string;
  monthAmountLabel: string;
  giftAidBannerText: string;
  activityLines: { lineText: string; status: WhyItMattersActivityStatus }[];
};

const FALLBACK_DASHBOARD: WhyItMattersDashboardPayload = {
  headerIcon: "📊",
  headerTitle: "Temple Dashboard",
  devoteesFormatted: "1,240",
  monthAmountDisplay: "£4,820",
  monthAmountLabel: "This Month",
  giftAidBannerText: "🇬🇧 Gift Aid receipt generated · £125.00",
  activityLines: [
    { lineText: "Ganesh Pooja — Ramesh K.", status: "booked" },
    { lineText: "Donation — Priya N. — £50", status: "receipt" },
    { lineText: "Abhishekam — Suresh P.", status: "pending" },
  ],
};

function tagForStatus(status: WhyItMattersActivityStatus): { className: string; label: string } {
  switch (status) {
    case "booked":
      return { className: "tag-sm green", label: "✓ Booked" };
    case "receipt":
      return { className: "tag-sm green", label: "✓ Receipt" };
    case "pending":
    default:
      return { className: "tag-sm yellow", label: "Pending" };
  }
}

export type WhyItMattersProps = {
  dashboard?: WhyItMattersDashboardPayload | null;
};

export function WhyItMatters({ dashboard }: WhyItMattersProps) {
  const d = dashboard ?? FALLBACK_DASHBOARD;

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
              <div className="wvi-header"><span>{d.headerIcon}</span><span>{d.headerTitle}</span></div>
              <div className="wvi-stat-row">
                <div className="wvi-stat"><strong>{d.devoteesFormatted}</strong><small>Devotees</small></div>
                <div className="wvi-stat"><strong>{d.monthAmountDisplay}</strong><small>{d.monthAmountLabel}</small></div>
              </div>
              {d.activityLines.map((row, i) => {
                const tag = tagForStatus(row.status);
                return (
                  <div key={`${row.lineText}-${i}`} className="wvi-row">
                    <span>{row.lineText}</span>
                    <span className={tag.className}>{tag.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="why-floating-badge">{d.giftAidBannerText}</div>
            <div className="why-bell-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          </div>
        </div>
      </div>
    </section>
  );
}
