# Ledger-Based Finance Architecture

This document outlines a robust, fintech-grade Ledger architecture for Omkaarya. Transitioning from a \"direct update model\" to an \"immutable ledger model\" ensures absolute financial safety, auditability, and historical integrity for all transactions within a temple.

## 1. PostgreSQL Schema

This architecture relies on a central `financial_ledger` table. We enforce immutability strictly at the database level using PostgreSQL triggers, ensuring that no developer or background process can ever alter or delete a ledger entry.

```sql
-- 1. Create the unified ledger table
CREATE TABLE financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temple_id INTEGER REFERENCES temples(id),
    reference_type VARCHAR(50) NOT NULL, -- e.g., 'donation', 'invoice', 'expense', 'pos', 'booking'
    reference_id INTEGER NOT NULL,       -- ID linking to the original table
    debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,  -- Money IN (Asset increase)
    credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Money OUT (Asset decrease)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    notes TEXT
);

-- 2. Performance & RLS Indexes
CREATE INDEX idx_ledger_temple ON financial_ledger(temple_id);
CREATE INDEX idx_ledger_reference ON financial_ledger(reference_type, reference_id);
-- Index for fast balance calculations and temporal queries
CREATE INDEX idx_ledger_date ON financial_ledger(temple_id, created_at DESC);

-- 3. Enable RLS (Compatible with previous setup)
ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON financial_ledger
FOR ALL USING (check_tenant_isolation(temple_id));
ALTER TABLE financial_ledger FORCE ROW LEVEL SECURITY;

-- 4. Database-Level Immutability (Fintech Requirement)
-- This trigger completely bans UPDATE and DELETE operations on the ledger.
CREATE OR REPLACE FUNCTION prevent_ledger_modifications()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger entries are strictly immutable. Please create a reversal entry instead.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_append_only_ledger
BEFORE UPDATE OR DELETE ON financial_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modifications();
```

---

## 2. Insert Flow Examples (Node.js)

When interacting with the ledger, all operations must be wrapped in a transaction using the RLS helper we designed previously (`withTenantContext`). 

> **Accounting Rule of Thumb (Cashbook style):**
> *   **Debit:** Money entering the temple (Asset increase).
> *   **Credit:** Money leaving the temple (Asset decrease).

### A. Example: Donation Flow (Money IN)
```typescript
import { withTenantContext } from '@/lib/rls-db';

export async function processDonation(tenantId: number, userId: number, donationData: any) {
  return await withTenantContext({ tenantId }, async (client) => {
    // 1. Insert into specific domain table
    const donationRes = await client.query(`
      INSERT INTO donations (temple_id, donor_name, amount, donation_date)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, amount
    `, [tenantId, donationData.name, donationData.amount]);
    
    const donation = donationRes.rows[0];

    // 2. Insert into unified ledger mapping the reference
    await client.query(`
      INSERT INTO financial_ledger (
        temple_id, reference_type, reference_id, debit_amount, credit_amount, created_by, notes
      ) VALUES ($1, 'donation', $2, $3, 0, $4, $5)
    `, [tenantId, donation.id, donation.amount, userId, 'Donation Received']);

    return donation.id;
  });
}
```

### B. Example: POS Sale Flow (Money IN)
```typescript
export async function processPosSale(tenantId: number, userId: number, invoiceData: any) {
  return await withTenantContext({ tenantId }, async (client) => {
    // 1. Insert into Invoices
    const invoiceRes = await client.query(`
      INSERT INTO invoices (temple_id, invoice_number, total, items)
      VALUES ($1, $2, $3, $4)
      RETURNING id, total
    `, [tenantId, invoiceData.number, invoiceData.total, JSON.stringify(invoiceData.items)]);
    
    const invoice = invoiceRes.rows[0];

    // 2. Add ledger entry
    await client.query(`
      INSERT INTO financial_ledger (
        temple_id, reference_type, reference_id, debit_amount, credit_amount, created_by, notes
      ) VALUES ($1, 'pos', $2, $3, 0, $4, $5)
    `, [tenantId, invoice.id, invoice.total, userId, 'POS Sale Captured']);

    return invoice.id;
  });
}
```

### C. Example: Reversal Flow (Refund / Cancellation)
Because the ledger is heavily protected by triggers prohibiting `UPDATE/DELETE`, mistakes or refunds must be corrected using a **negative reversal entry** or an **inverting entry**. Below is the negative entry approach (creating an identical row with negative amounts).

```typescript
export async function refundDonation(tenantId: number, userId: number, donationId: number) {
  return await withTenantContext({ tenantId }, async (client) => {
    // 1. Get original donation
    const origRes = await client.query('SELECT amount FROM donations WHERE id = $1', [donationId]);
    const originalAmount = origRes.rows[0].amount;

    // 2. Optional: Mark donation as refunded in the domain table
    // (This is permitted because only the ledger is immutable)
    await client.query('UPDATE donations SET status = $1 WHERE id = $2', ['refunded', donationId]);

    // 3. Insert Reversal Entry into Ledger (Negative Debit restores balance)
    await client.query(`
      INSERT INTO financial_ledger (
        temple_id, reference_type, reference_id, debit_amount, credit_amount, created_by, notes
      ) VALUES ($1, 'donation', $2, $3, 0, $4, $5)
    `, [
      tenantId, 
      donationId, 
      -Math.abs(originalAmount), // Negative entry mapping
      userId, 
      'REVERSAL: Refunded to original payment method'
    ]);
  });
}
```

---

## 3. Querying & Validation Examples

Because all financial movements flow into a single append-only table, generating realtime, reliable balances requires summing the ledger without querying 4-5 disparate tables.

### Query: Calculate Net Balance per Temple
This calculates the total fluid assets available to the temple at any given millisecond. Note that RLS automatically handles filtering by `temple_id` implicitly.

```sql
SELECT 
    COALESCE(SUM(debit_amount) - SUM(credit_amount), 0) AS current_balance,
    COALESCE(SUM(debit_amount), 0) AS total_inflows,
    COALESCE(SUM(credit_amount), 0) AS total_outflows
FROM financial_ledger;
```

### Query: Calculate Income grouped by Reference Type (Monthly)
```sql
SELECT 
    reference_type,
    SUM(debit_amount) AS total_revenue
FROM financial_ledger
WHERE created_at >= date_trunc('month', CURRENT_DATE)
  AND debit_amount > 0 -- Only looking at income streams
GROUP BY reference_type
ORDER BY total_revenue DESC;
```

---

## 4. Performance & Architectural Notes

*   **Indexes:** The combination of `idx_ledger_temple` and `idx_ledger_date` ensures that balance calculations and end-of-month reconciliations run instantly, even with millions of rows per temple. Postgres handles `SUM()` operations over indexed partitions exceptionally well.
*   **Decoupling:** By keeping domain models (who donated, what was purchased) in `donations/invoices` and the pure financial state in `financial_ledger`, your application logic remains unbloated.
*   **Database Triggers over App Logic:** While you could theoretically prevent deletions in your Next.js application layer, doing so via Postgres Triggers ensures strict auditing compliance. Even if a developer connects via TablePlus or psql locally, they physically cannot falsify the ledger without dropping the trigger.
*   **RLS Native:** The addition respects the RLS strategies configured in the previous step, maintaining pure tenant safety dynamically without exposing raw tenant IDs. 
