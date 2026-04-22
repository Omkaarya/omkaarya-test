# Software Requirements Specification (SRS)
## Omkaarya — Temple Management SaaS Platform

| Field | Details |
|-------|---------|
| **Document version** | 2.0 |
| **Date** | 22 April 2026 |
| **Author** | Engineering Team |
| **Status** | Living document |

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the functional and technical requirements for the Omkaarya platform — a multi-tenant temple management SaaS built with Next.js, PostgreSQL, and the Pepulux Design System.

### 1.2 Scope
The system comprises two web portals:
- **Super Admin Portal** (`/super-admin/*`) — Pepulux platform operations
- **Temple Admin Portal** (`/temple-admin/*`) — Per-tenant operations

### 1.3 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Pepulux Design Tokens |
| Database | PostgreSQL (pg pool) |
| Authentication | Session-based (planned: NextAuth) |
| Hosting | Vercel (planned) |
| Design System | Pepulux DS (Plus Jakarta Sans, semantic color tokens) |

---

## 2. Functional Requirements

### 2.1 Super Admin Portal

#### FR-SA-01: Dashboard
- Display platform-wide statistics (total temples, active subscriptions, revenue)
- Quick-access cards to key operations

#### FR-SA-02: Temple Management
- **List** all onboarded temples with search/filter
- **Onboard** new temples with basic information
- **View** individual temple details and configuration

#### FR-SA-03: Subscription Management
- **List** all subscriptions with status filtering (Active, Pending, Expired, Cancelled)
- **Verify** subscription activations via modal workflow
- **Generate** and preview invoices
- **Actions dropdown**: Activate, Suspend, Cancel, View Invoice
- Status badge rendering (Active=green, Pending=amber, Expired=red)

#### FR-SA-04: Pricing Plans
- **Display** 3 plan cards (Prarambha, Sankalpa, Aaradhana) with prices
- **Monthly/Yearly toggle** at header level — resets all card toggles
- **Per-card billing toggle** — individual override; when all cards match, global tab syncs
- **Feature comparison matrix** — toggleable per feature per plan
- **Included seats + Extra seat** cost rows
- **Temple Analytics** — bar chart showing plan distribution
- **Edit Plan** button linking to `/pricing-plans/[planId]/features`

#### FR-SA-05: Feature Registry
- **L1/L2 hierarchy**: Modules (L1) containing Features (L2)
- **Stat cards**: Total modules, features, active features, pricing plans
- **Info banner**: Explains L1=Module, L2=Feature architecture
- **Add Feature panel**: Module selection, name, auto-generated key, description, limit type, plan visibility
- **Add Module panel**: Name, key, description
- **Toolbar**: Search (name/key), module filter, limit type filter, status filter, expand/collapse all
- **L1 row**: Module name, feature count, module key pill, edit/add actions
- **L2 row**: Feature name+key, module key, limit type pill, plan config visibility, active toggle, plan dots (3), edit/delete actions
- **Inline edit**: L1 module edit panel, L2 feature edit row
- **Quick add**: Per-module inline add feature row
- **Constraints**: Feature keys are immutable; features can be deactivated, not deleted (if used in plans)

#### FR-SA-06: Plan Feature Configuration
- **Per-plan view**: Toggle features on/off for a specific plan
- **Limit values**: Set numeric limits for features with `limitType=number`
- **Grouped by module**: Features grouped by their module key
- **Enable All / Save Configuration** actions

#### FR-SA-07: User Management
- User list with role assignments
- Role & Permissions configuration (RBAC)
- Delete Account Requests workflow

#### FR-SA-08: Domain Management
- Custom domain configuration per temple
- DNS verification status

---

### 2.2 Temple Admin Portal

#### FR-TA-01: Dashboard
- Temple-specific statistics (devotees, bookings, revenue)
- Quick-access navigation to all modules

#### FR-TA-02: Inventory Management
- **Product list**: Table with search, filter by category, sort by columns
- **Create product**: Form with name, SKU, category, unit price, stock, description, images
- **Product detail**: View/edit individual product with stock history
- **Purchase orders**: List, create, track purchase orders

#### FR-TA-03: Finance Module
- **Dashboard**: Revenue summary, income vs expense chart, category breakdown
- **Transactions**: Table with date range filter, type filter (Income/Expense/Donation), search
- **Add transaction**: Form with type, amount, category, description, date, payment method
- **Category breakdown**: Visual pie chart of expense/income categories

#### FR-TA-04: Donations
- **Donation list**: Table with donor search, type filter, date range
- **Record donation**: Form with donor info, amount, purpose, payment method
- **Basic receipts**: Auto-generated receipt for each donation
- **Compliance tax receipts**: Gift Aid / CRA / EU-compliant (Sankalpa+ plans)

#### FR-TA-05: Invoice Generation
- **Generate invoice**: Form with line items, tax calculation, temple branding
- **Preview**: Modal preview with print-ready layout
- **PDF generation**: Downloadable invoice PDF

#### FR-TA-06: Receipt Management
- **Generate receipt**: Donation-linked receipt generation
- **Preview**: Branded receipt with temple logo, QR code, compliance info
- **Print/Download**: PDF-ready receipts

#### FR-TA-07: Reports
- Revenue reports by period
- Donation reports by category
- Inventory valuation reports
- Export to CSV/PDF

#### FR-TA-08: Subscription Management (Tenant Side)
- View current plan details
- Upgrade/downgrade plan
- Billing history and invoice downloads

#### FR-TA-09: Feature Access Control
- **FeatureGate component**: Wraps routes/sections; shows "Upgrade Required" for gated features
- **LimitReachedBanner**: Displays when usage limit is reached (e.g. "3/3 users")
- **Sidebar filtering**: Navigation items with `moduleKey` property; disabled modules show lock icon overlay
- **disabledModules prop**: TempleDashboardShell accepts array of disabled module keys
- **Backward compatibility**: If no configuration exists, all features default to enabled

---

## 3. Data Models

### 3.1 Features Table
```sql
CREATE TABLE features (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  key           VARCHAR(255) UNIQUE NOT NULL,
  module_key    VARCHAR(100) NOT NULL,
  description   TEXT,
  has_limit     BOOLEAN DEFAULT FALSE,
  limit_type    VARCHAR(50),
  is_active     BOOLEAN DEFAULT TRUE,
  is_visible_in_plan_config BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### 3.2 Plan Features Table
```sql
CREATE TABLE plan_features (
  id          SERIAL PRIMARY KEY,
  plan_id     VARCHAR(100) NOT NULL,
  feature_id  INTEGER REFERENCES features(id),
  is_enabled  BOOLEAN DEFAULT FALSE,
  limit_value INTEGER,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(plan_id, feature_id)
);
```

### 3.3 Feature-Module Mapping
Static mapping in `lib/feature-module-map.ts` linking sidebar navigation `moduleKey` values to database feature keys for runtime access control.

---

## 4. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/features` | List all features |
| POST | `/api/features` | Create a new feature |
| PUT | `/api/features/[id]` | Update feature details |
| PATCH | `/api/features/[id]` | Toggle feature active state |
| GET | `/api/plan-features?planId=X` | Get features for a plan |
| POST | `/api/plan-features` | Save plan feature configuration |
| GET | `/api/tenant-features?tenantId=X` | Get tenant's effective features |

---

## 5. Component Architecture

### 5.1 Shared Shell Components
- `AdminDashboardShell` — Super admin layout with collapsible sidebar sections
- `TempleDashboardShell` — Temple admin layout with `disabledModules` support

### 5.2 Access Control Components
- `FeatureGate` — Route wrapper; checks feature access, renders "Upgrade Required" fallback
- `LimitReachedBanner` — Usage limit indicator with upgrade CTA

### 5.3 Design System
- Pepulux DS tokens (`--brand-primary`, `--brand-primary-hover`, etc.)
- Plus Jakarta Sans typography
- Consistent card/table patterns across both portals

---

## 6. Routing Structure

### Super Admin Routes
```
/super-admin/
├── dashboard
├── temples
├── subscriptions/
│   ├── list
│   └── [id]
├── pricing-plans/
│   └── [planId]/features
├── system-settings/
│   └── feature-registry
├── domains
├── users
├── role-permissions
└── delete-account-requests
```

### Temple Admin Routes
```
/temple-admin/
├── dashboard
├── inventory/
│   ├── products
│   ├── products/new
│   └── purchase-orders
├── finance/
│   ├── dashboard
│   ├── transactions
│   └── transactions/new
├── donations
├── invoices
├── receipts
├── reports
└── subscriptions
```

---

## 7. Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| SR-01: Authentication | Session-based, cookie-secured |
| SR-02: Authorization | RBAC with role-based page access |
| SR-03: Feature gating | Server-side check via `tenant-features` API |
| SR-04: Input validation | Server-side + client-side form validation |
| SR-05: CSRF protection | Next.js built-in CSRF tokens |
| SR-06: Data isolation | Tenant ID filtering on all queries |

---

## 8. Performance Requirements

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| API Response Time | < 500ms (p95) |
| Database Query Time | < 200ms (p95) |
| Lighthouse Score | > 85 |
