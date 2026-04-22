# Screen Inventory & UI Specification
## Omkaarya — All Delivered Screens

| Field | Details |
|-------|---------|
| **Document version** | 2.0 |
| **Date** | 22 April 2026 |
| **Author** | Product / UI Team |
| **Status** | Living document — updated as screens ship |

---

## 1. Super Admin Portal

### SA-01: Super Admin Dashboard
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/dashboard` |
| **File** | `app/super-admin/(dashboard)/dashboard/page.tsx` |
| **Shell** | `AdminDashboardShell` |
| **Purpose** | Platform-wide overview — temple count, revenue, subscriptions |
| **Key elements** | Stat cards, quick-access grid, recent activity feed |

---

### SA-02: Temple Management
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/temples` |
| **File** | `app/super-admin/(dashboard)/temples/page.tsx` |
| **Purpose** | List, search, and onboard temples |
| **Key elements** | Temple list table, search bar, status badges, onboarding CTA |

---

### SA-03: Subscription Management
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/subscriptions` |
| **File** | `app/super-admin/(dashboard)/subscriptions/page.tsx` |
| **Purpose** | View all subscriptions, verify activations, generate invoices |
| **Key elements** | |
| — Table | Sortable columns: Temple, Plan, Status, Amount, Date |
| — Status badges | Active (green), Pending (amber), Expired (red), Cancelled (gray) |
| — Actions dropdown | Activate, Suspend, Cancel, View Invoice |
| — Verification modal | Review subscription details, approve/reject |
| — Invoice modal | Preview invoice with line items, temple branding |

---

### SA-04: Pricing Plans
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/pricing-plans` |
| **File** | `app/super-admin/(dashboard)/pricing-plans/page.tsx` |
| **Purpose** | Configure and compare pricing plans |
| **Key elements** | |
| — Header | Title + "Create Pricing Plan" CTA + Monthly/Yearly tabs |
| — Plan cards (×3) | Prarambha ($19/$157), Sankalpa ($49/$539), Aaradhana ($99/$1089) |
| — Per-card toggle | "Billed yearly" toggle — individual override |
| — Toggle sync | Bidirectional: tab→all cards reset; all cards match→tab syncs |
| — Feature list | Checkmarks for included features per card |
| — Action buttons | "Edit Plan" (orange) + "Available" (green) per card |
| — Hint text | "Features are defined in the Feature Registry" with link |
| — Plan Comparison | Feature matrix table with toggle icons |
| — Feature rows | Devotee mgmt, Pooja booking, Donations, Compliance, etc. |
| — Seat rows | Included seats (3/5/10) + Extra seat cost ($6/$5/$4 per mo) |
| — Temple Analytics | Horizontal bar chart — plan distribution across temples |

---

### SA-05: Plan Feature Configuration
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/pricing-plans/[planId]/features` |
| **File** | `app/super-admin/(dashboard)/pricing-plans/[planId]/features/page.tsx` |
| **Purpose** | Toggle individual features on/off for a specific plan |
| **Key elements** | Feature list grouped by module, toggle switches, limit inputs |

---

### SA-06: Feature Registry
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/system-settings/feature-registry` |
| **File** | `app/super-admin/(dashboard)/system-settings/feature-registry/page.tsx` |
| **Purpose** | Define and manage all platform features (L1/L2 hierarchy) |
| **Key elements** | |
| — Page header | Title + module/feature count + Add Module + Add Feature buttons |
| — Stat cards (×4) | Modules, Features, Active features, Pricing plans |
| — Info banner | L1=Module, L2=Feature architecture explanation (blue) |
| — Add Feature panel | Collapsible — module selector, name, auto-key, desc, limit type, visibility |
| — Add Module panel | Collapsible — name, key, description |
| — Toolbar | Search, module filter, limit type filter, status filter, expand/collapse |
| — Table header | Feature/Module, Module key, Limit type, Plan config, Active, Plans, Actions |
| — L1 module row | Expand button, name, feature count, module key pill, edit/add actions |
| — L2 feature row | Orange stripe+dot indent, name+key, limit pill, vis check, toggle, plan dots, edit/del |
| — L2 inline edit | Name, key (read-only), limit type, description, visibility, save/cancel |
| — L1 edit panel | Module name, key (read-only), description, status, save/cancel |
| — Quick add row | Per-module inline add with name + key inputs |
| — Add trigger | "+ Add feature to [Module]" button per module |
| — Toast | Bottom-right success/error notification |

---

### SA-07: Domain Management
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/domains` |
| **File** | `app/super-admin/(dashboard)/domains/page.tsx` |
| **Purpose** | Configure custom domains for temples |

---

### SA-08: User Management
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/users` |
| **File** | `app/super-admin/(dashboard)/users/page.tsx` |
| **Purpose** | Manage platform users and assignments |

---

### SA-09: Role & Permissions
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/role-permissions` |
| **File** | `app/super-admin/(dashboard)/role-permissions/page.tsx` |
| **Purpose** | RBAC role configuration |

---

### SA-10: Delete Account Requests
| Field | Detail |
|-------|--------|
| **Route** | `/super-admin/delete-account-requests` |
| **File** | `app/super-admin/(dashboard)/delete-account-requests/page.tsx` |
| **Purpose** | Review and process account deletion requests |

---

## 2. Temple Admin Portal

### TA-01: Temple Dashboard
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/dashboard` |
| **Shell** | `TempleDashboardShell` |
| **Purpose** | Temple-specific overview — devotees, bookings, revenue |
| **Key elements** | Stat cards, quick-access grid, panchangam widget |

---

### TA-02: Inventory — Product List
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/inventory/products` |
| **Purpose** | View all inventory items with search, filter, sort |
| **Key elements** | Table with image thumbnails, category pills, stock indicators, price columns |

---

### TA-03: Inventory — Create Product
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/inventory/products/new` |
| **Purpose** | Add a new inventory product |
| **Key elements** | Multi-field form — name, SKU, category, price, stock, description, image upload |

---

### TA-04: Purchase Orders
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/inventory/purchase-orders` |
| **Purpose** | Manage purchase orders for inventory |
| **Key elements** | PO table with status, vendor, total, actions |

---

### TA-05: Finance — Dashboard
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/finance/dashboard` |
| **Purpose** | Revenue overview with charts |
| **Key elements** | Revenue stat cards, income vs expense bar chart, category pie chart |

---

### TA-06: Finance — Transactions
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/finance/transactions` |
| **Purpose** | Detailed transaction list |
| **Key elements** | Filter bar (date range, type, search), sortable table, type badges |

---

### TA-07: Finance — Add Transaction
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/finance/transactions/new` |
| **Purpose** | Record new income/expense |
| **Key elements** | Type selector, amount, category, description, date, payment method |

---

### TA-08: Donations
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/donations` |
| **Purpose** | Record and track donations |
| **Key elements** | Donor table, donation recording form, receipt generation link |

---

### TA-09: Invoices
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/invoices` |
| **Purpose** | Generate and manage invoices |
| **Key elements** | Invoice list, generation form with line items, preview modal, PDF download |

---

### TA-10: Generate Receipt
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/receipts` |
| **Purpose** | Generate donation receipts |
| **Key elements** | Receipt template with temple branding, QR code, compliance info, print-ready |

---

### TA-11: Reports
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/reports` |
| **Purpose** | Generate financial and operational reports |
| **Key elements** | Report type selector, date range, export options (CSV/PDF) |

---

### TA-12: Subscriptions (Tenant Side)
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/subscriptions` |
| **Purpose** | View current plan and billing |
| **Key elements** | Current plan card, upgrade CTA, billing history table |

---

### TA-13: System Settings Layout
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/settings/layout.tsx` |
| **Purpose** | Secondary Sidebar layout grouping all sub-settings |
| **Key elements** | Responsive dual-column structure, Active state pills, categorization into Organization, App, and System Options. |

---

### TA-14: General & Web Settings
| Field | Detail |
|-------|--------|
| **Routes** | `/settings/general` and `/settings/web` |
| **Purpose** | Base localization and portal routing configurations. |
| **Key elements** | Logo upload zone, timezone selects, domain mapping, custom SEO metadata fields. |

---

### TA-15: Invoice & Receipts Configuration
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/settings/app/invoice` |
| **Purpose** | Manage document automated prefixes |
| **Key elements** | BK-, DON-, POS- prefixed inputs, large textareas for Ts & Cs and Thank You footer strings. |

---

### TA-16: POS & Printers
| Field | Detail |
|-------|--------|
| **Routes** | `/settings/app/pos` and `/settings/app/printers` |
| **Purpose** | Map hardware interactions. |
| **Key elements** | Cash drawer kicks toggles, Print Node Network IP/Port binding, and Hardware ID role assignments. |

---

### TA-17: Email Notifications
| Field | Detail |
|-------|--------|
| **Route** | `/temple-portal/settings/system/email` |
| **Purpose** | Transactional message delivery |
| **Key elements** | Dual-mode tab toggle: Custom SMTP provider credentials versus Twilio SendGrid API key verification. |

---

### TA-18: Finance & Inventory Global Sets
| Field | Detail |
|-------|--------|
| **Routes** | `/settings/system/finance` and `/settings/system/inventory` |
| **Purpose** | Base metrics. |
| **Key elements** | Primary currency selector (LKR), Toggleable global tax sets (VAT, SSCL) with percentage inputs, Baseline minimums out of 100 for inventory modules. |

---

## 3. Shared Components

### Shell Components
| Component | File | Portal | Purpose |
|-----------|------|--------|---------|
| `AdminDashboardShell` | `app/components/admin/AdminDashboardShell.tsx` | Super Admin | Sidebar + topbar + content area |
| `AdminDashboardLayout` | `app/components/admin/AdminDashboardLayout.tsx` | Super Admin | Layout wrapper |
| `TempleDashboardShell` | `app/components/temple-admin/TempleDashboardShell.tsx` | Temple Admin | Sidebar + topbar + feature gating |

### Access Control Components
| Component | Purpose |
|-----------|---------|
| `FeatureGate` | Wraps routes; shows "Upgrade Required" fallback |
| `LimitReachedBanner` | Usage limit notification with upgrade CTA |

---

## 4. Navigation Structure

### Super Admin Sidebar

```
Main
├── Dashboard
├── Temples
├── Pricing Plans [badge: 3]
├── Domains
├── Panchangam

Finance & Billing
├── Transactions
├── Invoices
└── Subscriptions

User Management
├── Users
├── Role & Permissions
└── Delete Account Requests

System
└── System Settings
    └── Feature Registry [badge: 14]
```

### Temple Admin Sidebar

```
Main
├── Dashboard
├── Devotee Management
├── Pooja Booking
├── Donations

Operations
├── Inventory
│   ├── Products
│   └── Purchase Orders
├── Finance
│   ├── Dashboard
│   ├── Transactions
│   └── Reports
└── POS (if enabled)

Settings
├── General Settings
├── Web Settings
├── App Settings
│   ├── Invoice & Receipts
│   ├── POS & Registers
│   └── Printers
└── System Options
    ├── Email Gateway
    ├── Finance & Taxes
    └── Inventory Alerts
```

---

## 5. Screen Count Summary

| Portal | Screens | Status |
|--------|---------|--------|
| Super Admin | 11 | ✅ All shipped |
| Temple Admin | 18 | ✅ All shipped |
| **Total** | **29** | **✅ Complete** |
