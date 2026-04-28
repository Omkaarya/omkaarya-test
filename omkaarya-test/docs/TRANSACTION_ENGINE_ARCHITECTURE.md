# Unified Transaction Engine Architecture

This document defines the high-reliability, production-grade transaction engine combining Point-of-Sale (POS) and Booking systems. It perfectly extends the existing RLS, Ledger, and PostgreSQL environments to handle massive concurrency without inventory negative stocks, double payments, or double-booked slots.

---

## 1. Architecture Diagram

```mermaid
graph TD
    Client[Client POS / Web Kiosk] -->|Request + Idempotency Key| API[Next.js API / Actions]
    API -->|Txn Wrapper with RLS| DB[(PostgreSQL)]

    subgraph Database Transaction (BEGIN ... COMMIT)
        DB --> Lock[Row-Level Locks: SELECT FOR UPDATE]
        Lock --> InvCheck[Check Constraints: Stock/Capacity]
        InvCheck --> InsPOS[Insert: pos_orders / bookings]
        InsPOS --> DedInv[Update: products / booking_slots]
        DedInv --> InsLedger[Insert: financial_ledger]
    end

    InsLedger -->|COMMIT| DB
    DB --> |Receipt/Ticket Info| API
    API --> Client
```

---

## 2. PostgreSQL Schema Additions

To support idempotency, locking, and time-based slots cleanly apart from pure invoices, we extend the system with the following tables.

```sql
-- 1. POS Engine Setup
CREATE TABLE pos_orders (
    id SERIAL PRIMARY KEY,
    temple_id INTEGER REFERENCES temples(id) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL, -- Core safety feature
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'completed', -- 'completed', 'refunded'
    items JSONB NOT NULL, -- Hybrid cart (donations + products) stored as JSON snapshot
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS & Idempotency logic
ALTER TABLE pos_orders ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_pos_orders_idempotency ON pos_orders(temple_id, idempotency_key);
CREATE POLICY tenant_isolation_policy ON pos_orders FOR ALL USING (check_tenant_isolation(temple_id));
ALTER TABLE pos_orders FORCE ROW LEVEL SECURITY;

-- 2. Booking Engine Setup
CREATE TABLE booking_slots (
    id SERIAL PRIMARY KEY,
    temple_id INTEGER REFERENCES temples(id) NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- 'pooja', 'seva', 'hall'
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER NOT NULL,
    booked_count INTEGER DEFAULT 0,
    price_per_slot DECIMAL(15,2) DEFAULT 0.00,
    CHECK (booked_count <= capacity) -- Native constraint defense
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    temple_id INTEGER REFERENCES temples(id) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    slot_id INTEGER REFERENCES booking_slots(id) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    tickets_reserved INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled'
    payment_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Setup
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON booking_slots FOR ALL USING (check_tenant_isolation(temple_id));
ALTER TABLE booking_slots FORCE ROW LEVEL SECURITY;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_bookings_idempotency ON bookings(temple_id, idempotency_key);
CREATE POLICY tenant_isolation_policy ON bookings FOR ALL USING (check_tenant_isolation(temple_id));
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;
```

---

## 3. Transaction Flows

### Part A: Submitting a POS Application Flow
1. **API receives request**: Includes `cartItems` and `idempotencyKey`.
2. **Transaction bounds begin**: Initializes `withTenantContext`.
3. **Lock inventory**: Explicitly lock the required products in natural order (to avoid deadlocks).
4. **Validate**: Fail immediately if requested quantities exceed stock.
5. **Deduct Inventory**: Process `UPDATE products ...`.
6. **Insert POS Invoice**: Record into `pos_orders`.
7. **Append Ledger**: Insert into `financial_ledger` (`debit_amount`).
8. **Commit**.

### Part B: Reserving a POOJA Time Slot 
1. **API receives request**: Includes `slotId`, `quantity`, `idempotencyKey`.
2. **Transaction bounds begin**.
3. **Pessimistic Update Booking**: Attempt an atomic update (`UPDATE booking_slots SET booked_count = booked_count + X WHERE condition RETURNING id`).
4. **Validate constraint**: If 0 rows updated, it implies slot is full.
5. **Insert Booking**: Write to `bookings`.
6. **Append Ledger**: Insert into `financial_ledger`.
7. **Commit**.

---

## 4. SQL Examples for Critical Paths

### POS Safe Insert Flow (Node.js/SQL hybrid)
```typescript
await withTenantContext({ tenantId }, async (client) => {
  // 1. Sort items by ID internally to prevent Database Deadlocks during mass locks
  const sortedItems = items.sort((a, b) => a.productId - b.productId);
  
  for (const item of sortedItems) {
    if (item.type === 'product') {
      // 2. Lock the rows explicitly.
      // FOR UPDATE blocks other concurrent API requests from checking out these exact items.
      const stockRes = await client.query(`
        SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE
      `, [item.productId]);
      
      if (stockRes.rows[0].stock_quantity < item.quantity) throw new Error("Insufficient stock");
      
      // 3. Deduct
      await client.query(`
        UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2
      `, [item.quantity, item.productId]);
    }
  }

  // 4. Create POS Order
  const orderRes = await client.query(`
    INSERT INTO pos_orders (temple_id, idempotency_key, total_amount, items) 
    VALUES ($1, $2, $3, $4) RETURNING id
  `, [tenantId, idempotencyKey, cartTotal, JSON.stringify(items)]);

  // 5. Append Ledger
  await client.query(`
    INSERT INTO financial_ledger (temple_id, reference_type, reference_id, debit_amount, credit_amount)
    VALUES ($1, 'pos', $2, $3, 0)
  `, [tenantId, orderRes.rows[0].id, cartTotal]);
});
```

### High-Concurrency Booking Lock
Preventing double-booking without creating heavy table locks.
```typescript
await withTenantContext({ tenantId }, async (client) => {
  // 1. Atomic compare-and-swap style update. 
  // By enforcing checking within the UPDATE query, we prevent race conditions.
  const slotRes = await client.query(`
    UPDATE booking_slots 
    SET booked_count = booked_count + $1
    WHERE id = $2 
      AND capacity >= booked_count + $1
    RETURNING id
  `, [ticketsRequested, slotId]);

  if (slotRes.rowCount === 0) {
    throw new Error("Slot full or unavailable. Booking aborted.");
  }

  // 2. Book
  const bookRes = await client.query(`
    INSERT INTO bookings (temple_id, idempotency_key, slot_id, customer_name, tickets_reserved, payment_amount)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tenantId, idempotencyKey, slotId, name, ticketsRequested, amount]);

  // 3. Ledger
  if (amount > 0) {
     await client.query(`
       INSERT INTO financial_ledger (temple_id, reference_type, reference_id, debit_amount, credit_amount)
       VALUES ($1, 'booking', $2, $3, 0)
     `, [tenantId, bookRes.rows[0].id, amount]);
  }
});
```

### Ledger Reversal Query
```sql
-- e.g., A booking is cancelled
BEGIN;

-- 1. Free up slot capacity
UPDATE booking_slots SET booked_count = booked_count - 1 WHERE id = $slot;

-- 2. Mark booking cancelled
UPDATE bookings SET status = 'cancelled' WHERE id = $booking_id;

-- 3. Inverting ledger entry strictly via append-only
INSERT INTO financial_ledger (temple_id, reference_type, reference_id, debit_amount, credit_amount, notes)
VALUES ($tenant, 'booking', $booking_id, -50.00, 0, 'Reversal: Booking Cancelled');

COMMIT;
```

---

## 5. Concurrency Safety Explanation

To make this fintech-level production grade:

1. **`SELECT FOR UPDATE` vs Atomic `UPDATE`**:
   - For inventory (POS), we use `SELECT FOR UPDATE` because multiple physical items must be locked and verified together before continuing. It guarantees no two threads can deduct the same final items.
   - For Bookings, we use **Atomic UPDATE conditions**. We don't read and *then* update. We execute `UPDATE ... WHERE capacity >= booked + requested`. Postgres natively isolates this statement, meaning even under 100 simultaneous hits per second, it will perfectly sequentially lock the single slot row, grant exactly the available slots, and return `rowCount = 0` to the losers smoothly.
2. **Deadlock Avoidance Strategies**: 
   When locking multiple rows (like a 10-item POS cart), threads locking rows in inverse orders creates a deadlock. The code explicitly pre-sorts item IDs (`sort((a,b) => a.id - b.id)`) ensuring all concurrent processes acquire locks globally in identical order.
3. **Idempotency Check (`idx_idempotency`)**:
   Retry logic in frontend UI leads to double spending. By making `(temple_id, idempotency_key)` a severe Unique Index constraint natively on DB tables, any retry of the POS or Booking checkout hits a Postgres `23505 duplicate key block`, aborting the backend logic safely natively.

---

## 6. Common Failure Cases

| Failure Case | Native System Response |
| :--- | :--- |
| **Network dies between DB update & User response** | Handled by **Idempotency Keys**. Client repeats request on reconnect. DB rejects `23505 unique constraint`, Application logic returns "Success (Already Booked)". No duplicate charge. |
| **Two buyers checkout the final Pooja ticket at the exact millisecond** | Handled by **Atomic Update Check**. Thread A wins the lock, updating capacity to max. Thread B triggers sequentially after A releases lock, fails the `WHERE capacity >= booked_count` clause mechanically, routing B to "Sold out" gracefully instead of -1 reservations. |
| **Backend crash halfway through a POS save** | Handled by PostgreSQL **Transactions (`BEGIN/ROLLBACK`)**. If Node dies after updating inventory but before saving the ledger, the pool connection cleanly snaps, issuing a network `SIGABRT`/rollback natively. The inventory floats right back instantly. | 
| **A developer accidentally writes an update ledger script** | Prevented by our **`enforce_append_only_ledger`** Trigger logic inside Postgres. The DB flat out errors and refuses, demanding an inverted insert instead via a true double-entry reflection. |
