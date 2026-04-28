"use client";

import { useState } from "react";

export function DashboardMockup() {
  const [activeScreen, setActiveScreen] = useState("dashboard");

  const screens: Record<string, string> = {
    dashboard: "shiva-mandir-london.omkaarya.com/admin · Dashboard",
    devotees: "shiva-mandir-london.omkaarya.com/admin · Devotees",
    pooja: "shiva-mandir-london.omkaarya.com/admin · Pooja Booking",
    donations: "shiva-mandir-london.omkaarya.com/admin · Donations",
    panchangam: "shiva-mandir-london.omkaarya.com/admin · Panchangam",
    microsite: "shiva-mandir-london.omkaarya.com/admin · Microsite",
    compliance: "shiva-mandir-london.omkaarya.com/admin · Compliance",
  };

  return (
    <div className="hero-dashboard" id="hero-dashboard">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <div className="topbar-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="topbar-url" id="topbar-url">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span id="url-text">{screens[activeScreen]}</span>
        </div>
        <div className="topbar-live">
          <span className="live-dot"></span> Live demo
        </div>
      </div>

      {/* Dashboard body */}
      <div className="dashboard-body">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-temple">
            <div className="sidebar-temple-icon">🛕</div>
            <div>
              <div className="sidebar-temple-name">Shiva Mandir</div>
              <div className="sidebar-temple-meta">London · Aaradhana plan</div>
            </div>
          </div>
          <div className="sidebar-nav">
            <button className={`sidebar-item ${activeScreen === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveScreen('dashboard')}>
              <span className="sidebar-icon">📊</span> Dashboard
            </button>
            <button className={`sidebar-item ${activeScreen === 'devotees' ? 'active' : ''}`} onClick={() => setActiveScreen('devotees')}>
              <span className="sidebar-icon">👥</span> Devotees
            </button>
            <button className={`sidebar-item ${activeScreen === 'pooja' ? 'active' : ''}`} onClick={() => setActiveScreen('pooja')}>
              <span className="sidebar-icon">🙏</span> Pooja booking
            </button>
            <button className={`sidebar-item ${activeScreen === 'donations' ? 'active' : ''}`} onClick={() => setActiveScreen('donations')}>
              <span className="sidebar-icon">💰</span> Donations
            </button>
            <button className={`sidebar-item ${activeScreen === 'panchangam' ? 'active' : ''}`} onClick={() => setActiveScreen('panchangam')}>
              <span className="sidebar-icon">📅</span> Panchangam
            </button>
            <button className={`sidebar-item ${activeScreen === 'microsite' ? 'active' : ''}`} onClick={() => setActiveScreen('microsite')}>
              <span className="sidebar-icon">🌐</span> Microsite
            </button>
            <button className={`sidebar-item ${activeScreen === 'compliance' ? 'active' : ''}`} onClick={() => setActiveScreen('compliance')}>
              <span className="sidebar-icon">📋</span> Compliance
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="dashboard-main">
          {/* Screen: Dashboard */}
          {activeScreen === 'dashboard' && (
            <div className="screen active" id="screen-dashboard">
              <div className="screen-header">
                <h3>Dashboard Overview</h3>
                <span className="screen-badge gift-aid-badge">🇬🇧 Gift Aid Active</span>
              </div>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-number">1,240</div>
                  <div className="stat-label">Total Devotees</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">£4,820</div>
                  <div className="stat-label">This Month</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">47</div>
                  <div className="stat-label">Donations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">18</div>
                  <div className="stat-label">Poojas Booked</div>
                </div>
              </div>
              <div className="mini-tables">
                <div className="mini-table">
                  <div className="mini-table-title">Upcoming Poojas</div>
                  <div className="mini-row"><span>Ganesh Pooja</span><span className="tag-sm green">Tomorrow</span></div>
                  <div className="mini-row"><span>Abhishekam</span><span className="tag-sm">Apr 12</span></div>
                  <div className="mini-row"><span>Lakshmi Pooja</span><span className="tag-sm">Apr 15</span></div>
                </div>
                <div className="mini-table">
                  <div className="mini-table-title">Recent Donations</div>
                  <div className="mini-row"><span>Ramesh K.</span><span>£125.00</span></div>
                  <div className="mini-row"><span>Priya N.</span><span>£50.00</span></div>
                  <div className="mini-row"><span>Suresh P.</span><span>£200.00</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Screen: Devotees */}
          {activeScreen === 'devotees' && (
            <div className="screen active" id="screen-devotees">
              <div className="screen-header"><h3>Devotees</h3><span className="screen-count">1,240 total</span></div>
              <div className="search-bar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><span>Search devotees...</span></div>
              <div className="data-table">
                <div className="table-header"><span>Name</span><span>Email</span><span>Donated</span><span>Last Visit</span><span>Status</span></div>
                <div className="table-row"><span>Ramesh Kumar</span><span>ramesh@email.com</span><span>£1,250</span><span>Apr 8</span><span className="tag-sm green">Active</span></div>
                <div className="table-row"><span>Priya Nair</span><span>priya@email.com</span><span>£840</span><span>Apr 7</span><span className="tag-sm green">Active</span></div>
                <div className="table-row"><span>Suresh Pillai</span><span>suresh@email.com</span><span>£2,100</span><span>Apr 5</span><span className="tag-sm green">Active</span></div>
                <div className="table-row"><span>Lakshmi Reddy</span><span>lakshmi@email.com</span><span>£560</span><span>Mar 28</span><span className="tag-sm yellow">Inactive</span></div>
                <div className="table-row"><span>Vijay Sharma</span><span>vijay@email.com</span><span>£320</span><span>Mar 15</span><span className="tag-sm yellow">Inactive</span></div>
              </div>
            </div>
          )}

          {/* Screen: Pooja Booking */}
          {activeScreen === 'pooja' && (
            <div className="screen active" id="screen-pooja">
              <div className="screen-header"><h3>Pooja Booking</h3><span className="screen-count">18 this month</span></div>
              <div className="pooja-grid">
                <div className="pooja-card">
                  <div className="pooja-name">🙏 Ganesh Pooja</div>
                  <div className="pooja-date">Apr 10, 2026 · 9:00 AM</div>
                  <div className="pooja-price">£21.00</div>
                  <span className="tag-sm green">Confirmed</span>
                </div>
                <div className="pooja-card">
                  <div className="pooja-name">🙏 Abhishekam</div>
                  <div className="pooja-date">Apr 12, 2026 · 10:30 AM</div>
                  <div className="pooja-price">£31.00</div>
                  <span className="tag-sm green">Confirmed</span>
                </div>
                <div className="pooja-card">
                  <div className="pooja-name">🙏 Lakshmi Pooja</div>
                  <div className="pooja-date">Apr 15, 2026 · 6:00 PM</div>
                  <div className="pooja-price">£25.00</div>
                  <span className="tag-sm yellow">Pending</span>
                </div>
                <div className="pooja-card">
                  <div className="pooja-name">🙏 Satyanarayana</div>
                  <div className="pooja-date">Apr 18, 2026 · 11:00 AM</div>
                  <div className="pooja-price">£51.00</div>
                  <span className="tag-sm green">Confirmed</span>
                </div>
                <div className="pooja-card">
                  <div className="pooja-name">🙏 Navagraha Pooja</div>
                  <div className="pooja-date">Apr 20, 2026 · 7:00 AM</div>
                  <div className="pooja-price">£35.00</div>
                  <span className="tag-sm yellow">Pending</span>
                </div>
                <div className="pooja-card">
                  <div className="pooja-name">🙏 Rudra Abhishekam</div>
                  <div className="pooja-date">Apr 22, 2026 · 8:00 AM</div>
                  <div className="pooja-price">£45.00</div>
                  <span className="tag-sm green">Confirmed</span>
                </div>
              </div>
            </div>
          )}

          {/* Screen: Donations */}
          {activeScreen === 'donations' && (
            <div className="screen active" id="screen-donations">
              <div className="screen-header"><h3>Donations</h3><span className="screen-badge gift-aid-badge">🇬🇧 Gift Aid Active</span></div>
              <div className="stat-cards">
                <div className="stat-card"><div className="stat-number">£4,820</div><div className="stat-label">This Month</div></div>
                <div className="stat-card"><div className="stat-number">47</div><div className="stat-label">Donations</div></div>
                <div className="stat-card"><div className="stat-number">£1,205</div><div className="stat-label">Gift Aid Top-up</div></div>
              </div>
              <div className="data-table" style={{marginTop: '12px'}}>
                <div className="table-header"><span>Donor</span><span>Amount</span><span>Date</span><span>Gift Aid</span></div>
                <div className="table-row"><span>Ramesh Kumar</span><span>£125.00</span><span>Apr 8</span><span className="tag-sm green">✓ Claimed</span></div>
                <div className="table-row"><span>Priya Nair</span><span>£50.00</span><span>Apr 7</span><span className="tag-sm green">✓ Claimed</span></div>
                <div className="table-row"><span>Suresh Pillai</span><span>£200.00</span><span>Apr 6</span><span className="tag-sm green">✓ Claimed</span></div>
                <div className="table-row"><span>Anita Patel</span><span>£75.00</span><span>Apr 5</span><span className="tag-sm yellow">Pending</span></div>
              </div>
            </div>
          )}

          {/* Screen: Panchangam */}
          {activeScreen === 'panchangam' && (
            <div className="screen active" id="screen-panchangam">
              <div className="screen-header"><h3>Panchangam</h3></div>
              <div className="panchangam-tabs">
                <button className="panchangam-tab active">Tamil</button>
                <button className="panchangam-tab">Telugu</button>
                <button className="panchangam-tab">Karnataka</button>
                <button className="panchangam-tab">Kerala</button>
              </div>
              <div className="data-table" style={{marginTop: '10px'}}>
                <div className="table-header"><span>Date</span><span>Tithi</span><span>Nakshatra</span><span>Auspicious</span></div>
                <div className="table-row"><span>Apr 9</span><span>Dvadashi</span><span>Uttara Phalguni</span><span className="tag-sm green">✓</span></div>
                <div className="table-row"><span>Apr 10</span><span>Trayodashi</span><span>Hasta</span><span className="tag-sm">—</span></div>
                <div className="table-row"><span>Apr 11</span><span>Chaturdashi</span><span>Chitra</span><span className="tag-sm green">✓</span></div>
                <div className="table-row"><span>Apr 12</span><span>Purnima</span><span>Swati</span><span className="tag-sm green">✓✓</span></div>
                <div className="table-row"><span>Apr 13</span><span>Pratipada</span><span>Vishakha</span><span className="tag-sm">—</span></div>
              </div>
            </div>
          )}

          {/* Screen: Microsite */}
          {activeScreen === 'microsite' && (
            <div className="screen active" id="screen-microsite">
              <div className="screen-header"><h3>Temple Microsite</h3><span className="tag-sm green">Live</span></div>
              <div className="microsite-preview">
                <div className="microsite-settings">
                  <div className="setting-row"><span className="setting-label">Subdomain</span><span className="setting-value">shiva-mandir-london.omkaarya.com</span></div>
                  <div className="setting-row"><span className="setting-label">Theme</span><span className="setting-value">Warm Saffron</span></div>
                  <div className="setting-row"><span className="setting-label">Panchangam</span><span className="setting-value">Tamil tradition</span></div>
                  <div className="setting-row"><span className="setting-label">Online Booking</span><span className="tag-sm green">Enabled</span></div>
                  <div className="setting-row"><span className="setting-label">Online Donations</span><span className="tag-sm green">Enabled</span></div>
                </div>
                <div className="microsite-live">
                  <div className="microsite-live-header">
                    <div className="mlh-title">🛕 Shiva Mandir London</div>
                    <div className="mlh-sub">Serving the Hindu community since 1998</div>
                  </div>
                  <div className="microsite-live-body">
                    <div className="mlb-card">🙏 Book a Pooja</div>
                    <div className="mlb-card">💰 Donate Online</div>
                    <div className="mlb-card">📅 Panchangam</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Screen: Compliance */}
          {activeScreen === 'compliance' && (
            <div className="screen active" id="screen-compliance">
              <div className="screen-header"><h3>Compliance</h3><span className="tag-sm green">✓ Verified</span></div>
              <div className="compliance-content">
                <div className="compliance-status">
                  <div className="compliance-status-icon">✓</div>
                  <div className="compliance-status-text">Your temple is verified and compliant with local tax regulations.</div>
                </div>
                <div className="data-table" style={{marginTop: '16px'}}>
                  <div className="table-header"><span>Document</span><span>Status</span></div>
                  <div className="table-row"><span>Charity Registration</span><span className="tag-sm green">Verified</span></div>
                  <div className="table-row"><span>Gift Aid Declaration</span><span className="tag-sm green">Active</span></div>
                  <div className="table-row"><span>KYC / Trustee Info</span><span className="tag-sm green">Verified</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
