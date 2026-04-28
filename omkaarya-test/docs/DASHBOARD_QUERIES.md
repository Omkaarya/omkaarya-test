# Dashboard Financial Queries & Performance Tuning

This document outlines the optimized SQL routines and Node.js API code needed to power high-speed financial dashboards using the massive, append-only `financial_ledger` table.

## 1. Optimized Dashboard Query (Node.js API)

By utilizing `created_at` boundaries and pagination, we prevent PostgreSQL from scanning millions of rows on dashboard load.

```typescript
import { getPool } from './temples-db';

interface DashboardQueryReq {
  tenantId: number;
  startDate: string;  -- ISO format e.g. "2026-04-01T00:00:00"
  endDate: string;    -- ISO format e.g. "2026-04-30T23:59:59"
  limit: number;
  offset: number;
}

interface FinancialSummary {
  operation_date: string;
  reference_type: string;
  total_revenue: string;
  total_refunds: string;
  net_balance: string;
}

export async function getDashboardFinancials(req: DashboardQueryReq) {
  const { tenantId, startDate, endDate, limit, offset } = req;
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    
    // 1. Maintain robust RLS Context
    await client.query("SELECT set_config('app.bypass_rls', 'false', true)");
    await client.query("SELECT set_config('app.current_tenant', $1, true)", [tenantId.toString()]);

    // 2. The Optimized Execution Query
    // We group by the strict DATE portion. Postgres planner will utilize 
    // the composite index (temple_id, created_at) to bucket these rapidly.
    const result = await client.query<FinancialSummary>(`
      SELECT 
          DATE(created_at) as operation_date,
          reference_type,
          SUM(debit_amount) as total_revenue,
          SUM(credit_amount) as total_refunds,
          SUM(debit_amount - credit_amount) as net_balance
      FROM financial_ledger
      WHERE created_at >= $1 
        AND created_at <= $2
      GROUP BY DATE(created_at), reference_type
      ORDER BY DATE(created_at) DESC, reference_type ASC
      LIMIT $3 OFFSET $4;
    `, [startDate, endDate, limit, offset]);

    await client.query("COMMIT");

    return result.rows.map(row => ({
      date: row.operation_date,
      type: row.reference_type,
      revenue: parseFloat(row.total_revenue),
      refunds: parseFloat(row.total_refunds),
      netBalance: parseFloat(row.net_balance)
    }));
    
  } finally {
    client.release();
  }
}
```

---

## 2. API Endpoint Definition (Next.js App Router)

You can wrap this function cleanly into an App Router endpoint (`app/api/dashboard/route.ts`).

```typescript
import { NextResponse } from 'next/server';
import { getDashboardFinancials } from '@/lib/dashboard-api';
// Assuming your middleware places tenant in headers
import { headers } from 'next/headers'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = Number(headers().get('x-tenant-id'));
  
  if (!tenantId) return NextResponse.json({ error: 'Tenant unauthenticated' }, { status: 401 });

  // Default to the last 30 days if params missing
  const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = searchParams.get('endDate') || new Date().toISOString();
  const page = Number(searchParams.get('page')) || 1;
  const limit = 50;

  try {
    const data = await getDashboardFinancials({
      tenantId,
      startDate,
      endDate,
      limit,
      offset: (page - 1) * limit
    });
    
    return NextResponse.json({
      success: true,
      data,
      page,
      limit
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

---

## 3. Performance & Optimization Configurations

If your temple generates 5,000 POS transactions per day, querying entire years directly will degrade UX eventually. 

### A. Critical Indexes Setup
To make the `WHERE created_at >= $1` clause execute in sub-10ms response times, the database **REQUIRES** a composite index matching the access pattern and RLS layer.

```sql
-- 1. Optimizes the date filters inherently scoped beneath tenant_id RLS
CREATE INDEX idx_ledger_perf_date 
ON financial_ledger(temple_id, created_at DESC);

-- 2. (Optional) Covering Index for maximum speed dashboards
-- This stores the balance values DIRECTLY inside the B-Tree leaf node 
-- preventing Postgres from having to look up the actual spreadsheet row.
CREATE INDEX idx_ledger_dashboard_cover 
ON financial_ledger(temple_id, created_at DESC) 
INCLUDE (reference_type, debit_amount, credit_amount);
```

### B. Why "Avoid Full Table Scanning" Works Here
- RLS natively injects an `AND temple_id = X` beneath the hood of every query. 
- Combined with `created_at >= $1`, PostgreSQL evaluates the `idx_ledger_perf_date` index and immediately physically discards jumping to any rows outside that month.
- **`OFFSET` Danger**: If a user asks for `PAGE 100` (`OFFSET 5000`), Postgres has to count 5,000 rows only to throw them away. For production dashboards, always enforce a maximum history limit (e.g., restrict dashboard queries to maximum 3 months per view), or force the user to provide strict start/end filters.

### C. Future Proofing (Materialized Views)
If you require "All Time" totals dynamically shown in the top header (e.g. Total Revenue Since 2026), calculating it constantly over millions of rows slows down. You should offload this to a Materialized View refreshed once daily.

```sql
CREATE MATERIALIZED VIEW mv_dashboard_totals AS
SELECT 
   temple_id,
   SUM(debit_amount) as all_time_revenue,
   SUM(credit_amount) as all_time_refunds
FROM financial_ledger
GROUP BY temple_id;

-- Index for the view lookup
CREATE UNIQUE INDEX idx_mv_dashboard ON mv_dashboard_totals(temple_id);

-- Refreshed nightly via a CRON
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_totals;
```
