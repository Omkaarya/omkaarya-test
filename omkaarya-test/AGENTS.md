# AGENTS.md — AI Agent Specifications for Omkaarya

> This document defines how AI agents (Claude / Anthropic API) are utilized within the Omkaarya Temple Management System to accelerate development and provide intelligent operational insights.

---

## Development Agents (Build Phase)

These agents assist developers in maintaining the Omkaarya monorepo and scaling the multi-tenant architecture.

### Agent 1: Multi-Tenant Schema Agent
**Trigger:** When a new operational module (e.g., Goshala, Education) is added.
**Capabilities:**
- Suggests Prisma schema changes with strict `tenantId` isolation.
- Ensures all new models follow the "Soft Delete" and "Audit Log" patterns.
- Generates RLS (Row Level Security) policies for PostgreSQL.

---

### Agent 2: Seva-Logic API Generator
**Trigger:** When a new transactional flow is needed.
**Capabilities:**
- Generates Next.js Route Handlers with built-in validation for temple-specific fields (Gotra, Nakshatra, Rashi).
- Automatically includes activity logging for every financial transaction.
- Generates Zod schemas for complex Seva booking payloads.

---

### Agent 3: Premium Component Builder
**Trigger:** When a new management screen is required.
**Capabilities:**
- Generates high-density DataTables using the `AdminDataTable` and `StatusBadge` patterns.
- Ensures all generated inputs use the pixel-perfect `rounded-[18px]` standard.
- Implements dark/light mode compatibility by default.

---

## Runtime AI Features (In-Product)

These features run within the Omkaarya portal to assist Temple Administrators.

### Feature 1: Intelligent Seva Forecasting
**Where:** Bookings → Seva Overview
**What it does:**
- Analyzes historical booking patterns for festivals (e.g., Maha Shivaratri).
- Predicts upcoming demand and suggests temporary inventory increases (oil, flowers, prasadam materials).
- Flags "High Demand" slots that could benefit from additional counters.

---

### Feature 2: Daily Dharma Summary (Narrative)
**Where:** Temple Admin Dashboard (Top Section)
**What it does:**
- Converts the day's metrics into a readable summary.
- **Example:** *"Om Namah Shivaya! Today saw a 25% increase in footfall. 42 Archana sevas were performed, and General Donations reached ₹85,400. Most bookings were handled by Register 01 (Siva). One low-stock alert: Pure Ghee for Deepams is down to 2kg."*

---

### Feature 3: Devotee Persona Assistant
**Where:** Peoples → Devotee Profile
**What it does:**
- Analyzes a devotee's history (types of sevas performed, donation frequency).
- Suggests personalized outreach for upcoming festivals: *"This devotee regularly performs Abhishekam. Suggest Pradosham special seva bookings."*

---

### Feature 4: Financial Anomaly Guardian
**Where:** Finance → Audit Logs
**What it does:**
- Monitors donation patterns and flags unusual high-value entries or repeated failed transactions.
- Detects if a counter shift was closed with a significant cash discrepancy.

---

## Agent Architecture Guidelines

### Model Selection & Cost Control
- **Daily Narrative:** `claude-3-haiku-20240307` (Fast, Low Cost).
- **Inventory/Seva Analysis:** `claude-3-5-sonnet-20240620` (High Logic, Accurate Predictions).
- **Schema/Code Generation:** `claude-3-5-sonnet-20240620`.

### Security & Privacy
- **No PII Leakage:** AI agents never receive raw Devotee names or Phone numbers unless hashed or required for narrative context (e.g., "Devotee X").
- **Server-Side Only:** All AI inference happens in Next.js Server Actions or API routes. The `ANTHROPIC_API_KEY` is never exposed to the client.

---

## Development Workflow with Agents

```bash
# Workflow for adding a "Goshala Management" module:
# 1. Describe Goshala requirements to the Schema Agent.
# 2. Get Prisma model → Run 'npx prisma migrate dev'.
# 3. Trigger API Generator for CRUD routes.
# 4. Use Component Builder to create the Cows/Feeding/Medical screens.
# 5. Human-in-the-loop review for pixel-perfection.
```
