# Omkaarya TMS - ClickUp QA Workspace Architecture

This document defines the production-grade ClickUp QA workspace architecture for the Omkaarya Temple Management System (TMS). This structure ensures optimal test tracking across multi-tenant boundaries, roles, and financial workflows.

## 1. Workspace Hierarchy

**Space Name:** `🚀 QA - Omkaarya TMS`
> **Space Description:** The centralized testing and quality assurance environment for the entire Omkaarya ecosystem.

### 📁 Temple Operations
> **Folder Description:** The central hub for all daily operational tasks inside the temple, focusing on personnel, devotee interactions, and broad communications.
*   **List:** Staff & HR Management
    > **Description:** Tracking bugs and features related to staff roles, shifts, and administrative access permissions.
*   **List:** Devotee Profiles & Auth
    > **Description:** Managing devotee onboarding, profile updates, and secure authentication flows.
*   **List:** Notifications & Communications
    > **Description:** Testing the delivery of SMS, emails, and in-app notifications sent to devotees and staff.

### 📁 Booking System
> **Folder Description:** Core infrastructure for managing time-sensitive devotee requests, hall reservations, and capacity limits.
*   **List:** Pooja Scheduling & Calendars
    > **Description:** Validation of the visual calendar UI and overlapping booking conflict prevention.
*   **List:** Event Ticketing & Scanners
    > **Description:** Testing ticket generation, QR code scanning, and entry validation.
*   **List:** Facility/Hall Booking
    > **Description:** Managing large-scale reservations for temple infrastructure (e.g., Mandap booking).

### 📁 Donations & Finance
> **Folder Description:** The critical financial ledger tracking all monetary inflows, integrations, and strict accounting compliance.
*   **List:** Offline & Online Donations
    > **Description:** Testing the manual entry of cash/cheques and the flow of online devotee contributions.
*   **List:** Payment Gateway Integration workflows
    > **Description:** Mocking and verifying real-time webhooks from payment processors (Razorpay, Stripe, etc.).
*   **List:** Payouts & Settlements Tracking
    > **Description:** Ensuring funds are accurately settled into the correct temple bank accounts.
*   **List:** Auditing & Financial Reports
    > **Description:** Validating the mathematical accuracy of exported financial PDFs and CSVs.

### 📁 Inventory & Assets
> **Folder Description:** Physical and consumable stock tracking to ensure the temple never runs out of required pooja materials.
*   **List:** Physical Asset Tracking
    > **Description:** Managing the depreciation and location of fixed hardware/assets.
*   **List:** Consumables & Prasadam Inventory
    > **Description:** Real-time stock counts, low-stock alerts, and auto-deductions during poojas.
*   **List:** Supplier & Vendor Management
    > **Description:** Tracking purchase orders and the directory of approved temple suppliers.

### 📁 System Administration
> **Folder Description:** The highest level of configuration governing global SaaS rules and access limits.
*   **List:** Role-Based Access Control (RBAC)
    > **Description:** Testing strict permission boundaries to ensure staff cannot access unauthorized areas.
*   **List:** Subscription Gating (L1 vs L2 Plans)
    > **Description:** Verifying that premium features are properly locked behind SaaS paywalls.
*   **List:** Global Settings & Tax Configurations
    > **Description:** Testing master variables like tax rates, timezone offsets, and temple defaults.

### 📁 Multi-Tenant Testing
> **Folder Description:** Critical architecture testing to ensure absolute data isolation between different temple accounts.
*   **List:** Subdomain & Vercel Routing
    > **Description:** Validating that `templeA.omkaarya.in` loads perfectly distinct from `templeB.omkaarya.in`.
*   **List:** Data Isolation & Security (Cross-Tenant leaks)
    > **Description:** Ensuring no API endpoints accidentally expose data from a different tenant.
*   **List:** Tenant Onboarding Workflows
    > **Description:** Testing the complex multi-step wizard when a brand new temple signs up for the SaaS.

### 📁 UI/UX, Performance & Platform
> **Folder Description:** Non-functional testing focusing on speed, visual integrity, and device compatibility.
*   **List:** Mobile Responsiveness
    > **Description:** Verifying that dashboards render perfectly on mobile browsers and tablets.
*   **List:** Design System & UI Components
    > **Description:** Testing individual UI elements (buttons, modals, tables) against the Pepulux design guidelines.
*   **List:** Load Testing & Performance
    > **Description:** Monitoring page load speeds and database query efficiency during heavy usage.

### 📁 Release & Regression Testing
> **Folder Description:** Final sign-off boards used immediately before pushing code to the live production server.
*   **List:** Current Sprint Regression
    > **Description:** Final pass over all recently built features to ensure nothing broke.
*   **List:** Hotfixes / Prod Support
    > **Description:** Tracking emergency bugs reported by actual live users.
*   **List:** Automated Test Failures
    > **Description:** Triaging broken Playwright/Cypress tests from the CI/CD pipeline.

---

## 2. Status Workflow (Bug Lifecycle)

Apply this custom Status set to the entire QA Space to maintain a unified bug lifecycle:

1.  🆕 **New** *(Open - Gray)* - Bug reported, awaiting review.
2.  🔍 **Triaged** *(Open - Light Blue)* - QA/Product has reviewed, priority assigned.
3.  ⚙️ **In Testing** *(Open - Orange)* - QA is actively reproducing/documenting.
4.  🚨 **Bug Confirmed** *(Active - Red)* - Successfully reproduced, ready for dev.
5.  👤 **Assigned to Developer** *(Active - Purple)* - Passed to engineering.
6.  💻 **Fix In Progress** *(Active - Yellow)* - Developer is coding the fix.
7.  🧪 **Ready for Retest** *(Review - Blue)* - Fix pushed to QA/Staging environment.
8.  ✅ **Verified** *(Closed - Green)* - QA confirmed the fix works.
9.  ⛔ **Rejected** *(Closed - Dark Gray)* - Cannot reproduce, works as intended, or duplicate.
10. 🏁 **Closed** *(Closed - Gray)* - Fix deployed to production.

---

## 3. Custom Fields

Add these custom fields at the **Space Level** so they are available on every bug report/task.

| Field Name | Type | Options / Format |
| :--- | :--- | :--- |
| **Tenant ID** | Text / Dropdown | `t1-alpha`, `qa-demo`, `tenant-xyz` |
| **Domain/Subdomain** | URL | E.g. `https://demo.omkaarya.in` |
| **Environment** | Dropdown | `Local`, `Dev`, `QA`, `Staging`, `Production` |
| **Module** | Dropdown | `Booking`, `Donation`, `Inventory`, `Finance`, `Auth`, `Settings`, `Platform` |
| **Role Affected** | Dropdown (Multi) | `Super Admin`, `Temple Admin`, `Staff`, `Devotee`, `Unauthenticated` |
| **Priority** | Dropdown | `🔴 P0 (Critical)`, `🟠 P1 (High)`, `🟡 P2 (Medium)`, `🔵 P3 (Low)` |
| **Payment Impact** | Checkbox | Yes / No |
| **Subscription Impact** | Checkbox | Yes / No |
| **Data Risk Level** | Dropdown | `High Risk`, `Medium Risk`, `Low Risk` |
| **App Version/SHA** | Text | Commit SHA or build number |

---

## 4. Automation Rules

Configure the following ClickUp automations to reduce manual overhead and ensure critical issues are addressed immediately.

1.  **Critical Issue Routing:**
    *   **WHEN** Custom Field `Priority` changes to `P0`
    *   **THEN** Assign to `[QA Lead Name]` AND Add Comment: *"🚨 P0 Critical Issue identified. Please engage the core engineering team immediately."* AND Send Slack/Teams Notification.
2.  **Payment & Finance Routing:**
    *   **WHEN** Custom Field `Module` changes to `Finance` or `Payment Impact` becomes `Checked`
    *   **THEN** Assign to `[Backend Engineering Lead]` AND Add tag `finance-critical`.
3.  **Frontend/UI Routing:**
    *   **WHEN** Custom Field `Module` changes to `UI`
    *   **THEN** Assign to `[Frontend Engineering Lead]`.
4.  **QA Retest Loop:**
    *   **WHEN** Status changes to `Ready for Retest`
    *   **THEN** Assign back to the original `Task Creator` (QA Reporter) AND Change due date to `Today`.
5.  **Tenant Security Risk Flagging:**
    *   **WHEN** Task is located in `Multi-Tenant Testing` Folder AND Status changes to `Bug Confirmed`
    *   **THEN** Add tag `Tenant Risk` AND Notify `[Security/Architecture Lead]`.
6.  **Auto-close Stale Tasks:**
    *   **WHEN** Status is `Rejected` for 7 days
    *   **THEN** Change Status to `Closed`.

---

## 5. Suggested ClickUp Views

Set up these views at the Space level for different stakeholders:

*   **QA Dashboard (Board View):** Grouped by Status. Used during daily QA stand-ups to track bug movement.
*   **Release Triage (List View):** Grouped by Priority, filtered to exclude 'Closed' statuses. Crucial for go/no-go release meetings.
*   **Financial Impact Report (Table View):** Filtered where `Payment Impact` = Yes. Shows only columns for Status, Priority, Assignee, and Environment. Essential for business compliance.
*   **Multi-Tenant Risk Matrix (List View):** Filtered to the `Multi-Tenant Testing` folder or tagged with `Tenant Risk`. Used by DevOps and backend architects to monitor isolation integrity.
*   **Team Workload (Workload View):** Shows assigned tasks per QA engineer and developer to prevent burnout.

---

## 6. QA Execution Best Practices for Omkaarya

*   **Multi-Tenant Testing Constraint:** QA engineers must ALWAYS test workflows using at least two active sessions with different subdomains/Tenant IDs to verify absolute data isolation (e.g., ensuring Temple A cannot see Temple B's bookings).
*   **Role Matrix Verification:** For any RBAC changes, tests must verify positive scenarios (access granted) and negative scenarios (access denied, UI elements hidden) for `Super Admin`, `Temple Admin`, and `Staff`.
*   **Subscription Gating:** When testing L1 vs L2 plan features, ensure fallback states handle feature downgrades correctly without crashing the frontend application.
