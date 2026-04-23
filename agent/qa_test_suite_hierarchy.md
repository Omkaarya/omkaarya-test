# QA Case Study: ClickUp Hierarchy Matrix

This document is optimized for your exact ClickUp structural mapping:
*   **SPACE:** `QA & Testing` (Everything lives inside this single Space)
*   **FOLDER:** Mapped to Portals (`Global IDP`, `Super Admin`, `Temple Admin`)
*   **LIST:** Mapped to **Modules** (e.g., *Bookings*, *Inventory*)
*   **TASK:** Mapped to **Epics**
*   **SUBTASK:** Mapped to **Stories / Flows**

---

## 📁 FOLDER: GLOBAL IDP (Identity Provider)
> **Folder Description:** The centralized identity and access management layer. Controls security, credentials, and session management.

### 📋 LIST: Universal Authentication & Security (Module)
> **List Description:** Contains login forms, security validations, and account recovery logic. Essential for preventing unauthorized system access.

*   **✅ TASK: Secure Access & Recovery (Epic)**
    > **Task Description:** Workflows dedicated to securely entering the platform and recovering locked accounts using encrypted email links. Must strictly test negative validation.
    *   `[Subtask]` As an administrative user (Super Admin or Temple Admin), I can securely log in using my credentials.
    *   `[Subtask]` As an administrative user, I can trigger the "Forgot Password" flow to receive a secure recovery link.
    *   `[Subtask]` As an administrative user, I can securely set a new password complying with security policies.

*   **✅ TASK: Identity Provisioning & Invites (Epic)**
    > **Task Description:** Workflows for provisioning new high-level staff via magic email links to establish verified identities.
    *   `[Subtask]` As a Super Admin, I want to securely invite new top-level administrators via email.
    *   `[Subtask]` As an Invitee, I want to click an invite link and establish my initial IDP credentials.

---

## 📁 FOLDER: SUPER ADMIN PORTAL
> **Folder Description:** The highest-level administrative interface used by the SaaS owners to manage active tenants, monitor platform-wide revenue, and enforce global service level capabilities.

### 📋 LIST: Dashboard & Analytics (Module)
> **List Description:** The landing overview containing macro-level analytics and health metrics for the entire platform.
*   **✅ TASK: Global Operations Overview (Epic)**
    > **Task Description:** Validation of aggregated data visualization on the main dashboard to ensure speed and accuracy of top-level metrics.
    *   `[Subtask]` As a Super Admin, I want to see bird's-eye metrics on the main dashboard (total active temples, total MRR, recent signups).

### 📋 LIST: Tenant / Temple Management (Module)
> **List Description:** Administrative controls to govern the lifecycle, suspension states, and profiles of all hosted temple tenants.

*   **✅ TASK: Temple Instance Lifecycle (Epic)**
    > **Task Description:** The complete lifecycle of a tenant from manual instantiation through configuration and eventual suspension/deletion.
    *   `[Subtask]` As a Super Admin, I want to manually create a new temple instance and assign the root admin.
    *   `[Subtask]` As a Super Admin, I want to edit existing temple profiles, suspend them, or change their active states.

### 📋 LIST: Finance & Billing (Module)
> **List Description:** Cross-tenant financial analytics focusing on platform transaction volumes and aggregate revenue streams.

*   **✅ TASK: Global Revenue Visibility & Accounting (Epic)**
    > **Task Description:** The central hub for viewing platform fees, financial graphs, and high-level transaction accounting.

    *   `[Subtask]` As a Super Admin, I want to view the main **Revenue Dashboard** showing aggregated cross-tenant metrics.
    *   `[Subtask]` I want to view and filter the central **Transactions** ledger for the platform.
    *   `[Subtask]` I want to manage and generate SaaS **Invoices** for hosted temples.
    *   `[Subtask]` I want to issue and track **Receipts** for payments received.
    *   `[Subtask]` I want a workflow to manually **Confirm Payments** received outside automated gateways.
    *   `[Subtask]` I want to view active **Subscriptions** and track **Upcoming Renewals**.

### 📋 LIST: SaaS Subscription Management (Module)
> **List Description:** Configuration center for product pricing, tier capabilities (L1 vs L2), and tenant billing control.

*   **✅ TASK: Pricing System Configurations (Epic)**
    > **Task Description:** Modifying the rules governing SaaS subscriptions. Ensures tenants are accurately gated from premium features.
    *   `[Subtask]` I want to define and edit SaaS **Pricing Plans** (e.g., L1 Basic vs L2 Analytics).
    *   `[Subtask]` I want to manage the System-driven **Features Registry** to map specific features to pricing tiers dynamically for scalability.
    *   `[Subtask]` I want to view active subscriptions and manage upgrades/downgrades manually.

### 📋 LIST: System Configurations (Module)
> **List Description:** Global variables, API keys, and maintenance toggles that affect all underlying tenants.

*   **✅ TASK: Global Platform Variables (Epic)**
    > **Task Description:** The configuration of strict platform rules and master variables that control underlying application states.
    *   `[Subtask]` As an architect, I want to define global system settings, integration keys, and maintenance toggles that affect all sub-tenants.

---

## 📁 FOLDER: TEMPLE ADMIN PORTAL
> **Folder Description:** The dedicated operational dashboard for individual Temple Administrators handling day-to-day operations including bookings, donations, inventory, and staff management.

### 📋 LIST: Core Temple Setup (Module)
> **List Description:** The initial onboarding sequence ensuring proper configuration of the temple's structural profile and SaaS billing plan.

*   **✅ TASK: Temple Multi-Step Onboarding (Epic)**
    > **Task Description:** A sequential configuration pipeline transitioning a fresh invitee into a fully operational SaaS tenant.
    *   `[Subtask]` I want to fill out my Personal Admin Profile.
    *   `[Subtask]` I want to register the Temple's Details and Upload Media.
    *   `[Subtask]` I want to navigate the Deity Selection interface to assign main deities.
    *   `[Subtask]` I want to choose my Subscription Plan.
    *   `[Subtask]` I want to successfully pass the mock/real payment gateway checkout and complete onboarding.

### 📋 LIST: Master Data Management (Module)
> **List Description:** Setup UI for core taxonomy variables (lists, units, types) that populate drop-downs throughout the system.

*   **✅ TASK: Core Taxonomy & Data Setup (Epic)**
    > **Task Description:** Establishing foundational data configurations to ensure consistent data structures across other modules.
    *   `[Subtask]` I want to view and manage **Pooja & Seva** master list.
    *   `[Subtask]` I want a form to **Add New Seva** definitions.
    *   `[Subtask]` I want to view the **Pooja Scheduler** master data.
    *   `[Subtask]` I want a form to **Add New Schedules** for Poojas.
    *   `[Subtask]` I want to view the **Pooja Festivals** master list.
    *   `[Subtask]` I want a form to **Add New Festival** configurations.

### 📋 LIST: Bookings Operations (Module)
> **List Description:** Operational interfaces for tracking devotee calendar requests, pooja scheduling, and hall reservations.

*   **✅ TASK: Pooja & Event Scheduling (Epic)**
    > **Task Description:** Creation and management of time-sensitive event bookings to prevent slot overlaps.
    *   `[Subtask]` I want to view upcoming bookings in a table **List View**.
    *   `[Subtask]` I want to view upcoming bookings in a card **Grid View**.
    *   `[Subtask]` I want to interact with bookings on a visual **Calendar View**.
    *   `[Subtask]` I want to **Add New** manual bookings for walk-in devotees.

### 📋 LIST: Inventory & Warehouse Management (Module)
> **List Description:** Comprehensive tracking of consumables, hardware assets, vendor relations, and low-stock indicators.

*   **✅ TASK: Stock Cataloging (Epic)**
    > **Task Description:** Initial generation of the temple's item index grouped logically by classifications.
    *   `[Subtask]` As an inventory manager, I can view, sort, and paginate through the main inventory dashboard.
    *   `[Subtask]` As a manager, I can create new inventory items and assign them to hierarchical categories.

*   **✅ TASK: Live Stock Operations (Epic)**
    > **Task Description:** Real-time quantity manipulation required by daily operations including audits, alerts, and supply chains.
    *   `[Subtask]` I can perform manual stock adjustments to account for damages or miscounts.
    *   `[Subtask]` The system will flag items under the "Low Stock" threshold.
    *   `[Subtask]` I want to manage and add **Stores** (storage locations).
    *   `[Subtask]` I want to manage and add **Suppliers** (vendors).

*   **✅ TASK: Pooja BOM (Bill of Materials) (Epic)**
    > **Task Description:** Automation rules dictating how specific inventory items are mathematically deducted when specific poojas occur.
    *   `[Subtask]` As an admin, I can attach specific consumable ratios (e.g., 2 coconuts, 1 incense) to a specific Pooja, so stock auto-deducts when the Pooja is booked.

*   **✅ TASK: Warehousing & Barcodes (Epic)**
    > **Task Description:** Print generation UI formatting compliant physical tracking codes.
    *   `[Subtask]` I can generate and print Barcodes, QR labels, and standardized inventory tags.

### 📋 LIST: Finance & Accounting (Module)
> **List Description:** The central ledger capturing all monetary inflow and asset valuation within the precise tenant scope.

*   **✅ TASK: Temple Ledger & Assets (Epic)**
    > **Task Description:** End-to-end tracking of specific money movements, physical valuations, and printable receipts.
    *   `[Subtask]` I want to view the main Finance **Dashboard** for daily/monthly cash flows.
    *   `[Subtask]` I want to view the central **Transaction** ledger.
    *   `[Subtask]` I want a workflow to **Add New Transactions** manually to the ledger.
    *   `[Subtask]` I want to record and process offline/online **Donations**.
    *   `[Subtask]` I want to **Generate Receipts** explicitly mapped to specific categories (Income, Expense, Donation, Inventory Reversal).
    *   `[Subtask]` I want to track physical Temple **Assets** over time.

### 📋 LIST: Human Resources & Access Control (Module)
> **List Description:** Staffing directory and security configurations mapping specific UI permissions to specific users.

*   **✅ TASK: Staff Management Matrix (Epic)**
    > **Task Description:** Governing backend user instances and locking out features based on strict Role-Based Access controls (RBAC).
    *   `[Subtask]` As an administrator, I can add, disable, and manage staff members.
    *   `[Subtask]` As an administrator, I can define custom Roles to enforce granular permission boundaries (e.g., Accountant vs Front-Desk).

### 📋 LIST: Operations & Terminals (Module)
> **List Description:** Fast-action UI views designed for operational counter staff engaged in high-volume devotee workflows.

*   **✅ TASK: Point of Sale (POS) Systems (Epic)**
    > **Task Description:** High-speed checkout architecture requiring zero routing for immediate donations and ticketing.
    *   `[Subtask]` As a counter clerk, I require a rapid POS interface for fast checkouts (donations/tickets/prasad) without complex form routing.
*   **✅ TASK: Prasadham Distribution (Epic)**
    > **Task Description:** Dedicated workflows optimizing the sorting and manufacturing of bulk prasad independently of raw stock.
    *   `[Subtask]` I want to view the main Prasadham **List**.
    *   `[Subtask]` I want to manage Prasadham **Category** assignments.
    *   `[Subtask]` I want a form to **Add New** Prasadham items.

### 📋 LIST: Advanced Temple Settings (Module)
> **List Description:** UI dedicated strictly to administrative preferences altering visual app behavior and default metrics.

*   **✅ TASK: Application Customization (Epic)**
    > **Task Description:** Storing and editing preference toggles connecting the application to other media or altering static outputs.
    *   `[Subtask]` I want to configure **General** settings.
    *   `[Subtask]` I want to configure **Finance** settings.
    *   `[Subtask]` I want to configure **Web** settings (mirroring the Figma design).

---

## 📁 FOLDER: PUBLIC SAAS LANDING PAGE
> **Folder Description:** The public-facing marketing and sales website designed to convert new temples into paying SaaS subscribers.

### 📋 LIST: Marketing & Conversion (Module)
> **List Description:** Public pages containing hero sections, feature grids, pricing tables, and call-to-actions.
*   **✅ TASK: Landing Page UI & Flows (Epic)**
    > **Task Description:** Verifying that the marketing site is pixel-perfect, responsive on mobile devices, and successfully captures leads/signups.
    *   `[Subtask]` I want to test the **Hero Section & Navigation** for responsiveness and dead links.
    *   `[Subtask]` I want to verify the **Features Grid** matches the latest Pepulux design system.
    *   `[Subtask]` I want to verify the public **Pricing Plans** table matches the backend SaaS tiers.
    *   `[Subtask]` I want to test the main **Call to Action (CTA)** funnel to ensure it routes users directly into the Temple Admin Onboarding flow.
