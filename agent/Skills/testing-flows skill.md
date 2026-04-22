# Omkaarya TMS - Agent Testing Skill

This document provides product engineering and automated testing context for AI Agents working on the Omkaarya Temple Management System (TMS). Whenever building or modifying new screen flows, or when instructed to perform tests, the AI agent must cross-reference this documentation to ensure comprehensive End-to-End (E2E) validations.

---

## 1. Testing Guidelines & Product Engineering Rules

As an AI Agent testing the application, strictly adhere to the following product metrics:
1. **Multi-Tenant State Checks:** Ensure tenant environment variables, subdomains, or contextual state perfectly isolate data between environments.
2. **Role-Based Rendering:** Verify that `Super Admin`, `Temple Admin`, and `Staff` roles have appropriately restricted views (testing negative/denied access scenarios).
3. **Form Integrity:** Always test edge cases in forms (e.g., invalid data types, extreme limits) before verifying the "happy path".
4. **Execution Protocol:** Rely on the `browser_subagent` to simulate exact user interactions. Visual confirmations of toasts, loading spinners, and redirects are mandatory.

---

## 2. Platform Routes Map

Use the following module paths as your target destinations when generating test flows.

### 👑 Super Admin Portal (`/super-admin`)

| Module Name | Route / Directory Path | Test Priorities |
| :--- | :--- | :--- |
| **Invite Flow** | `/super-admin/invite` | Email validation, token generation, link integrity. |
| **Dashboard** | `/super-admin/(dashboard)` | Metric rendering, global data fetches. |
| **Create Temple**| `/super-admin/create-temple` | Form validation, address handling, tenant creation. |
| **Edit Temple** | `/super-admin/edit-temple` | State hydration, update propagation. |
| **Finance** | `/super-admin/finance` | Graph rendering, multi-tenant revenue sums. |
| **Pricing Plans**| `/super-admin/pricing-plans` | Modifying SaaS tier configs. |
| **Subscriptions**| `/super-admin/subscriptions` | Downgrade/Upgrade logic paths. |
| **System Settings**| `/super-admin/system-settings`| Global variable caching, feature gates. |

### 🛕 Temple Admin Portal (`/temple-admin`)

#### A. Authentication & Onboarding Flow
| Module Name | RoutePath | Test Priorities |
| :--- | :--- | :--- |
| **Sign In** | `/signin` | Credential auth, wrong password alerts. |
| **Forgot Password** | `/forgot-password` | Recovery logic. |
| **Set Password** | `/set-password` | Password strength validation. |
| **Admin Setup** | `/admin-profile` | Personal details integrity. |
| **Temple Profile** | `/temple-profile` | Image uploads, core configs. |
| **Deity Select** | `/deity-selection` | Array state management. |
| **Choose Plan** | `/choose-plan` | L1 vs L2 feature gating states. |
| **Payment** | `/payment` | Gateway simulation, webhooks verification. |
| **Onboarding Done**| `/onboarding-complete`| Final redirects to Dashboard. |

#### B. Dashboard Modules (`/temple-admin/dashboard/*`)
| Module Name | Route / Sub-Directory | Test Priorities |
| :--- | :--- | :--- |
| **Master Data** | `master/` | Table CRUD operations list/edit/delete. |
| **Bookings** | `bookings/`, `bookings/new`, `bookings/calendar` | Date range conflict checks, calendar UI. |
| **Inventory Dashboard**| `inventory/` | Sorting, table pagination. |
| **Inventory Creation** | `inventory/create` | Multi-step form flow, state syncing. |
| **Stock Adjustments** | `inventory/adjustments`, `low-stock` | Mathematical accuracy of stock. |
| **Pooja BOM** | `inventory/pooja-bom` | Material deductions mapping logic. |
| **Finance Summary** | `finance/` | Analytics speed. |
| **Donations/Receipts** | `finance/donations`, `finance/receipts` | Invoice generation layout, print triggers. |
| **Peoples / Staff** | `peoples/staff`, `peoples/roles` | Complex RBAC matrix limits. |
| **Point of Sale (POS)**| `pos/` | Rapid transaction state, cart logic. |
| **Prasad Management** | `prasad/`, `prasad/categories` | Listing & sorting efficiency. |
| **Settings** | `settings/(general|app|web|system)` | Preference toggles saving correctly. |

---

## 3. Agent Execution Standard (How to run tests)

When tasked with "Testing Flow X":
1. Check if the local development server is running. If not, start it (`npm run dev`).
2. Identify the target flow URL using the maps in Section 2.
3. Launch `browser_subagent` targeting `http://localhost:3000{path}`.
4. Perform the UI automation script requested.
5. Create an artifact or terminal report outlining pass/fail criteria and automatically correct codebase bugs if encountered.
