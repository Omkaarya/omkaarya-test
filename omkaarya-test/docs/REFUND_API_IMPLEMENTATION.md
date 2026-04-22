# Cancellation and Refund Flow Implementations

This document provides the fully implemented API functions to safely reverse POS and Booking transactions. Just like the insertion schemas, these functions employ native PostgreSQL locks to guarantee that no multi-click attempts could accidentally refund the user twice or corrupt booking capacities.

## 1. Booking Cancellation API

Located in standard service files (e.g. `lib/refund-api.ts`):

```typescript
import { getPool } from './temples-db';

interface CancelBookingRequest {
  tenantId: number;
  userId: number;
  bookingId: number;
}

interface RefundResponse {
  success: boolean;
  message: string;
  refundedAmount: number;
}

/**
 * Safely cancels a booking, restoring time slot capacity and generating a ledger reversal.
 */
export async function cancelBooking(req: CancelBookingRequest): Promise<RefundResponse> {
  const { tenantId, userId, bookingId } = req;
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.bypass_rls', 'false', true)");
    await client.query("SELECT set_config('app.current_tenant', $1, true)", [tenantId.toString()]);

    // 1. Lock the booking specifically against simultaneous cancellation requests
    const bookingRes = await client.query(`
      SELECT slot_id, status, tickets_reserved, payment_amount 
      FROM bookings 
      WHERE id = $1 AND temple_id = $2
      FOR UPDATE
    `, [bookingId, tenantId]);

    if (bookingRes.rows.length === 0) {
      throw new Error(`Booking ID ${bookingId} not found.`);
    }

    const { slot_id, status, tickets_reserved, payment_amount } = bookingRes.rows[0];

    // 2. Validate it hasn't already been modified
    if (status === 'cancelled') {
      throw new Error("This booking has already been cancelled and refunded.");
    }

    // 3. Update the booking status to cancelled
    await client.query(`
      UPDATE bookings SET status = 'cancelled' WHERE id = $1
    `, [bookingId]);

    // 4. Mechanically release the capacity back to the slot pool
    await client.query(`
      UPDATE booking_slots 
      SET booked_count = booked_count - $1 
      WHERE id = $2
    `, [tickets_reserved, slot_id]);

    // 5. Append Ledger Reversal (Credit Outflow)
    const refundValue = parseFloat(payment_amount);
    if (refundValue > 0) {
       await client.query(`
         INSERT INTO financial_ledger (temple_id, reference_type, reference_id, debit_amount, credit_amount, created_by, notes)
         VALUES ($1, 'booking_refund', $2, 0, $3, $4, $5)
       `, [tenantId, bookingId, refundValue, userId, 'Booking Cancelled - Full Refund']);
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: "Booking successfully cancelled and slots freed.",
      refundedAmount: refundValue
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

---

## 2. POS Refund API

This function reverses a POS transaction seamlessly, crediting the original value back from the financial ledger. 

*(Note: Restoring inventory items back to `products` is deliberately omitted per standard accounting rules regarding consumed items like Prasadham or perishables, but can be added similarly by mapping over the `items` JSONB array if your specific temple requires returning non-perishables).*

```typescript
interface CancelPosRequest {
  tenantId: number;
  userId: number;
  orderId: number;
}

/**
 * Safely refunds a POS Sales Order
 */
export async function refundPosOrder(req: CancelPosRequest): Promise<RefundResponse> {
  const { tenantId, userId, orderId } = req;
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.bypass_rls', 'false', true)");
    await client.query("SELECT set_config('app.current_tenant', $1, true)", [tenantId.toString()]);

    // 1. Pessimistic row locking on the specific order
    const orderRes = await client.query(`
      SELECT status, total_amount 
      FROM pos_orders 
      WHERE id = $1 AND temple_id = $2
      FOR UPDATE
    `, [orderId, tenantId]);

    if (orderRes.rows.length === 0) {
      throw new Error(`POS Order ID ${orderId} not found.`);
    }

    const { status, total_amount } = orderRes.rows[0];

    // 2. State Guard validation
    if (status === 'refunded') {
      throw new Error("This order has already been successfully refunded.");
    }

    // 3. Cancel the master order state
    await client.query(`
      UPDATE pos_orders SET status = 'refunded' WHERE id = $1
    `, [orderId]);

    // 4. Issue the strict Ledger Reversal (Credit Outflow)
    const refundValue = parseFloat(total_amount);
    await client.query(`
      INSERT INTO financial_ledger (temple_id, reference_type, reference_id, debit_amount, credit_amount, created_by, notes)
      VALUES ($1, 'pos_refund', $2, 0, $3, $4, $5)
    `, [tenantId, orderId, refundValue, userId, 'POS Sale Refunded - Full Counter Reversal']);

    await client.query("COMMIT");

    return {
      success: true,
      message: "POS Order refunded successfully.",
      refundedAmount: refundValue
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

---

## 3. Explanations of Security Factors

### Why `SELECT ... FOR UPDATE` is crucial here:
Assume a Temple staff member and an Admin simultaneously hit "Refund" on the exact same booking ticket on two different iPads.
- Thread A executes `SELECT ... FOR UPDATE`. Thread B fires instantly too but is mechanically frozen by Postgres.
- Thread A continues, seeing `status === 'confirmed'`, issues the ledger rewrite, sets `status = 'cancelled'`, and commits.
- Thread B unlocks implicitly when Thread A's commit completes.
- Thread B then reads the freshly modified row where `status === 'cancelled'`. It proceeds to line 44, correctly fails the `if (status === 'cancelled')` state-guard, throws the error, and stops entirely. 

**Without `FOR UPDATE`**, Thread B might evaluate `status === 'confirmed'` while Thread A is concurrently building the ledger query. Both would commit their logic leading to two identical ledger refund records (Double Crediting the temple's loss).
