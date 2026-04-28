# Production-Grade POS API Implementation

This document provides the fully implemented, production-safe POS Engine function for Omkaarya. It incorporates strict inventory locking (`SELECT FOR UPDATE`), deadlock prevention (via ID sorting), raw `pg` database transactions, and foolproof idempotency handling to prevent double charging.

## 1. Full API Implementation 

You can drop this directly into your application (e.g., `lib/pos-api.ts` or `app/actions/pos.ts`):

```typescript
import { PoolClient } from 'pg';
import { getPool } from './temples-db'; // Adjust path to your pg pool connection

interface CartItem {
  type: 'product' | 'donation';
  productId?: number;  // Only required if type === 'product'
  amount: number;      // Unit price for products, or total amount for donation
  quantity: number;
}

interface PosRequest {
  tenantId: number;
  userId: number;
  idempotencyKey: string;
  cartItems: CartItem[];
}

interface PosResponse {
  success: boolean;
  orderId: number;
  totalAmount: number;
  message: string;
  isDuplicateRetry: boolean;
}

/**
 * Executes a fully safe, ACID compliant POS transaction.
 */
export async function processPosTransaction(req: PosRequest): Promise<PosResponse> {
  const { tenantId, userId, idempotencyKey, cartItems } = req;
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Calculate total expected amount upfront
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.amount * item.quantity;
    });

    // 2. Filter products and pre-sort by ID to prevent Deadlocks
    // Always locking rows in a deterministic order ensures no two POS threads deadlock
    const productItems = cartItems
      .filter(i => i.type === 'product' && i.productId)
      .sort((a, b) => a.productId! - b.productId!);

    // BEGIN TRANSACTION
    await client.query("BEGIN");

    // Enforce Tenant isolation context (RLS Setup)
    await client.query("SELECT set_config('app.bypass_rls', 'false', true)");
    await client.query("SELECT set_config('app.current_tenant', $1, true)", [tenantId.toString()]);

    // 3. Lock & Validate Inventory
    for (const item of productItems) {
      // FOR UPDATE locks this row exactly so no other threads can sell it
      const stockRes = await client.query(`
        SELECT stock_quantity, name 
        FROM products 
        WHERE id = $1 AND temple_id = $2
        FOR UPDATE
      `, [item.productId, tenantId]);

      if (stockRes.rows.length === 0) {
        throw new Error(`Product ID ${item.productId} not found.`);
      }

      const { stock_quantity, name } = stockRes.rows[0];

      if (stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${name}. Available: ${stock_quantity}, Requested: ${item.quantity}`);
      }

      // 4. Deduct Inventory Safely
      await client.query(`
        UPDATE products 
        SET stock_quantity = stock_quantity - $1 
        WHERE id = $2 
          AND stock_quantity >= $1
      `, [item.quantity, item.productId]);
    }

    // 5. Insert POS Order
    const orderRes = await client.query(`
      INSERT INTO pos_orders (temple_id, idempotency_key, total_amount, items, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [tenantId, idempotencyKey, totalAmount, JSON.stringify(cartItems), userId]);
    
    const orderId = orderRes.rows[0].id;

    // 6. Insert into Unified Financial Ledger
    await client.query(`
      INSERT INTO financial_ledger (temple_id, reference_type, reference_id, debit_amount, credit_amount, created_by, notes)
      VALUES ($1, 'pos', $2, $3, 0, $4, $5)
    `, [tenantId, orderId, totalAmount, userId, 'POS Sale']);

    // COMMIT TRANSACTION
    await client.query("COMMIT");

    return {
      success: true,
      orderId,
      totalAmount,
      message: "POS Transaction Completed Successfully",
      isDuplicateRetry: false
    };

  } catch (error: any) {
    // ABORT TRANSACTION
    await client.query("ROLLBACK");

    // 7. Handle Idempotency / Duplicate Key Violations gracefully
    if (error.code === '23505') { // PostgreSQL unique_violation error code
      // Safe to fetch outside transaction, order already exists and is immutable
      return await recoverDuplicateOrder(client, tenantId, idempotencyKey);
    }

    // Forward stock issues or runtime errors
    throw error;
  } finally {
    // Release pool connection back to Postgres
    client.release();
  }
}

/**
 * Secondary helper to recover orders when the frontend accidentally double-clicks 
 * and triggers an idempotency collision.
 */
async function recoverDuplicateOrder(
  client: PoolClient, 
  tenantId: number, 
  idempotencyKey: string
): Promise<PosResponse> {
  // Re-apply tenant context purely for the read
  await client.query("SELECT set_config('app.current_tenant', $1, true)", [tenantId.toString()]);
  
  const existingRes = await client.query(`
    SELECT id, total_amount FROM pos_orders 
    WHERE temple_id = $1 AND idempotency_key = $2
  `, [tenantId, idempotencyKey]);

  if (existingRes.rows.length === 0) {
    throw new Error("Idempotency conflict occurred, but record couldn't be traced.");
  }

  const existing = existingRes.rows[0];

  return {
    success: true,
    orderId: existing.id,
    totalAmount: parseFloat(existing.total_amount),
    message: "Recovered duplicate request successfully.",
    isDuplicateRetry: true
  };
}
```

---

## 2. Implementation Concepts Explained

### 1. **Deadlock Prevention (Pre-Sorting)**
```typescript
const productItems = cartItems.filter(...).sort((a, b) => a.productId! - b.productId!);
```
Without sorting, Thread A might attempt locking `[Product 5, Product 10]`, while Thread B attempts `[Product 10, Product 5]`. If executed concurrently, they will lock the database completely. Sorting enforces a global acquisition hierarchy strictly terminating the potential for Deadlocks underneath high-concurrency Node.js execution.

### 2. Idempotency `(23505)` Handling Mechanism 
When a network connection is spotty, a UI might fire exactly the same `POST` request twice.
- The PostgreSQL Unique constraint on `(temple_id, idempotency_key)` fails the duplicate `INSERT`, immediately triggering a `ROLLBACK` on the second unneeded transaction pool.
- The `catch` block identifies `23505`, recovers the actual already-processed ID natively, and returns normally. To the frontend, it appears to be a frictionless success.

### 3. Example JSON Response (Frontend Consumption)
When called by a NextRoute or Server Action, the API structurally responds precisely.

**(A) Success First Try:**
```json
{
  "success": true,
  "orderId": 8021,
  "totalAmount": 1500.00,
  "message": "POS Transaction Completed Successfully",
  "isDuplicateRetry": false
}
```

**(B) Network Retry Success (Crashed UI requested again):**
```json
{
  "success": true,
  "orderId": 8021,
  "totalAmount": 1500.00,
  "message": "Recovered duplicate request successfully.",
  "isDuplicateRetry": true
}
```

**(C) Insufficient Stock (Error Thrown natively):**
```json
{
  "error": "Insufficient stock for Kumkum Packet 50g. Available: 4, Requested: 10"
}
```
