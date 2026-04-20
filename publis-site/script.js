/* ═══════════════════════════════════════════════════
   OMKAARYA — Interactive JavaScript
   ═══════════════════════════════════════════════════ */

// ─── Dashboard Sidebar Navigation ─────────────────
document.addEventListener('DOMContentLoaded', () => {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const screens = document.querySelectorAll('.screen');
  const urlText = document.getElementById('url-text');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      // Update active sidebar
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Show corresponding screen
      const screenId = item.dataset.screen;
      screens.forEach(s => s.classList.remove('active'));
      const target = document.getElementById(`screen-${screenId}`);
      if (target) target.classList.add('active');

      // Update URL bar
      if (urlText && item.dataset.url) {
        urlText.textContent = item.dataset.url;
      }
    });
  });

  // ─── Core Features Tabs ───────────────────────────
  const coreTabs = document.querySelectorAll('.core-tab');
  const corePanels = document.querySelectorAll('.core-panel');

  coreTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      coreTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const panelId = tab.dataset.tab;
      corePanels.forEach(p => p.classList.remove('active'));
      const panel = document.querySelector(`.core-panel[data-panel="${panelId}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  // ─── Pricing Toggle ────────────────────────────────
  const billingToggle = document.getElementById('billing-toggle');
  const labelMonthly = document.getElementById('label-monthly');
  const labelYearly = document.getElementById('label-yearly');
  let isYearly = false;

  if (billingToggle) {
    // Set initial state
    updateBillingLabels();

    billingToggle.addEventListener('click', () => {
      isYearly = !isYearly;
      billingToggle.classList.toggle('active', isYearly);
      updateBillingLabels();
      updatePrices();
    });
  }

  function updateBillingLabels() {
    if (labelMonthly) {
      labelMonthly.classList.toggle('active-label', !isYearly);
    }
    if (labelYearly) {
      labelYearly.classList.toggle('active-label', isYearly);
    }
  }

  // ─── Currency Switcher ─────────────────────────────
  const currencyChips = document.querySelectorAll('.currency-chip');
  let currentCurrency = 'USD';

  const priceData = {
    USD: { symbol: '$', prices: [20, 49, 99], yearly: [17, 41, 83], setup: ['$49', '$99', '$149'] },
    GBP: { symbol: '£', prices: [16, 39, 78], yearly: [13, 33, 65], setup: ['£39', '£79', '£119'] },
    CAD: { symbol: '$', prices: [27, 67, 135], yearly: [23, 56, 113], setup: ['$67', '$135', '$203'] },
    AUD: { symbol: '$', prices: [31, 76, 153], yearly: [26, 63, 128], setup: ['$76', '$152', '$229'] },
    SGD: { symbol: '$', prices: [27, 67, 134], yearly: [23, 56, 112], setup: ['$67', '$134', '$201'] },
    LKR: { symbol: 'Rs ', prices: [6500, 16000, 32500], yearly: [5417, 13333, 27083], setup: ['Rs 16,000', 'Rs 32,000', 'Rs 48,750'] },
    EUR: { symbol: '€', prices: [19, 45, 91], yearly: [16, 38, 76], setup: ['€45', '€91', '€137'] }
  };

  currencyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      currencyChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCurrency = chip.dataset.currency;
      updatePrices();
    });
  });

  function updatePrices() {
    const data = priceData[currentCurrency];
    if (!data) return;

    const priceNumbers = document.querySelectorAll('.price-number');
    const currencySymbols = document.querySelectorAll('[data-currency-symbol]');
    const setupAmounts = document.querySelectorAll('[data-setup]');
    const savingTexts = document.querySelectorAll('[data-saving]');
    const trialTexts = document.querySelectorAll('.trial-text');

    currencySymbols.forEach(el => {
      el.textContent = data.symbol;
    });

    priceNumbers.forEach((el, i) => {
      const prices = isYearly ? data.yearly : data.prices;
      if (prices[i] !== undefined) {
        el.textContent = prices[i].toLocaleString();
      }
    });

    setupAmounts.forEach((el, i) => {
      if (data.setup[i]) {
        el.textContent = data.setup[i];
      }
    });

    savingTexts.forEach(el => {
      if (isYearly) {
        el.textContent = el.dataset.saving;
      } else {
        el.textContent = '';
      }
    });

    trialTexts.forEach(el => {
      el.textContent = isYearly ? '30-day free trial' : '14-day free trial';
    });
  }

  // ─── Nav Active State on Scroll ────────────────────
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#hero' && (current === 'hero' || current === '')) {
        link.classList.add('active');
      } else if (href === '#features-bento' && (current === 'features-bento' || current === 'feature-strip')) {
        link.classList.add('active');
      } else if (href === '#how-to-join' && current === 'how-to-join') {
        link.classList.add('active');
      } else if (href === '#pricing' && current === 'pricing') {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // ─── Smooth scroll for nav links ──────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── Intersection Observer for animations ─────────
  const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.bento-card, .step-card, .trust-chip, .resource-card, .ccc, .cs').forEach(el => {
    el.classList.add('animate-target');
    animateOnScroll.observe(el);
  });
});

// ─── FAQ Toggle ──────────────────────────────────────
function toggleFaq(id) {
  const item = document.getElementById(id);
  if (!item) return;

  const isOpen = item.classList.contains('open');

  // Close ALL open FAQ items first
  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    openItem.classList.remove('open');
    const t = openItem.querySelector('.faq-toggle');
    if (t) t.textContent = '+';
  });

  // If the clicked item was closed, open it
  if (!isOpen) {
    item.classList.add('open');
    const toggle = item.querySelector('.faq-toggle');
    if (toggle) toggle.textContent = '×';
  }
}
