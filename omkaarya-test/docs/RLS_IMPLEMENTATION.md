# Implementing Row-Level Security (RLS) for Tenant Isolation

Below are the full PostgreSQL SQL scripts and the required Node.js (`pg`) integration to implement true database-level tenant isolation using Row-Level Security (RLS). This ensures that even if a developer forgets to add `WHERE temple_id = X` in their query, the database will automatically prevent cross-tenant data access.

## 1. SQL Scripts to Enable RLS

Run these SQL scripts against your PostgreSQL database to enable RLS and apply the tenant isolation policies to your targeted tables.

```sql
-- 1. Enable RLS on all tenant-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Create a reusable policy function (optional but keeps policies clean)
-- This checks if the user is a super admin OR if the tenant_id matches the session variable.
-- We use NULLIF and explicit casting to handle empty strings/nulls safely.
CREATE OR REPLACE FUNCTION check_tenant_isolation(row_temple_id integer)
RETURNS boolean AS $$
BEGIN
    RETURN (
        -- Allow if bypass is strictly 'true' (Super Admin)
        current_setting('app.bypass_rls', true) = 'true'
        OR 
        -- Otherwise, temple_id MUST match the current configured tenant
        (row_temple_id::text = current_setting('app.current_tenant', true))
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Apply the policy to the tables
-- Users Table
CREATE POLICY tenant_isolation_policy ON users
FOR ALL USING (check_tenant_isolation(temple_id));

-- Transactions Table
CREATE POLICY tenant_isolation_policy ON transactions
FOR ALL USING (check_tenant_isolation(temple_id));

-- Donations Table
CREATE POLICY tenant_isolation_policy ON donations
FOR ALL USING (check_tenant_isolation(temple_id));

-- Invoices Table
CREATE POLICY tenant_isolation_policy ON invoices
FOR ALL USING (check_tenant_isolation(temple_id));

-- Products Table
CREATE POLICY tenant_isolation_policy ON products
FOR ALL USING (check_tenant_isolation(temple_id));

-- Subscriptions Table
CREATE POLICY tenant_isolation_policy ON subscriptions
FOR ALL USING (check_tenant_isolation(temple_id));

-- 4. FORCE RLS (Security measure)
-- Even table owners (the migration user) will be forced to abide by RLS.
-- This ensures the Node.js 'DB_USER' doesn't accidentally bypass RLS.
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE donations FORCE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;
```

> [!WARNING]
> **Important:** With `FORCE ROW LEVEL SECURITY`, no query will return any rows from these tables unless `app.current_tenant` or `app.bypass_rls` is explicitly set in the active database session.

---

## 2. Node.js (pg) Integration Example

Because `pg` uses a connection pool, **you cannot simply use `pool.query('SET ...')` followed by another `pool.query('SELECT ...')`**. The second query might use a completely different connection.

To set the context safely per-request, you must:
1. Check out an individual `client` from the pool.
2. Start a transaction (`BEGIN`).
3. Set the context localized strictly to the current transaction.
4. Execute your queries.
5. `COMMIT` or `ROLLBACK` and release the client. 

### Implementation Helper (`lib/rls-db.ts`)

```typescript
import { Pool, PoolClient } from 'pg';
import { getPool } from './temples-db'; // Your existing getPool helper

type RlsContext = {
  tenantId?: string | number;
  isSuperAdmin?: boolean;
};

/**
 * Safely executes database queries under an isolated RLS transaction.
 */
export async function withTenantContext<T>(
  context: RlsContext,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Begin the transaction so settings are isolated
    await client.query("BEGIN");

    // 2. Safely apply RLS settings
    if (context.isSuperAdmin) {
      // The 'is_local = true' (3rd argument) ensures this setting clears on COMMIT/ROLLBACK
      await client.query("SELECT set_config('app.bypass_rls', 'true', true)");
    } else if (context.tenantId) {
      await client.query("SELECT set_config('app.bypass_rls', 'false', true)");
      await client.query("SELECT set_config('app.current_tenant', $1, true)", [
        context.tenantId.toString(),
      ]);
    } else {
      throw new Error("Either tenantId or isSuperAdmin must be provided for RLS.");
    }

    // 3. Execute the user's queries using the secured client
    const result = await callback(client);

    // 4. Commit successful queries
    await client.query("COMMIT");
    return result;

  } catch (error) {
    // 5. Rollback on failure
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // 6. Release connection back to the pool
    client.release();
  }
}
```

### Usage Examples in API Routes or Server Actions

**Example: Fetching Products Safely**
```typescript
import { withTenantContext } from '@/lib/rls-db';

export async function getProducts(tenantId: string) {
  return await withTenantContext({ tenantId }, async (client) => {
    // Look Ma, no WHERE temple_id = !
    // RLS handles the isolation automatically
    const res = await client.query('SELECT * FROM products ORDER BY name');
    return res.rows;
  });
}
```

**Example: Super Admin Bypassing RLS safely**
```typescript
import { withTenantContext } from '@/lib/rls-db';

export async function getAllInvoicesPlatformWide() {
  return await withTenantContext({ isSuperAdmin: true }, async (client) => {
    // This will fetch ALL invoices across ALL tenants 
    // because bypass_rls is true
    const res = await client.query('SELECT * FROM invoices LIMIT 1000');
    return res.rows;
  });
}
```

### Key Security Benefits Added:
1. **Developer Confidence**: You can now write `SELECT * FROM subscriptions` without fear of leaking data across tenants.
2. **Local Isolation**: By using `set_config('app.xxx', 'value', true)`, the variable is destroyed the exact moment the `COMMIT` or `ROLLBACK` executes, averting any pollution into the shared connection pool.
3. **No Code Redundancy**: You no longer need to pass `tenantId` deep into layered repository queries to append to the `WHERE` clause manually.
