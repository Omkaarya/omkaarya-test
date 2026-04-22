# System Architecture Document
## Omkaarya — Temple Management SaaS Platform

| Field | Details |
|-------|---------|
| **Document version** | 2.0 |
| **Date** | 22 April 2026 |
| **Author** | Architecture Team |
| **Status** | Living document |

---

## 1. Architecture Overview

Omkaarya follows a **monolithic Next.js** architecture with **App Router**, serving both the Super Admin and Temple Admin portals from a single deployment. The system uses a **multi-tenant** data model where each temple is isolated by `tenant_id` in the database layer.

```
┌──────────────────────────────────────────────────┐
│                  CLIENTS                         │
│  ┌────────────┐  ┌────────────────────────────┐  │
│  │ Super Admin│  │ Temple Admin (per tenant)  │  │
│  │  Browser   │  │  Browser                   │  │
│  └─────┬──────┘  └─────────┬──────────────────┘  │
│        │                   │                     │
└────────┼───────────────────┼─────────────────────┘
         │                   │
    ┌────▼───────────────────▼────┐
    │      Next.js App Router     │
    │  ┌─────────────────────────┐│
    │  │  Server Components      ││
    │  │  Client Components      ││
    │  │  API Routes (/api/*)    ││
    │  └────────────┬────────────┘│
    │               │             │
    │  ┌────────────▼────────────┐│
    │  │  Data Layer (lib/*.ts)  ││
    │  │  - temples-db.ts        ││
    │  │  - features-db.ts       ││
    │  │  - feature-access.ts    ││
    │  └────────────┬────────────┘│
    └───────────────┼─────────────┘
                    │
         ┌──────────▼──────────┐
         │     PostgreSQL      │
         │  ┌──────────────┐   │
         │  │ temples      │   │
         │  │ features     │   │
         │  │ plan_features│   │
         │  │ users        │   │
         │  │ ...          │   │
         │  └──────────────┘   │
         └─────────────────────┘
```

---

## 2. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Runtime** | Node.js 20+ | LTS, stable, Next.js requirement |
| **Framework** | Next.js 15 (App Router) | SSR, RSC, file-based routing, API routes |
| **Language** | TypeScript | Type safety, refactor confidence |
| **Styling** | Tailwind CSS 4 + Design Tokens | Utility-first, consistent with Pepulux DS |
| **Database** | PostgreSQL 15+ | Relational, mature, multi-tenant friendly |
| **ORM / Query** | `pg` (node-postgres) | Direct SQL, connection pooling, no ORM overhead |
| **Icons** | Lucide React | Consistent icon set, tree-shakeable |
| **Font** | Plus Jakarta Sans (Google Fonts) | Pepulux DS brand font |
| **Deployment** | Vercel (planned) | Next.js native, edge functions, CDN |

---

## 3. Directory Structure

```
omkaarya-test/
├── app/
│   ├── globals.css             # Design tokens + global styles
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Landing page redirect
│   ├── api/
│   │   ├── features/           # Feature CRUD API
│   │   ├── plan-features/      # Plan-feature config API
│   │   └── tenant-features/    # Tenant feature access API
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboardShell.tsx   # Super admin sidebar + layout
│   │   │   └── AdminDashboardLayout.tsx  # Wrapper component
│   │   └── temple-admin/
│   │       └── TempleDashboardShell.tsx   # Temple admin sidebar + layout
│   ├── super-admin/
│   │   └── (dashboard)/
│   │       ├── layout.tsx                # Admin shell wrapper
│   │       ├── dashboard/page.tsx
│   │       ├── temples/page.tsx
│   │       ├── subscriptions/page.tsx
│   │       ├── pricing-plans/
│   │       │   ├── page.tsx              # Plan cards + comparison matrix
│   │       │   └── [planId]/features/page.tsx
│   │       ├── domains/page.tsx
│   │       ├── users/page.tsx
│   │       ├── role-permissions/page.tsx
│   │       ├── delete-account-requests/page.tsx
│   │       └── system-settings/
│   │           └── feature-registry/page.tsx  # L1/L2 hierarchy
│   └── temple-portal/
│       └── (dashboard)/
│           ├── layout.tsx
│           ├── dashboard/page.tsx
│           ├── inventory/...
│           ├── finance/...
│           ├── donations/page.tsx
│           ├── invoices/page.tsx
│           ├── receipts/page.tsx
│           ├── reports/page.tsx
│           └── subscriptions/page.tsx
├── lib/
│   ├── api-base.ts              # API URL helper
│   ├── temples-db.ts            # PostgreSQL pool + temple queries
│   ├── features-db.ts           # Feature CRUD operations
│   ├── plan-features-db.ts      # Plan-feature config operations
│   ├── feature-module-map.ts    # Static module → feature key mapping
│   ├── feature-access.ts        # Client-side feature access check
│   └── temple-pricing-plans.ts  # Plan definitions + types
├── docs/
│   ├── BRD.md                   # Business Requirements Document
│   ├── SRS.md                   # Software Requirements Specification
│   ├── ARCHITECTURE.md          # This file
│   └── DB_SCHEMA.md             # Database schema documentation
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 4. Multi-Tenancy Architecture

### 4.1 Tenant Isolation Model
- **Database-level**: All tenant-specific tables include a `temple_id` / `tenant_id` column
- **Query-level**: Every data access function filters by tenant ID
- **Route-level**: Temple admin routes are scoped to the authenticated tenant
- **Feature-level**: `FeatureGate` component checks tenant's plan features before rendering

### 4.2 Request Flow (Temple Admin)
```
Browser Request
    ↓
Next.js Middleware (auth check + tenant resolution)
    ↓
Server Component / API Route
    ↓
Data Layer (temples-db.ts) — filtered by tenant_id
    ↓
PostgreSQL — tenant-isolated data
```

### 4.3 Feature Access Control Flow
```
Sidebar renders
    ↓
TempleDashboardShell checks moduleKey against disabledModules[]
    ↓
If disabled → shows lock icon, prevents navigation
    ↓
If enabled → normal link

Page loads
    ↓
FeatureGate wraps page content
    ↓
Checks feature access via /api/tenant-features
    ↓
If not accessible → shows "Upgrade Required" banner
    ↓
If accessible → renders children normally
```

---

## 5. Design System Integration

### 5.1 Pepulux Design System (DS)
The platform uses the Pepulux DS with these semantic tokens:

```css
:root {
  --brand-primary: #FF6B35;        /* Orange — CTA, active states */
  --brand-primary-hover: #e85e2a;  /* Orange dark — hover states */
  --bg-page: #f0ede8;             /* Warm stone background */
  --surface: #ffffff;              /* Card/panel surface */
  --border: #e4ddd6;              /* Default borders */
  --text-primary: #1c1917;        /* Primary text */
  --text-secondary: #78716c;      /* Muted text */
  --text-muted: #a8a29e;          /* Faded text */
  --success: #16a34a;             /* Green — active, enabled */
  --error: #dc2626;               /* Red — danger, inactive */
  --warning: #d97706;             /* Amber — warnings */
  --info: #2563eb;                /* Blue — info banners */
}
```

### 5.2 Typography
- **Font**: Plus Jakarta Sans (400, 500, 600, 700, 800)
- **Headings**: 18-24px, font-weight 700-800
- **Body**: 12-14px, font-weight 400-500
- **Labels**: 10-11px, uppercase, tracking-wider, font-weight 700

### 5.3 Component Patterns
- **Cards**: Rounded-xl, border, shadow-sm, white background
- **Tables**: Rounded-xl container, zebra-stripe hover, sticky headers
- **Forms**: Rounded-lg inputs, focus ring with brand-primary
- **Buttons**: Primary (orange fill), Secondary (white + border), Ghost (border only)
- **Toggles**: Custom switch (18×32px track, 14×14px thumb)
- **Pills**: Rounded-full, color-coded (blue=module, amber=number, purple=boolean, grey=none)

---

## 6. Database Connection Pattern

```typescript
// lib/temples-db.ts
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}
```

All database modules (`features-db.ts`, `plan-features-db.ts`) reuse this pattern for consistent connection pooling.

---

## 7. State Management Patterns

### 7.1 Server State
- Initial data loaded via API fetch in component `useEffect` or RSC
- Mutations via `fetch` → `POST/PUT/PATCH/DELETE` → refetch

### 7.2 Client State
- `useState` for local UI state (modals, filters, form data)
- No global state library — component-level state preferred
- Feature flags fetched per-session and cached in component

### 7.3 Pricing Plans Toggle Sync (Bidirectional)
```
Global Tab (Monthly/Yearly)
    ↓ click
setBilling(mode) + setCardBilling({})  ← clears ALL overrides

Per-Card Toggle
    ↓ click
Update cardBilling[planId]
    ↓ check
If ALL cards now match → sync global tab + clear overrides
```

---

## 8. Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Authentication | Session cookies (planned: NextAuth.js) |
| Authorization | Role-based (Super Admin / Temple Admin / Viewer) |
| API Security | Endpoint-level role checks |
| Data Isolation | tenant_id filter on all DB queries |
| Feature Gating | FeatureGate + sidebar moduleKey filtering |
| Input Validation | Client-side (React forms) + Server-side (API routes) |
| CSRF | Next.js built-in CSRF protection |
| XSS | React's auto-escaping + Content Security Policy headers |

---

## 9. Deployment Architecture (Planned)

```
                  ┌─────────────┐
                  │   Vercel    │
                  │  Edge CDN   │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │  Next.js    │
                  │  Serverless │
                  │  Functions  │
                  └──────┬──────┘
                         │
              ┌──────────▼──────────┐
              │     PostgreSQL      │
              │  (Managed — Supabase│
              │   or Neon or RDS)   │
              └─────────────────────┘
```

---

## 10. Monitoring & Observability (Planned)

| Aspect | Tool |
|--------|------|
| Error Tracking | Sentry |
| Performance | Vercel Analytics |
| Database | pg_stat_statements |
| Uptime | Vercel Status / Pingdom |
| Logging | Structured logging → Vercel Logs |
