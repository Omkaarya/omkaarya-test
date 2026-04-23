"use client";

import { useState } from "react";

export function CoreFeatures() {
  const [activeTab, setActiveTab] = useState("devotee");

  return (
    <section className="core-features" id="core-features">
      <div className="core-container">
        <div className="section-header-center">
          <span className="pill-tag">✦ Core Features</span>
          <h2 className="section-h2">Give your temple a <span className="saffron">🛕 digital backbone</span></h2>
          <p className="section-sub center">Explore how each feature simplifies a specific part of your temple's operations.</p>
        </div>

        {/* Tabs */}
        <div className="core-tabs" id="core-tabs">
          <button className={`core-tab ${activeTab === 'devotee' ? 'active' : ''}`} onClick={() => setActiveTab('devotee')}>Devotee Management</button>
          <button className={`core-tab ${activeTab === 'pooja' ? 'active' : ''}`} onClick={() => setActiveTab('pooja')}>Pooja Booking</button>
          <button className={`core-tab ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>Donations & Receipts</button>
          <button className={`core-tab ${activeTab === 'compliance' ? 'active' : ''}`} onClick={() => setActiveTab('compliance')}>Compliance Receipts</button>
          <button className={`core-tab ${activeTab === 'panchangam' ? 'active' : ''}`} onClick={() => setActiveTab('panchangam')}>Panchangam</button>
          <button className={`core-tab ${activeTab === 'microsite' ? 'active' : ''}`} onClick={() => setActiveTab('microsite')}>Temple Microsite</button>
        </div>

        {/* Preview cards */}
        <div className="core-preview" id="core-preview">
          {/* Devotee */}
          <div className={`core-panel ${activeTab === 'devotee' ? 'active' : ''}`}>
            <div className="core-left">
              <div className="core-icon">👥</div>
              <h3 className="core-title">Devotee Management</h3>
              <p className="core-desc">Centralised, searchable records for every devotee. Track donations, visits and engagement — all in one place. Export anytime.</p>
              <a href="#cta-final" className="btn-dark-pill sm">Request a Demo <span className="arrow">→</span></a>
              <div className="core-stats">
                <div className="core-stat"><div className="core-stat-num">1,240</div><div className="core-stat-label">Devotees managed</div></div>
                <div className="core-stat"><div className="core-stat-num">£4,820</div><div className="core-stat-label">Donations recorded</div></div>
              </div>
            </div>
            <div className="core-right">
              <div className="core-mockup devotee-mockup">
                <div className="cm-header">👥 All Devotees <span className="cm-count">1,240</span></div>
                <div className="cm-row"><span className="cm-avatar" style={{background:'#FFE0D0'}}>RK</span><span>Ramesh Kumar</span><span>£1,250</span><span className="tag-sm green">Active</span></div>
                <div className="cm-row"><span className="cm-avatar" style={{background:'#D4EDDA'}}>PN</span><span>Priya Nair</span><span>£840</span><span className="tag-sm green">Active</span></div>
                <div className="cm-row"><span className="cm-avatar" style={{background:'#FFE8CC'}}>SP</span><span>Suresh Pillai</span><span>£2,100</span><span className="tag-sm green">Active</span></div>
                <div className="cm-row"><span className="cm-avatar" style={{background:'#E0D4F5'}}>LR</span><span>Lakshmi Reddy</span><span>£560</span><span className="tag-sm yellow">Inactive</span></div>
              </div>
            </div>
          </div>

          {/* Pooja */}
          <div className={`core-panel ${activeTab === 'pooja' ? 'active' : ''}`}>
            <div className="core-left">
              <div className="core-icon">🙏</div>
              <h3 className="core-title">Pooja Booking</h3>
              <p className="core-desc">Accept bookings online 24/7 via your temple's microsite. Devotees pick dates and poojas from their phone — no calls needed.</p>
              <a href="#cta-final" className="btn-dark-pill sm">Request a Demo <span className="arrow">→</span></a>
              <div className="core-stats">
                <div className="core-stat"><div className="core-stat-num">18</div><div className="core-stat-label">Bookings this month</div></div>
                <div className="core-stat"><div className="core-stat-num">Zero</div><div className="core-stat-label">Phone calls</div></div>
              </div>
            </div>
            <div className="core-right">
              <div className="core-mockup">
                <div className="cm-header">🙏 Pooja Bookings</div>
                <div className="cm-pooja-list">
                  <div className="cmp"><span>Ganesh Pooja</span><span>Apr 10</span><span className="tag-sm green">✓</span></div>
                  <div className="cmp"><span>Abhishekam</span><span>Apr 12</span><span className="tag-sm green">✓</span></div>
                  <div className="cmp"><span>Lakshmi Pooja</span><span>Apr 15</span><span className="tag-sm yellow">Pending</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Donations */}
          <div className={`core-panel ${activeTab === 'donations' ? 'active' : ''}`}>
            <div className="core-left">
              <div className="core-icon">💰</div>
              <h3 className="core-title">Donations & Receipts</h3>
              <p className="core-desc">Track every donation, generate receipts instantly and manage Gift Aid claims — all from one dashboard.</p>
              <a href="#cta-final" className="btn-dark-pill sm">Request a Demo <span className="arrow">→</span></a>
              <div className="core-stats">
                <div className="core-stat"><div className="core-stat-num">£4,820</div><div className="core-stat-label">This month</div></div>
                <div className="core-stat"><div className="core-stat-num">47</div><div className="core-stat-label">Donations recorded</div></div>
              </div>
            </div>
            <div className="core-right">
              <div className="core-mockup">
                <div className="cm-header">💰 Donation Ledger</div>
                <div className="cm-row"><span className="cm-avatar" style={{background:'#D4EDDA'}}>RK</span><span>Ramesh K.</span><span>£125</span><span className="tag-sm green">✓ GA</span></div>
                <div className="cm-row"><span className="cm-avatar" style={{background:'#FFE0D0'}}>PN</span><span>Priya N.</span><span>£50</span><span className="tag-sm green">✓ GA</span></div>
                <div className="cm-row"><span className="cm-avatar" style={{background:'#FFE8CC'}}>SP</span><span>Suresh P.</span><span>£200</span><span className="tag-sm green">✓ GA</span></div>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className={`core-panel ${activeTab === 'compliance' ? 'active' : ''}`}>
            <div className="core-left">
              <div className="core-icon">📋</div>
              <h3 className="core-title">Compliance Receipts</h3>
              <p className="core-desc">Submit your charity documents once. Verified within 5 days. Every donation auto-generates a fully compliant tax receipt.</p>
              <a href="#cta-final" className="btn-dark-pill sm">Request a Demo <span className="arrow">→</span></a>
              <div className="core-stats">
                <div className="core-stat"><div className="core-stat-num">6</div><div className="core-stat-label">Countries supported</div></div>
                <div className="core-stat"><div className="core-stat-num">5 days</div><div className="core-stat-label">Verification</div></div>
              </div>
            </div>
            <div className="core-right">
              <div className="core-mockup">
                <div className="cm-header">📋 Compliance Status</div>
                <div className="compliance-verified-card">
                  <span className="cvc-check">✓</span>
                  <span>Gift Aid Verified — HMRC #1234567</span>
                </div>
                <div className="cm-row"><span>🇬🇧</span><span>Gift Aid / HMRC</span><span className="tag-sm green">Active</span></div>
                <div className="cm-row"><span>🇺🇸</span><span>501(c)(3) / IRS</span><span className="tag-sm green">Active</span></div>
                <div className="cm-row"><span>🇦🇺</span><span>DGR / ATO</span><span className="tag-sm green">Active</span></div>
              </div>
            </div>
          </div>

          {/* Panchangam */}
          <div className={`core-panel ${activeTab === 'panchangam' ? 'active' : ''}`}>
            <div className="core-left">
              <div className="core-icon">📅</div>
              <h3 className="core-title">Panchangam</h3>
              <p className="core-desc">Tamil, Telugu, Karnataka and Kerala — four regional traditions displayed on your microsite. Maintained centrally, updated regularly.</p>
              <a href="#cta-final" className="btn-dark-pill sm">Request a Demo <span className="arrow">→</span></a>
              <div className="core-stats">
                <div className="core-stat"><div className="core-stat-num">4</div><div className="core-stat-label">Regional traditions</div></div>
                <div className="core-stat"><div className="core-stat-num">Updated</div><div className="core-stat-label">Regularly</div></div>
              </div>
            </div>
            <div className="core-right">
              <div className="core-mockup">
                <div className="cm-header">📅 Panchangam · Tamil</div>
                <div className="cm-row"><span>Apr 12</span><span>Purnima</span><span className="tag-sm green">✓✓ Auspicious</span></div>
                <div className="cm-row"><span>Apr 14</span><span>Tamil New Year</span><span className="tag-sm green">✓✓ Festival</span></div>
                <div className="cm-row"><span>Apr 18</span><span>Ekadashi</span><span className="tag-sm green">✓ Auspicious</span></div>
              </div>
            </div>
          </div>

          {/* Microsite */}
          <div className={`core-panel ${activeTab === 'microsite' ? 'active' : ''}`}>
            <div className="core-left">
              <div className="core-icon">🌐</div>
              <h3 className="core-title">Temple Microsite</h3>
              <p className="core-desc">Your temple's own website — live in under 10 minutes. Devotees can book poojas, donate and check Panchangam.</p>
              <a href="#cta-final" className="btn-dark-pill sm">Request a Demo <span className="arrow">→</span></a>
              <div className="core-stats">
                <div className="core-stat"><div className="core-stat-num">Live in 10</div><div className="core-stat-label">Minutes</div></div>
                <div className="core-stat"><div className="core-stat-num">Zero</div><div className="core-stat-label">Coding needed</div></div>
              </div>
            </div>
            <div className="core-right">
              <div className="core-mockup">
                <div className="mini-browser-bar"><span className="mini-dots"><i></i><i></i><i></i></span><span className="mini-url">your-temple.omkaarya.com</span></div>
                <div className="mini-browser-body">
                  <div className="mini-site-header">🛕 Your Temple Name</div>
                  <div className="mini-site-sub">Your community's spiritual home</div>
                  <div className="mini-site-cards"><div className="msc">🙏 Book</div><div className="msc">💰 Donate</div><div className="msc">📅 Calendar</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust chips */}
        <div className="trust-chips">
          <div className="trust-chip">
            <div className="trust-chip-icon">🛕</div>
            <div><div className="trust-chip-title">Verified onboarding</div><div className="trust-chip-sub">Every temple reviewed before going live</div></div>
          </div>
          <div className="trust-chip">
            <div className="trust-chip-icon">⏰</div>
            <div><div className="trust-chip-title">Demo in 48 hours</div><div className="trust-chip-sub">Book your preferred time slot after verification</div></div>
          </div>
          <div className="trust-chip">
            <div className="trust-chip-icon">🌍</div>
            <div><div className="trust-chip-title">6 countries</div><div className="trust-chip-sub">Expanding globally wherever temples need us</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
