"use client";

import { useState } from "react";

type CurrencyType = 'USD' | 'GBP' | 'CAD' | 'AUD' | 'SGD' | 'LKR' | 'EUR';

export function PricingTable() {
  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState<CurrencyType>('USD');

  const priceData = {
    USD: { symbol: '$', prices: [20, 49, 99], yearly: [17, 41, 83], setup: ['$49', '$99', '$149'] },
    GBP: { symbol: '£', prices: [16, 39, 78], yearly: [13, 33, 65], setup: ['£39', '£79', '£119'] },
    CAD: { symbol: '$', prices: [27, 67, 135], yearly: [23, 56, 113], setup: ['$67', '$135', '$203'] },
    AUD: { symbol: '$', prices: [31, 76, 153], yearly: [26, 63, 128], setup: ['$76', '$152', '$229'] },
    SGD: { symbol: '$', prices: [27, 67, 134], yearly: [23, 56, 112], setup: ['$67', '$134', '$201'] },
    LKR: { symbol: 'Rs ', prices: [6500, 16000, 32500], yearly: [5417, 13333, 27083], setup: ['Rs 16,000', 'Rs 32,000', 'Rs 48,750'] },
    EUR: { symbol: '€', prices: [19, 45, 91], yearly: [16, 38, 76], setup: ['€45', '€91', '€137'] }
  };

  const data = priceData[currency];

  const savings = [
    (data.prices[0] - data.yearly[0]) * 12,
    (data.prices[1] - data.yearly[1]) * 12,
    (data.prices[2] - data.yearly[2]) * 12,
  ];

  const getPrice = (index: number) => {
    return isYearly ? data.yearly[index].toLocaleString() : data.prices[index].toLocaleString();
  };

  const currencies: { code: CurrencyType; label: string }[] = [
    { code: 'USD', label: '🇺🇸 USD' },
    { code: 'GBP', label: '🇬🇧 GBP' },
    { code: 'CAD', label: '🇨🇦 CAD' },
    { code: 'AUD', label: '🇦🇺 AUD' },
    { code: 'SGD', label: '🇸🇬 SGD' },
    { code: 'LKR', label: '🇱🇰 LKR' },
    { code: 'EUR', label: '🇪🇺 EUR' },
  ];

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        <div className="section-header-center">
          <span className="pill-tag">✦ Seva Plans</span>
          <h2 className="section-h2">Plans built for every size of temple</h2>
          <p className="section-sub center">Every temple is verified before onboarding. Request a demo and we'll recommend the right plan for you.</p>
        </div>

        {/* Toggle */}
        <div className="pricing-toggle-row">
          <span className={`toggle-label ${!isYearly ? 'active-label' : ''}`} id="label-monthly">Monthly</span>
          <button 
            className={`toggle-switch ${isYearly ? 'active' : ''}`} 
            id="billing-toggle" 
            aria-label="Toggle billing period"
            onClick={() => setIsYearly(!isYearly)}
          >
            <span className="toggle-thumb"></span>
          </button>
          <span className={`toggle-label ${isYearly ? 'active-label' : ''}`} id="label-yearly">Yearly</span>
          <span className="free-month-pill">1 month free</span>
        </div>

        {/* Currency switcher */}
        <div className="currency-switcher" id="currency-switcher">
          {currencies.map(c => (
            <button 
              key={c.code}
              className={`currency-chip ${currency === c.code ? 'active' : ''}`} 
              onClick={() => setCurrency(c.code)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="plan-cards" id="plan-cards">
          {/* Prarambha */}
          <div className="plan-card" id="plan-prarambha">
            <div className="plan-body">
              <div className="plan-name-row">
                <span className="plan-name">Prarambha</span>
                <span className="seats-pill">3 seats</span>
              </div>
              <div className="plan-price-row">
                <span className="currency-symbol">{data.symbol}</span>
                <span className="price-number">{getPrice(0)}</span>
                <span className="price-period">/mo</span>
              </div>
              <div className="saving-text">
                {isYearly ? `Save ${data.symbol}${savings[0].toLocaleString()}/yr` : ''}
              </div>
              <div className="setup-fee-row">
                <span>One-time setup fee</span>
                <span className="setup-amount">{data.setup[0]}</span>
              </div>
              <div className="trial-badge"><span>⏱</span> <span className="trial-text">{isYearly ? '30-day' : '14-day'} free trial</span></div>
              <div className="plan-divider"></div>
              <div className="feature-group-label">Core Features</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Devotee management</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Pooja booking (online + manual)</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Donations + basic receipts</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Temple microsite (subdomain)</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Panchangam display</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Standard roles</div>
              <div className="feature-group-label">Advanced</div>
              <div className="feature-row excluded"><span className="fr-icon">—</span> Compliance tax receipts</div>
              <div className="feature-row excluded"><span className="fr-icon">—</span> Full microsite + SEO</div>
              <div className="feature-row excluded"><span className="fr-icon">—</span> Advanced analytics</div>
              <div className="feature-row excluded"><span className="fr-icon">—</span> Custom domain</div>
              <div className="limits-row">
                <span>500 devotees</span>
                <span>1 admin</span>
                <span>5GB storage</span>
              </div>
              <button className="plan-cta-btn">Request this plan →</button>
            </div>
          </div>

          {/* Sankalpa */}
          <div className="plan-card popular" id="plan-sankalpa">
            <div className="popular-bar">⭐ Most Popular</div>
            <div className="plan-body">
              <div className="plan-name-row">
                <span className="plan-name popular-name">Sankalpa</span>
                <span className="seats-pill">5 seats</span>
              </div>
              <div className="plan-price-row">
                <span className="currency-symbol">{data.symbol}</span>
                <span className="price-number">{getPrice(1)}</span>
                <span className="price-period">/mo</span>
              </div>
              <div className="saving-text">
                {isYearly ? `Save ${data.symbol}${savings[1].toLocaleString()}/yr` : ''}
              </div>
              <div className="setup-fee-row">
                <span>One-time setup fee</span>
                <span className="setup-amount">{data.setup[1]}</span>
              </div>
              <div className="trial-badge"><span>⏱</span> <span className="trial-text">{isYearly ? '30-day' : '14-day'} free trial</span></div>
              <div className="plan-divider"></div>
              <div className="feature-group-label">Core Features</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Devotee management</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Pooja booking (online + manual)</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Donations + basic receipts</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Temple microsite (subdomain)</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Panchangam display</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Standard roles</div>
              <div className="feature-group-label">Advanced</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Compliance tax receipts</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Full microsite + SEO branding</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Inventory management</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Extended roles</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Priority support</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Advanced analytics</div>
              <div className="feature-row excluded"><span className="fr-icon">—</span> Custom domain</div>
              <div className="limits-row">
                <span>5,000 devotees</span>
                <span>3 admins</span>
                <span>20GB storage</span>
              </div>
              <button className="plan-cta-btn">Request this plan →</button>
            </div>
          </div>

          {/* Aaradhana */}
          <div className="plan-card" id="plan-aaradhana">
            <div className="plan-body">
              <div className="plan-name-row">
                <span className="plan-name">Aaradhana</span>
                <span className="seats-pill">10 seats</span>
              </div>
              <div className="plan-price-row">
                <span className="currency-symbol aaradhana-price">{data.symbol}</span>
                <span className="price-number aaradhana-price">{getPrice(2)}</span>
                <span className="price-period">/mo</span>
              </div>
              <div className="saving-text">
                {isYearly ? `Save ${data.symbol}${savings[2].toLocaleString()}/yr` : ''}
              </div>
              <div className="setup-fee-row">
                <span>One-time setup fee</span>
                <span className="setup-amount">{data.setup[2]}</span>
              </div>
              <div className="trial-badge"><span>⏱</span> <span className="trial-text">{isYearly ? '30-day' : '14-day'} free trial</span></div>
              <div className="plan-divider"></div>
              <div className="feature-group-label">Core Features</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Devotee management</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Pooja booking (online + manual)</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Donations + basic receipts</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Temple microsite (subdomain)</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Panchangam display</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Standard roles</div>
              <div className="feature-group-label">Advanced</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Compliance tax receipts</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Full microsite + SEO branding</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Inventory management</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Custom roles</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Dedicated onboarding support</div>
              <div className="feature-row included"><span className="fr-icon">✓</span> Advanced analytics</div>
              <div className="feature-row excluded"><span className="fr-icon">—</span> Custom domain</div>
              <div className="limits-row">
                <span>5,000 devotees</span>
                <span>10 admins</span>
                <span>20GB storage</span>
              </div>
              <button className="plan-cta-btn aaradhana-cta">Request this plan →</button>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="pricing-note">Base currency USD · Switch currency above · Setup fee covers demo, onboarding and account creation · Additional seats billed monthly</p>
      </div>
    </section>
  );
}
