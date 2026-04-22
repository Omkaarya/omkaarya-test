# Business Requirements Document (BRD)
## Omkaarya — Temple Management SaaS Platform

| Field | Details |
|-------|---------|
| **Document version** | 2.0 |
| **Date** | 22 April 2026 |
| **Author** | Product & BA Team |
| **Status** | Living document — updated as features ship |

---

## 1. Executive Summary

Omkaarya is a **multi-tenant SaaS platform** purpose-built for temple management, provided by **Pepulux**. It enables temples of all sizes to digitise their operations — from devotee management and pooja booking to donations, finance, inventory, subscriptions and compliance. The platform is accessed through two portals:

1. **Super Admin Portal** — platform-wide management by Pepulux operators  
2. **Temple Admin Portal** — individual tenant dashboard for temple administrators

---

## 2. Business Objectives

| # | Objective | Priority |
|---|-----------|----------|
| BO-01 | Provide a turnkey digital platform for temples covering devotee ops, finance, inventory and POS | P0 |
| BO-02 | Enable tiered pricing (Prarambha / Sankalpa / Aaradhana) with plan-based feature gating | P0 |
| BO-03 | Ensure regulatory compliance for donation receipts (UK Gift Aid, CRA, EU rules) | P0 |
| BO-04 | Centralise subscription lifecycle management (plans, invoices, payments, activations) | P0 |
| BO-05 | Allow super admins to manage features dynamically without frontend code changes | P1 |
| BO-06 | Provide a whitelabel-ready microsite for each temple with optional custom domain | P1 |
| BO-07 | Offer point-of-sale (POS) for prasad counters and devotional item sales | P2 |

---

## 3. Stakeholders

| Role | Responsibility |
|------|----------------|
| **Pepulux Ops (Super Admin)** | Platform config, temple onboarding, pricing plans, subscriptions, feature registry |
| **Temple Administrator** | Day-to-day temple operations: pooja, donations, devotees, finance, inventory |
| **Devotee** | (Future) Self-service pooja booking, donation, receipt downloads via microsite |
| **Accountant / Trustee** | Finance reports, compliance receipts, audit trail |

---

## 4. Product Scope

### 4.1 Super Admin Portal — Screens Delivered

| # | Module | Screen | Status |
|---|--------|--------|--------|
| SA-01 | Dashboard | Super Admin Dashboard | ✅ Shipped |
| SA-02 | Temples | Temple list + onboarding | ✅ Shipped |
| SA-03 | Subscriptions | Subscription list, verification modal, invoice modal, actions dropdown | ✅ Shipped |
| SA-04 | Pricing Plans | Plan cards (Prarambha/Sankalpa/Aaradhana), Monthly/Yearly toggle, feature comparison matrix, temple analytics | ✅ Shipped |
| SA-05 | Feature Registry | L1/L2 hierarchy, stat cards, info banner, inline edit, quick add, module edit, filters, expand/collapse | ✅ Shipped |
| SA-06 | Plan Feature Config | Per-plan toggle + limits for each feature | ✅ Shipped |
| SA-07 | Domains | Domain management | ✅ Shipped |
| SA-08 | Users | User management | ✅ Shipped |
| SA-09 | Role & Permissions | RBAC configuration | ✅ Shipped |
| SA-10 | Delete Account Requests | Account deletion workflow | ✅ Shipped |
| SA-11 | System Settings | Feature Registry link | ✅ Shipped |

### 4.2 Temple Admin Portal — Screens Delivered

| # | Module | Screen | Status |
|---|--------|--------|--------|
| TA-01 | Dashboard | Temple dashboard with stats | ✅ Shipped |
| TA-02 | Inventory | Product list, create product, product detail | ✅ Shipped |
| TA-03 | Purchase Orders | Purchase order list + management | ✅ Shipped |
| TA-04 | Finance | Dashboard, transactions list, add transaction, category breakdown | ✅ Shipped |
| TA-05 | Donations | Donation list + recording | ✅ Shipped |
| TA-06 | Invoices | Invoice generation + preview | ✅ Shipped |
| TA-07 | Receipts | Receipt generation + PDF preview | ✅ Shipped |
| TA-08 | Reports | Report generation | ✅ Shipped |
| TA-09 | Subscriptions | Current plan, upgrade, billing history | ✅ Shipped |
| TA-10 | Feature Gate | FeatureGate component, LimitReachedBanner | ✅ Shipped |
| TA-11 | Settings | Settings Secondary Layout Wrapper (`layout.tsx`) | ✅ Shipped |
| TA-12 | Settings | General Settings (Logo, info, localization) | ✅ Shipped |
| TA-13 | Settings | Web Settings (Domain mapping, SEO, Social) | ✅ Shipped |
| TA-14 | Settings | Invoice & Receipts (Prefix formatting, Terms/Toggles) | ✅ Shipped |
| TA-15 | Settings | POS & Printers (Hardware mapping, cash drawer rules) | ✅ Shipped |
| TA-16 | Settings | System Configuration (Email gateways, DB Taxes, Inventory globals) | ✅ Shipped |

---

## 5. Pricing Plans

| Plan | Monthly | Yearly | Seats | Target |
|------|---------|--------|-------|--------|
| **Prarambha** (Basic) | $19 | $157 | 3 | Small temples starting digital management |
| **Sankalpa** (Business) | $49 | $539 | 5 | Growing temples needing compliance + advanced features |
| **Aaradhana** (Enterprise) | $99 | $1,089 | 10 | Established temples wanting full control |

---

## 6. Feature Registry (System-Driven)

Features are defined in a **centralised Feature Registry** and configured per pricing plan. The system uses an L1 (Module) → L2 (Feature) hierarchy:

| Module (L1) | Features (L2) |
|-------------|---------------|
| Devotee Management | devotee_management, devotee_communication |
| Pooja Management | pooja_booking_online, pooja_booking_manual, archana_ticket_printing |
| Donations Management | donation_basic_receipts, donation_compliance_receipts |
| Inventory Management | inventory_management |
| Finance Module | finance_management |
| POS — Counter Sales | pos_counter_sales |
| System & Site Features | temple_microsite, custom_domain, seo_branding, advanced_analytics |
| Temple Settings | settings_organization, settings_hardware, settings_notifications, settings_finance_inventory |

**Key rules:**
- Feature keys are **immutable** after creation
- Features can be **deactivated** (never deleted)
- Each feature has: limit type (none/boolean/number), plan visibility flag, active status
- Tenant-side access is enforced via `FeatureGate` component and sidebar filtering

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Multi-tenancy | Full data isolation per temple |
| Availability | 99.5% uptime SLA |
| Performance | Page load < 2s, API response < 500ms |
| Security | RBAC, session management, input sanitisation |
| Compliance | GDPR-aware, Gift Aid compliant receipts |
| Accessibility | WCAG 2.1 AA (target) |
| Browser Support | Chrome, Firefox, Safari, Edge (latest 2 versions) |

---

## 8. Assumptions & Constraints

1. Each temple is a single tenant with isolated data
2. Pepulux super admins manage platform configuration
3. Payment processing is handled externally (integration planned)
4. Initial launch targets UK-based temples with plans for India, Canada, EU expansion
5. Design system is Pepulux DS (Plus Jakarta Sans, semantic tokens)

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Temple onboarding time | < 30 minutes |
| Feature configuration time | < 5 minutes per plan |
| Monthly active temples | 100+ within 6 months |
| Subscription churn rate | < 5% monthly |
