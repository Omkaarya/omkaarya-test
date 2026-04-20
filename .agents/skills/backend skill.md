---
name: omakaarya-backend
description: >
  Backend engineering skill for OmKaarya. Activate whenever building API routes, services,
  repositories, middleware, or database logic in `omkaarya-test-backend/`. This backend uses
  Node.js + TypeScript with raw PostgreSQL (pg pool) — NOT NestJS, NOT Prisma. Architecture
  follows the repository pattern: routes → service → repository → db pool. Raw SQL migrations
  in `migrations/` folder numbered sequentially. Always read this before writing any backend code.
---

# OmKaarya — Backend Engineering Skill
## Stack: Node.js · TypeScript · PostgreSQL (raw pg pool) · Repository Pattern

---

## 0. Before Writing Any Code

1. Read `README.md` at the repo root
2. Read `omkaarya-test-backend/src/db/pool.ts` — understand the DB connection
3. Check `migrations/` — know the current schema before adding to it
4. Confirm what module you are building in (e.g. `super-admin/`, new `temple-admin/`)
5. Check `postman/` — see if an endpoint already exists before building one

---

## 1. Actual Project Structure

```
omkaarya-test-backend/
├── migrations/                   ← Raw SQL files — numbered sequentially
│   ├── 001_initial.sql
│   ├── 002_user_password_hash.sql
│   ├── 003_user_admin_profile.sql
│   ├── 004_temple_deity_selection.sql
│   ├── 005_temple_plan_selection.sql
│   ├── 006_temple_payment_onboard...
│   ├── 007_temple_onboarding_compl...
│   ├── 008_temple_profile_contact_a...
│   ├── 009_temple_admin_user_fk.sql
│   ├── 010_users_tenant_fk.sql
│   ├── 011_pass...
│   └── 012_temple_tradition_whatsapp.sql
├── postman/                      ← Postman collections — check before building endpoints
├── scripts/                      ← Utility scripts
├── src/
│   ├── db/
│   │   ├── config.ts             ← DB configuration from env
│   │   ├── index.ts              ← DB exports
│   │   ├── pool.ts               ← pg Pool singleton — import this for all queries
│   │   └── run-migrations.ts     ← Migration runner
│   ├── email/
│   │   ├── send-password-reset-otp.ts
│   │   ├── send-temple-invite.ts
│   │   └── smtp.ts               ← SMTP config
│   ├── middleware/
│   │   ├── async-handler.ts      ← Wraps async route handlers — always use this
│   │   ├── error-handler.ts      ← Global error handler
│   │   ├── http-error.ts         ← HttpError class
│   │   └── validate.ts           ← Request validation middleware
│   └── super-admin/              ← Super admin module (existing pattern to follow)
│       ├── auth.repository.ts    ← DB queries for auth
│       ├── auth.routes.ts        ← Express routes for auth
│       ├── auth.service.ts       ← Business logic for auth
│       ├── index.ts              ← Module router — registers all routes
│       ├── password-reset.*.ts   ← Password reset feature files
│       ├── seed-temples.ts       ← Temple seeding
│       └── temple-admin-match.ts ← Temple admin matching logic
├── .env.example
└── tsconfig.json
```

---

## 2. Architecture Pattern — Routes → Service → Repository → DB

**Always follow this exact layering. No exceptions.**

```
Request
  ↓
routes.ts          ← Define endpoint, apply middleware, call service
  ↓
service.ts         ← Business logic, orchestration, validation
  ↓
repository.ts      ← All database queries — raw SQL via pool
  ↓
db/pool.ts         ← pg Pool — the only DB connection
  ↓
PostgreSQL
```

**Rule:** Routes never touch the DB. Services never write raw SQL. Repositories never contain business logic.

---

## 3. Adding a New Module — Follow the `super-admin/` Pattern Exactly

When adding a new module (e.g. `temple-admin/donations/`):

```
src/
└── temple-admin/
    └── donations/
        ├── donations.routes.ts      ← Express router, endpoint definitions
        ├── donations.service.ts     ← Business logic
        ├── donations.repository.ts  ← All SQL queries
        └── index.ts                 ← Registers donations routes in temple-admin
```

**Naming convention:** Match the existing `super-admin/` naming — kebab-case filenames, `.routes.ts` / `.service.ts` / `.repository.ts` suffixes.

---

## 4. Database Access — Always Use the Pool

```ts
// ✅ Always import from db/pool.ts
import pool from '../db/pool';

// ✅ Parameterised queries — always, no exceptions
const result = await pool.query(
  'SELECT * FROM donations WHERE tenant_id = $1 AND deleted_at IS NULL',
  [tenantId]
);

// ✅ Multiple params
const result = await pool.query(
  'SELECT * FROM donations WHERE tenant_id = $1 AND id = $2',
  [tenantId, donationId]
);

// ❌ NEVER concatenate user input into SQL — SQL injection
const result = await pool.query(
  `SELECT * FROM donations WHERE tenant_id = '${tenantId}'` // NEVER
);
```

---

## 5. Repository Pattern — How to Write Repositories

```ts
// donations.repository.ts
import pool from '../../db/pool';

export const donationsRepository = {

  async findAll(tenantId: string, limit: number, offset: number) {
    const result = await pool.query(
      `SELECT d.*, dev.first_name, dev.last_name
       FROM donations d
       JOIN devotees dev ON d.devotee_id = dev.id
       WHERE d.tenant_id = $1          -- ALWAYS scope to tenant
         AND d.deleted_at IS NULL      -- ALWAYS exclude soft-deleted
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return result.rows;
  },

  async findById(id: string, tenantId: string) {
    const result = await pool.query(
      `SELECT * FROM donations
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [id, tenantId]           // BOTH id AND tenantId — never id alone
    );
    return result.rows[0] || null;
  },

  async count(tenantId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM donations WHERE tenant_id = $1 AND deleted_at IS NULL',
      [tenantId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async create(data: CreateDonationData, tenantId: string) {
    const result = await pool.query(
      `INSERT INTO donations (tenant_id, devotee_id, amount, method, receipt_number, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tenantId, data.devoteeId, data.amount, data.method,
       data.receiptNumber, data.notes, data.createdBy]
    );
    return result.rows[0];
  },

  // Soft delete — NEVER hard delete financial records
  async softDelete(id: string, tenantId: string) {
    const result = await pool.query(
      `UPDATE donations SET deleted_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      [id, tenantId]
    );
    return result.rows[0];
  },
};
```

---

## 6. Service Pattern — Business Logic Here

```ts
// donations.service.ts
import { donationsRepository } from './donations.repository';
import { HttpError } from '../../middleware/http-error';

export const donationsService = {

  async getAll(tenantId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      donationsRepository.findAll(tenantId, limit, offset),
      donationsRepository.count(tenantId),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getById(id: string, tenantId: string) {
    const donation = await donationsRepository.findById(id, tenantId);
    if (!donation) throw new HttpError(404, 'Donation not found');
    return donation;
  },

  async create(data: CreateDonationInput, tenantId: string, userId: string) {
    // Business logic lives here — not in repository, not in routes
    const receiptNumber = await generateReceiptNumber(tenantId);
    return donationsRepository.create(
      { ...data, receiptNumber, createdBy: userId },
      tenantId
    );
  },
};
```

---

## 7. Routes Pattern — Follow `super-admin/auth.routes.ts` Exactly

```ts
// donations.routes.ts
import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler'; // Always use this
import { authenticate } from '../../middleware/authenticate';  // JWT guard
import { validate } from '../../middleware/validate';
import { donationsService } from './donations.service';
import { createDonationSchema } from './donations.schema';

const router = Router();

// All routes in a module require auth — apply at module level
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const { tenantId } = req.user;  // From JWT — never from body
  const { page, limit } = req.query;
  const result = await donationsService.getAll(
    tenantId,
    Number(page) || 1,
    Number(limit) || 10
  );
  res.json({ is_success: true, result });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { tenantId } = req.user;
  const donation = await donationsService.getById(req.params.id, tenantId);
  res.json({ is_success: true, result: donation });
}));

router.post('/', validate(createDonationSchema), asyncHandler(async (req, res) => {
  const { tenantId, id: userId } = req.user;
  const donation = await donationsService.create(req.body, tenantId, userId);
  res.status(201).json({ is_success: true, result: donation });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { tenantId } = req.user;
  await donationsService.softDelete(req.params.id, tenantId);
  res.json({ is_success: true, result: null });
}));

export default router;
```

---

## 8. Always Use `asyncHandler`

```ts
// ✅ Always wrap async route handlers
router.get('/', asyncHandler(async (req, res) => {
  // Errors are caught and passed to error-handler.ts automatically
}));

// ❌ Never raw async without handler — unhandled promise rejections
router.get('/', async (req, res) => {  // WRONG
  // Unhandled errors crash the process
});
```

---

## 9. API Response Format — Match the Existing Pattern

All responses follow the existing `super-admin/` shape:

```ts
// Success
res.json({ is_success: true, result: data });
res.status(201).json({ is_success: true, result: created });

// Error (thrown as HttpError — caught by error-handler.ts)
throw new HttpError(404, 'Temple not found');
throw new HttpError(403, 'Access denied');
throw new HttpError(400, 'Invalid input');
throw new HttpError(409, 'Duplicate receipt number');
```

**Never** return a different shape. `is_success` + `result` is the contract the frontend depends on.

---

## 10. SQL Migrations — How to Add New Tables

```sql
-- New file: migrations/013_donations.sql
-- Naming: NNN_descriptive_name.sql (next sequential number)

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),  -- Always tenant-scoped
  devotee_id UUID REFERENCES devotees(id),
  amount NUMERIC(10,2) NOT NULL,                   -- NUMERIC not FLOAT for money
  method VARCHAR(20) NOT NULL,
  receipt_number VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                           -- Soft delete for financial records
);

-- Always index tenant_id — every tenant-scoped table
CREATE INDEX IF NOT EXISTS idx_donations_tenant_id ON donations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_donations_tenant_created ON donations(tenant_id, created_at DESC);

-- Unique constraint: receipt number per tenant
ALTER TABLE donations
  ADD CONSTRAINT uq_donations_receipt UNIQUE (tenant_id, receipt_number);
```

**Migration rules:**
- Next sequential number — check `migrations/` for the last number
- `IF NOT EXISTS` on all `CREATE TABLE` and `CREATE INDEX`
- Never modify existing migration files — always add a new one
- Test on local DB before committing
- Financial tables: always include `deleted_at` (soft delete)
- Money columns: always `NUMERIC(10,2)` — never `FLOAT` or `DECIMAL`

---

## 11. Multi-Tenancy — The Hardest Rule

```ts
// tenantId ALWAYS comes from req.user (JWT) — never from req.body or req.params
const { tenantId } = req.user;

// EVERY query includes tenant_id
WHERE tenant_id = $1  -- This must be in every SELECT, UPDATE, DELETE

// findById ALWAYS uses BOTH id AND tenant_id
WHERE id = $1 AND tenant_id = $2  -- Never id alone
```

Temple A data is inaccessible to Temple B. This is tested explicitly in QA.

---

## 12. Email — Follow Existing Pattern

```ts
// Add new email functions to src/email/
// Follow send-temple-invite.ts as the pattern:
// - One function per email type
// - Uses smtp.ts for transport
// - Clear subject, HTML body
// - Export the function
```

---

## 13. Security Rules

- JWT authentication via `authenticate` middleware — applied to all protected routes
- `asyncHandler` on every async route — no unhandled rejections
- Parameterised queries — no string concatenation with user input
- `validate` middleware with schema — all POST/PATCH body inputs validated
- Never log full error stack traces to console in production
- Secrets only in `.env` — never committed to git

---

## Quality Gates — Backend Build Complete When

- [ ] Follows routes → service → repository → pool layering exactly
- [ ] Every query includes `tenant_id` scoped from `req.user`
- [ ] `asyncHandler` wrapping every async route
- [ ] Parameterised queries — zero string concatenation with user input
- [ ] New migration file created with next sequential number
- [ ] Financial tables use `NUMERIC(10,2)` and have `deleted_at`
- [ ] All indexes added: `tenant_id`, `tenant_id + created_at`
- [ ] Response shape: `{ is_success: true/false, result: data/null }`
- [ ] Postman collection updated with new endpoints
- [ ] `.env.example` updated if new env vars added
