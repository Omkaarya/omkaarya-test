# Codebase & Architecture Analysis

Based on an architectural and code-level investigation of the Omkaarya Temple Management platform, here are the detailed answers to your questions, with code references and highlighted risks.

## 1. Multi-Tenancy Architecture

**Architecture**: The system uses a **Shared Database with `tenant_id`**. (Option a)
All tenant-specific data is separated logically using a foreign key (`temple_id` or `tenant_id`) rather than physically separated schemas or databases.

**Table/Model Example** (from `docs/DB_SCHEMA.md`):
```sql
CREATE TABLE products (
    id              SERIAL PRIMARY KEY,
    temple_id       INTEGER REFERENCES temples(id), -- Tenant Context
    name            VARCHAR(255) NOT NULL,
    -- ...
);
```

**How is tenant isolation enforced?**
Tenant isolation is enforced explicitly in the query layer (`lib/temples-db.ts`). Every data access operation must manually append `AND temple_id = $1` in its SQL statements.
```typescript
// Pattern used across the app
const result = await pool.query(
  'SELECT * FROM products WHERE temple_id = $1 AND is_active = true ORDER BY name',
  [templeId]
);
```
> [!WARNING]
> **Risk**: Because multi-tenancy is enforced manually via query parameters rather than using Row-Level Security (RLS) in PostgreSQL, developers could easily forget to attach `temple_id = $1` in new queries, leading to cross-tenant data leaks. 

## 2. Database & ORM

**ORM setup**: The codebase intentionally **avoids Prisma or any heavy ORM**. It uses raw SQL via the bare `pg` (node-postgres) library, alongside manual interface typings. 

**Key Models** (from `docs/DB_SCHEMA.md`):
- **Users**: 
  `id`, `temple_id` (NULL for super admin), `name`, `email`, `password_hash`, `user_type`.
- **Tenants (temples)**: 
  `id`, `tenant_id` (external ID), `name`, `slug` (subdomain), `plan`, `admin_email`.
- **Transactions**: 
  `id`, `temple_id`, `type` ('income' | 'expense' | 'donation'), `amount`, `transaction_date`, `payment_method`.
- **Invoices**: 
  `id`, `temple_id`, `invoice_number`, `items` (JSONB), `subtotal`, `total`, `status`.
- **Receipts**: Managed within the `donations` table, which includes `receipt_number`, `gift_aid`, and `tax_receipt` flags.

**Indexes Used**:
Indexes heavily target `temple_id` for isolation performance.
- `idx_temples_slug` on `temples(slug)`
- `idx_users_temple` on `users(temple_id)`
- `idx_subscriptions_temple` on `subscriptions(temple_id)`
- `idx_transactions_date` on `transactions(temple_id, transaction_date)`
- `idx_invoices_number` on `invoices(temple_id, invoice_number)`

## 3. Authentication / IDP

**Authentication Strategy**: Authentication is completely **custom** initially, using the `users` table, `password_hash`, and temporary passwords (seen in `lib/temples-db.ts`). There is no external IDP (like Auth0 or Clerk) implemented yet, although `ARCHITECTURE.md` notes that NextAuth.js is planned. Session cookies manage state.

**Roles Setup**: Roles have multiple granularities:
1. Hardcoded `user_type` column in `users`: `super_admin` | `temple_admin` | `staff`.
2. Granular tables: `roles` and `role_permissions` storing permissions like `inventory.create` mapping to system-wide `user_roles`.

**Middleware Implementation**:
The system uses Next.js Middleware to perform authentication checks and resolve the tenant via subdomain or path (`slug.omkaarya.com`), intercepting requests before they reach Server Components or API Routes.

## 4. Finance Module Architecture

**Storage Strategy**: Transactions use **Multiple Tables**. 
Instead of a single mega-ledger, they are heavily normalized:
- `transactions`: General income/expense tracker.
- `donations`: Specific to devotee contributions (handles UK Gift Aid, custom receipts).
- `invoices`: Used for billing (JSONB items).
- `purchase_orders`: Inventory expense management.

**Ledger vs Direct Model**: Based on the schema context, it is a **Direct Update Model**. Balances aren't stored via double-entry accounting ledgers; instead, totals are calculated on demand from `transactions` and `donations` rows.

**Receipts generation**: `donations` have `receipt_number` and `tax_receipt` parameters mapped directly parallel to the transaction itself.

> [!TIP]
> **Best Practice Missing**: There is no audit table or generic Ledger for immutable dual-entry accounting, which is a risk for financial discrepancy debugging.

## 5. API Structure

The application employs a mix of **REST API Routes** (`/api/*`) and Next.js **Server Actions** (`/app/actions/*`).

**Major REST APIs** (`app/api/`):
- `/api/features` & `/api/plan-features`
- `/api/tenant-features` (Feature gating)
- `/api/temples`
- `/api/subscriptions`

**Server Actions** (`app/actions/`):
- `auth.ts` (Login, session ops)
- `onboarding.ts` (Tenant creations)
- `temples.ts`

*Note: Dedicated finance and booking APIs are missing in the actual `app/api/` directory, meaning they rely entirely on Server Actions or are still in the design phase based on schema docs.*

## 6. Concurrency & Data Safety

**Database Transactions**: **Yes**. DB transactions are actively used in the codebase for safety. 
For instance, in `lib/temples-db.ts` `insertTempleFromPayload`, a PostgreSQL transaction (`BEGIN`, `COMMIT`, `ROLLBACK`) is correctly utilized to ensure a temple and its associated admin user are created atomically.

```typescript
await client.query("BEGIN");
try {
  // Insert Temple User
  // Insert Temple Record
  await client.query("COMMIT");
} catch(e) {
  await client.query("ROLLBACK");
}
```

**Payment Safety**: There are no Row-Level explicit locks (`SELECT FOR UPDATE`) defined currently within the codebase, meaning if concurrent donation or POS transactions happen against limited stock (e.g., event tickets), it could face race conditions.

## 7. Performance & Optimization

**Indexes**: 
- Configured heavily over `temple_id` composite lookups: e.g. `CREATE INDEX idx_transactions_type ON transactions(temple_id, type)`.
- **Created At**: There are **no specific indexes on `created_at`** directly out-of-the-box, but ranges involving time rely on composite indexes like `idx_transactions_date` which cover the necessary access patterns.

**Caching**: 
- **DB Level**: PostgreSQL connection pooling via the singleton `pool` in `lib/temples-db.ts` (`max: 20` limits).
- **App Level**: Relies heavily on Next.js intrinsic fetching memoization (Data Cache/React Server State) rather than an explicit caching layer like Redis.

## 8. Feature Registry / Subscription

**Feature Flag System**: A highly robust data-driven feature gating system is implemented.
The `features` table serves as a global registry of L1 (Module) and L2 (Features).

**Pricing Map**: 
Features are paired to plans via the `plan_features` junction table. Instead of hardcoding boolean plans, this table has:
- `is_enabled` (boolean).
- `limit_value` (integer) for usage caps (e.g., maximum monthly devotees).

The `FeatureGate` wrapper statically guards components on the frontend, checking allowed features via `/api/tenant-features`.

## 9. Deployment

**Optimization Target**: Optmized for **Vercel / Serverless deployments**. 
- It uses pure Next.js 15 App router.
- `ARCHITECTURE.md` explicitly defines the CDN/Edge strategy as "Vercel Edge CDN -> Next.js Serverless Functions -> Managed PostgreSQL".
- The `pg-config.ts` actively looks for `process.env.VERCEL` to determine the database connection resolving logic.

## Recommended Next Steps / Risks
1. **RLS (Row Level Security)**: Highly advise moving `temple_id = $x` logic onto Postgres RLS.
2. **Missing Finance Logic**: Implement strict `pg` level table locks or isolation levels for financial transactions, as manual queries are currently vulnerable to race conditions on the Node thread level.
3. **Immutability of Invoices**: The JSONB `items` array stores invoice artifacts efficiently, but an immutable ledger should be considered to comply with standard SaaS finance auditing.
