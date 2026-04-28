# High-Concurrency Booking API Implementation

This document provides the fully implemented, concurrency-safe Booking engine function. Unlike standard read-then-write patterns, this uses PostgreSQL's native atomic `UPDATE` condition to ensure zero double-bookings regardless of kiosk or web traffic scale, completely avoiding slow `SELECT FOR UPDATE` table lock contention.

## 1. Full API Implementation

You can structure this inside `lib/booking-api.ts` or as part of a Next.js Server Action (`app/actions/bookings.ts`).

```typescript
import { PoolClient } from 'pg';
import { getPool } from './temples-db'; // Adjust path to your pg pool connection

interface BookingRequest {
  tenantId: number;
  userId: number; // Staff filling it out or 0 for public
  slotId: number;
  ticketsRequested: number;
  customerName: string;
  customerPhone?: string;
  paymentAmount: number;
  idempotencyKey: string;
}

interface BookingResponse {
  success: boolean;
  bookingId: number;
  totalPaid: number;
  message: string;
  isDuplicateRetry: boolean;
}

/**
 * Executes a concurrency-resistant booking transaction.
 */
export async function processBookingReservation(req: BookingRequest): Promise<BookingResponse> {
  const { tenantId, userId, slotId, ticketsRequested, customerName, customerPhone, paymentAmount, idempotencyKey } = req;
  
  if (ticketsRequested <= 0) {
      throw new Error("Must reserve at least 1 ticket.");
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    // BEGIN TRANSACTION
    await client.query("BEGIN");

    // Enforce Tenant isolation context (RLS Setup)
    await client.query("SELECT set_config('app.bypass_rls', 'false', true)");
    await client.query("SELECT set_config('app.current_tenant', $1, true)", [tenantId.toString()]);

    // 1. Atomic Slot Reservation (No SELECT FOR UPDATE Required!)
    // This strictly updates only if capacity holds true natively in the Postgres engine.
    const slotRes = await client.query(`
      UPDATE booking_slots 
      SET booked_count = booked_count + $1
      WHERE id = $2 
        AND temple_id = $3
        AND capacity >= booked_count + $1
      RETURNING id
    `, [ticketsRequested, slotId, tenantId]);

    // 2. Failure Detection (Postgres prevented the update)
    if (slotRes.rowCount === 0) {
      throw new Error(`Slot is fully booked or there is insufficient remaining capacity for ${ticketsRequested} tickets.`);
    }

    // 3. Insert Booking Record
    // Uniqueness mapped to (temple_id, idempotency_key) protects from double submissions.
    const bookingRes = await client.query(`
      INSERT INTO bookings (temple_id, idempotency_key, slot_id, customer_name, customer_phone, tickets_reserved, payment_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [tenantId, idempotencyKey, slotId, customerName, customerPhone, ticketsRequested, paymentAmount]);

    const bookingId = bookingRes.rows[0].id;

    // 4. Financial Ledger Logging (Optional prepaid amounts)
    if (paymentAmount > 0) {
      await client.query(`
        INSERT INTO financial_ledger (temple_id, reference_type, reference_id, debit_amount, credit_amount, created_by, notes)
        VALUES ($1, 'booking', $2, $3, 0, $4, $5)
      `, [tenantId, bookingId, paymentAmount, userId > 0 ? userId : null, 'Prepaid Booking Captured']);
    }

    // COMMIT TRANSACTION
    await client.query("COMMIT");

    return {
      success: true,
      bookingId,
      totalPaid: paymentAmount,
      message: "Booking confirmed successfully.",
      isDuplicateRetry: false
    };

  } catch (error: any) {
    // ABORT TRANSACTION
    await client.query("ROLLBACK");

    // 5. Handling Network Retries / Duplicate Submissions
    if (error.code === '23505') { // PostgreSQL unique_violation code
      // We safely fetch the pre-existing booking because the UI submitted an identical idempotencyKey
      return await recoverDuplicateBooking(client, tenantId, idempotencyKey);
    }

    // Pass capacity/capacity-full errors straight to the UI
    throw error;
  } finally {
    // Release pool connection back to Postgres
    client.release();
  }
}

/**
 * Helper to gracefully resolve a double-click UI glitch.
 */
async function recoverDuplicateBooking(
  client: PoolClient, 
  tenantId: number, 
  idempotencyKey: string
): Promise<BookingResponse> {
  // Re-apply tenant context purely for the read
  await client.query("SELECT set_config('app.current_tenant', $1, true)", [tenantId.toString()]);
  
  const existingRes = await client.query(`
    SELECT id, payment_amount 
    FROM bookings 
    WHERE temple_id = $1 AND idempotency_key = $2
  `, [tenantId, idempotencyKey]);

  if (existingRes.rows.length === 0) {
    throw new Error("Idempotency conflict occurred, but record couldn't be traced.");
  }

  const existing = existingRes.rows[0];

  return {
    success: true,
    bookingId: existing.id,
    totalPaid: parseFloat(existing.payment_amount),
    message: "Recovered duplicate booking request successfully.",
    isDuplicateRetry: true
  };
}
```

---

## 2. API Error Handling Extracted

### Concurrency / Slot Full Handling
If two users race for the last 2 seats and thread A locks them, thread B triggers `UPDATE ... WHERE capacity >= booked_count + $1`. Since thread A's transaction commits, thread B evaluates `capacity >= 100 + 2` naturally resulting in `FALSE`. The `UPDATE` skips the row, returning `rowCount === 0`.
Our catch triggers:
```json
{
  "error": "Slot is fully booked or there is insufficient remaining capacity for 2 tickets."
}
```

### Double Charging (`Duplicate UI Button Clicks`) protection
When the form is double submitted, `(temple_id, idempotency_key)` fails immediately on `INSERT`. Because it is trapped natively in `catch(error: any) { if (error.code === '23505') }`, we bypass causing user-facing failure entirely and return them exactly to the confirmation screen they *should* have seen initially.

---

## 3. Example API Responses

**(A) Standard Clean Processing:**
```json
{
  "success": true,
  "bookingId": 40992,
  "totalPaid": 850.00,
  "message": "Booking confirmed successfully.",
  "isDuplicateRetry": false
}
```

**(B) Client Re-Submitted Crash / Duplicate Key Recovered:**
```json
{
  "success": true,
  "bookingId": 40992,
  "totalPaid": 850.00,
  "message": "Recovered duplicate booking request successfully.",
  "isDuplicateRetry": true
}
```
