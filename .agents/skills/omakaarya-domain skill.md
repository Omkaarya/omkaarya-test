---
name: pepulux-omakaarya-domain
description: >
  OmKaarya domain knowledge skill for Pepulux. Activate whenever building, designing, testing,
  or discussing OmKaarya features — temple management, donations, devotees, puja, events, POS,
  inventory, or financial reporting. This skill provides deep business domain context that every
  engineer, designer, QA, and BA must understand before working on OmKaarya. Read this before
  making any product decisions, data model decisions, or UI decisions for OmKaarya.
---

# OmKaarya — Domain Knowledge Skill
## Product: Temple ERP SaaS · Multi-Tenant · Primary Product

---

## 0. What OmKaarya Is

OmKaarya is a **multi-tenant SaaS ERP system for Hindu temple management** in Sri Lanka and the diaspora (UK, Canada, Australia, Malaysia).

It replaces paper registers, Excel sheets, and disconnected manual processes with a single, integrated platform. Every feature exists to help a small temple administration team do their job faster, more accurately, and with more transparency to their community.

**Users are not tech-savvy.** A temple treasurer may be 60 years old and use a tablet. A priest may use it to check today's puja schedule. Design and build for them.

---

## 1. The Users — Know Them Before Building Anything

| User | Who They Are | Primary Concerns |
|---|---|---|
| Temple President | Senior leader, community figure | Overview, reports, financial transparency |
| Temple Secretary | Day-to-day operations manager | Events, devotee records, communications |
| Temple Treasurer | Financial oversight | Donation accuracy, reconciliation, reporting |
| Temple Staff | On-the-ground administrators | POS, donations at counter, devotee lookup |
| Priest | Performs rituals and services | Puja schedule, today's bookings |
| Devotee | Temple community member | Their own donation history (future) |

**Design priority order: Staff and Treasurer first** (highest daily use), then Secretary, then President.

---

## 2. The Modules — What OmKaarya Does

### 2.1 Temple Management
**What it is:** Core administrative hub — temple profile, staff management, operating hours, priest assignments.

**Key workflows:**
- Temple profile setup: name, address, deities, established date
- Staff accounts: create roles, assign permissions
- Operating hours: regular hours + special hours for festivals
- Priest roster: which priest is assigned to which puja slot

**Business rules:**
- A temple can have multiple admins but only one primary admin
- Staff roles: Admin (full), Staff (operational), ReadOnly (view only)
- Operating hours override: festival dates can extend or change hours

---

### 2.2 Devotee CRM
**What it is:** A record of every devotee connected to the temple — their profile, contact details, donation history, and event participation.

**Key workflows:**
- Devotee registration: name, contact, family members, home temple
- Devotee lookup: fast search by name or phone number at the counter
- Donation history: every donation linked to a devotee
- Communication: contact details for announcements

**Business rules:**
- A devotee can be linked to multiple temples (cross-tenant reference — handle carefully)
- Devotee PII (email, phone, address) is personal data — GDPR/PDPA applies
- Data deletion request must anonymise PII but preserve financial aggregate totals
- Duplicate detection: same phone number should warn before creating a second profile

---

### 2.3 Donations
**What it is:** The most financially critical module. Records every donation received by the temple, generates receipts, and feeds the financial reports.

**Key workflows:**
1. Staff identifies devotee (by name or phone search)
2. Staff selects donation purpose (General, Festival, Specific deity, Annadhanam, etc.)
3. Staff enters amount
4. Staff selects payment method (cash, card, UPI, bank transfer)
5. System generates receipt number automatically
6. Receipt printed or emailed to devotee

**Business rules:**
- Receipt numbers: unique per temple, auto-generated, sequential format: `[TEMPLE_CODE]-[YEAR]-[SEQ]` e.g. `MKT-2026-00142`
- Idempotency: duplicate submission within 30 seconds = same receipt, not two
- Financial records are **immutable** — never hard delete, never edit amount after creation
- Corrections are done via a reversal/credit note, not an edit
- Receipt must be generated within 30 seconds of submission
- Donation purposes are configurable per temple — not hardcoded
- Foreign donations: mark currency, store exchange rate at time of donation

---

### 2.4 Events & Puja Scheduler
**What it is:** Calendar and booking system for temple events — daily pujas, special ceremonies, festivals, cultural events.

**Key workflows:**
- Create event: name, date, time, presiding priest, capacity
- Puja schedule: recurring daily pujas (morning, midday, evening) with priest assignments
- Devotee booking: reserve a slot for a special puja or ceremony
- Festival calendar: major Hindu festivals auto-populated, customisable per temple
- Announcements: notify devotees of upcoming events

**Business rules:**
- Hindu festival calendar: Diwali, Thaipusam, Thai Pongal, Navaratri, etc. are pre-loaded
- Festival dates block production deployments (DevOps rule mirrors this)
- A puja slot has a maximum number of devotee participants — enforce capacity
- Cancellation policy: configurable per temple (e.g., 24hr notice required)
- Priest cannot be double-booked — conflict detection required

---

### 2.5 Point of Sale (POS)
**What it is:** Counter sales system for prasad (blessed food), flowers, incense, merchandise, and other items sold at the temple.

**Key workflows:**
1. Staff opens POS session (ties all sales to a session + staff member)
2. Staff scans or searches product
3. Staff adds to cart
4. Staff processes payment (cash, card, UPI)
5. Receipt generated (optional print)
6. End-of-day: session closed, reconciliation report generated

**Business rules:**
- Every sale tied to a POS session (for end-of-day reconciliation)
- Cash sales: staff enters amount received, system calculates change
- Session reconciliation: cash expected vs cash counted — must match
- Void/refund: requires admin role, logged with reason
- Items are temple-specific — each temple configures their own product catalogue
- Prasad items: may have religious significance in naming — allow temple to name them freely

---

### 2.6 Inventory Management
**What it is:** Tracks stock of items sold at POS and consumables used in pujas (incense, flowers, camphor, etc.).

**Key workflows:**
- Product catalogue: define products, unit, cost price, selling price
- Stock intake: record when new stock arrives
- Stock deduction: automatic when POS sale is made, manual for puja consumption
- Low stock alert: configurable threshold per product, alert to admin
- Inventory report: current stock levels, movement history

**Business rules:**
- Stock levels can never go negative in the system (warn before confirming a POS sale that would do this)
- Puja consumables: some items are consumed (not sold) — track separately from POS stock
- Periodic physical count: system supports stock-take reconciliation

---

### 2.7 Financial Reporting
**What it is:** The financial dashboard and report suite for the temple treasurer and president.

**Key reports:**
- Daily collection report: all donations + POS sales for the day
- Monthly income statement: total income by category
- Donation report: by purpose, by devotee, by date range
- POS report: sales by product, by session, by date range
- Outstanding items: unpaid bookings (future), pending receipts
- Annual summary: for committee presentations and audit

**Business rules:**
- All reports are read-only — no editing from reports
- Export to PDF and Excel — treasurer uses both
- Date range: always based on the temple's local timezone (Sri Lanka = Asia/Colombo)
- Financial year: configurable per temple (may differ from calendar year)
- Reports must be print-ready — treasurer will print them for committee meetings
- Audit trail: every financial figure must be traceable to its source transactions

---

## 3. The Hindu Festival Calendar — Operational Impact

These dates are significant for OmKaarya:

| Festival | Approx. Period | Impact |
|---|---|---|
| Thai Pongal | January | High donation volume |
| Maha Shivaratri | February/March | High puja bookings |
| Tamil/Sinhala New Year | April 13–14 | Peak volume — all modules under load |
| Thaipusam | January/February | Event module peak |
| Navaratri | September/October | 9-day high volume |
| Diwali | October/November | Peak — no deployments 7 days before/after |
| Karthigai Deepam | November/December | High volume |

**Engineering rule:** No production deployments during the 3 days before, during, or after major festival dates. DevOps maintains this calendar in GitHub Actions.

---

## 4. Multi-Tenancy Model

```
Tenant = One Temple

Each tenant has:
- Their own users (staff, admins)
- Their own devotee records
- Their own donation history
- Their own event calendar
- Their own POS catalogue
- Their own inventory
- Their own financial reports

Temple A staff cannot see Temple B's data.
This is enforced at: database query level, API level, and UI level.
The logged-in temple name is always visible in the header.
```

---

## 5. Data Sensitivity Classification

| Data | Classification | Handling |
|---|---|---|
| Devotee name, email, phone | Personal (GDPR/PDPA) | Encrypted at rest, deletable on request |
| Donation amounts | Financial | Immutable, audit trail, never hard delete |
| Financial reports | Confidential | Admin role only |
| Temple settings | Internal | Admin role only |
| POS transactions | Financial | Immutable per session |
| Staff accounts | Personal | Encrypted password, access logged |

---

## 6. Timezone Rule

All OmKaarya timestamps are stored in **UTC** in the database.
All dates displayed to users are converted to **Asia/Colombo (UTC+5:30)**.
Reports always show Sri Lanka time.
This must be handled at the API response layer — never show raw UTC to users.

---

## 7. Language Considerations

- Current: English-first
- Future: Tamil and Sinhala support planned
- Design rule: all layouts must accommodate strings up to 2× the English length (Tamil text is longer)
- Right-to-left: not required (Tamil and Sinhala are LTR)
- Do not hardcode English strings in components — use i18n-ready patterns from day one

---

## 8. What Good Looks Like for OmKaarya Users

A temple treasurer's ideal day with OmKaarya:
- Opens the app → sees today's donation total on the dashboard
- Reviews the daily collection report — every transaction is there, with receipts
- Exports the monthly report to Excel — committee meeting tonight
- Checks inventory — notices low stock on incense — raises a purchase request

A temple staff member's ideal workflow:
- Devotee walks up → staff searches by name in 2 seconds
- Records donation → receipt generated in < 5 seconds
- Devotee leaves happy with their receipt

This is the experience being engineered. Keep it in mind with every decision.
