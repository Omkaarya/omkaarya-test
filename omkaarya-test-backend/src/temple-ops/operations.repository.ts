import type { Pool } from "pg";

// ── Devotees ─────────────────────────────────────────────────────────

export type DevoteeRow = {
  id: string;
  full_name: string;
  phone: string | null;
  phone_country_code: string | null;
  email: string | null;
  address: Record<string, unknown>;
  date_of_birth: string | null;
  gotra: string | null;
  rashi: string | null;
  nakshatra: string | null;
  notes: string | null;
};

export async function listDevotees(pool: Pool, search?: string): Promise<DevoteeRow[]> {
  const q = (search ?? "").trim();
  const params: unknown[] = [];
  let where = "WHERE deleted_at IS NULL";
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where += ` AND (LOWER(full_name) LIKE $1 OR LOWER(COALESCE(phone, '')) LIKE $1 OR LOWER(COALESCE(email, '')) LIKE $1)`;
  }
  const { rows } = await pool.query<DevoteeRow>(
    `SELECT id::text AS id, full_name, phone, phone_country_code, email,
            address, date_of_birth::text AS date_of_birth,
            gotra, rashi, nakshatra, notes
       FROM devotees ${where}
      ORDER BY created_at DESC
      LIMIT 500`,
    params
  );
  return rows;
}

export type DevoteeInput = {
  fullName: string;
  phone: string | null;
  phoneCountryCode: string | null;
  email: string | null;
  address: Record<string, unknown>;
  dateOfBirth: string | null;
  gotra: string | null;
  rashi: string | null;
  nakshatra: string | null;
  notes: string | null;
};

export async function insertDevotee(pool: Pool, input: DevoteeInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO devotees (full_name, phone, phone_country_code, email, address,
                           date_of_birth, gotra, rashi, nakshatra, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id::text AS id`,
    [
      input.fullName.trim(),
      input.phone?.trim() || null,
      input.phoneCountryCode?.trim() || null,
      input.email?.trim() || null,
      input.address ?? {},
      input.dateOfBirth || null,
      input.gotra?.trim() || null,
      input.rashi?.trim() || null,
      input.nakshatra?.trim() || null,
      input.notes?.trim() || null,
    ]
  );
  return { id: rows[0]!.id };
}

export async function updateDevotee(
  pool: Pool,
  id: string,
  input: Partial<DevoteeInput>
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  const map: Array<[keyof DevoteeInput, string, () => unknown]> = [
    ["fullName", "full_name", () => input.fullName?.trim()],
    ["phone", "phone", () => input.phone?.trim() || null],
    ["phoneCountryCode", "phone_country_code", () => input.phoneCountryCode?.trim() || null],
    ["email", "email", () => input.email?.trim() || null],
    ["address", "address", () => input.address ?? {}],
    ["dateOfBirth", "date_of_birth", () => input.dateOfBirth || null],
    ["gotra", "gotra", () => input.gotra?.trim() || null],
    ["rashi", "rashi", () => input.rashi?.trim() || null],
    ["nakshatra", "nakshatra", () => input.nakshatra?.trim() || null],
    ["notes", "notes", () => input.notes?.trim() || null],
  ];
  for (const [k, col, val] of map) {
    if (input[k] !== undefined) {
      sets.push(`${col} = $${i++}`);
      params.push(val());
    }
  }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const r = await pool.query(`UPDATE devotees SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL`, params);
  return (r.rowCount ?? 0) > 0;
}

export async function softDeleteDevotee(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(`UPDATE devotees SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return (r.rowCount ?? 0) > 0;
}

// ── Bookings ─────────────────────────────────────────────────────────

export type BookingRow = {
  id: string;
  reference: string;
  devotee_id: string | null;
  devotee_name: string | null;
  pooja_seva_id: string | null;
  pooja_name: string;
  scheduled_at: string;
  duration_minutes: number | null;
  priest_name: string | null;
  status: string;
  amount_total: string;
  currency: string;
  payment_status: string;
  notes: string | null;
  source: string | null;
  created_at: string;
};

export async function listBookings(
  pool: Pool,
  filters: { from?: string; to?: string; status?: string; devoteeId?: string } = {}
): Promise<BookingRow[]> {
  const conds: string[] = ["b.cancelled_at IS NULL OR b.cancelled_at IS NOT NULL"]; // include all
  conds.length = 0;
  const params: unknown[] = [];
  let i = 1;
  if (filters.from) {
    conds.push(`b.scheduled_at >= $${i++}`);
    params.push(filters.from);
  }
  if (filters.to) {
    conds.push(`b.scheduled_at <= $${i++}`);
    params.push(filters.to);
  }
  if (filters.status) {
    conds.push(`b.status = $${i++}`);
    params.push(filters.status);
  }
  if (filters.devoteeId) {
    conds.push(`b.devotee_id = $${i++}`);
    params.push(filters.devoteeId);
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const { rows } = await pool.query<BookingRow>(
    `SELECT b.id::text AS id, b.reference,
            b.devotee_id::text AS devotee_id, d.full_name AS devotee_name,
            b.pooja_seva_id::text AS pooja_seva_id, b.pooja_name,
            b.scheduled_at::text AS scheduled_at,
            b.duration_minutes, b.priest_name,
            b.status, b.amount_total::text AS amount_total, b.currency,
            b.payment_status, b.notes, b.source,
            b.created_at::text AS created_at
       FROM bookings b
       LEFT JOIN devotees d ON d.id = b.devotee_id
       ${where}
      ORDER BY b.created_at DESC
      LIMIT 500`,
    params
  );
  return rows;
}

export type BookingInput = {
  reference: string;
  devoteeId: string | null;
  poojaSevaId: string | null;
  poojaName: string;
  scheduledAt: string;
  durationMinutes: number | null;
  priestName: string | null;
  amountTotal: number;
  currency: string;
  paymentStatus: "unpaid" | "paid" | "refunded" | "partial";
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  notes: string | null;
  source: string | null;
};

export async function insertBooking(pool: Pool, input: BookingInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO bookings (reference, devotee_id, pooja_seva_id, pooja_name, scheduled_at,
                           duration_minutes, priest_name, status, amount_total, currency,
                           payment_status, notes, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id::text AS id`,
    [
      input.reference.trim(),
      input.devoteeId,
      input.poojaSevaId,
      input.poojaName.trim(),
      input.scheduledAt,
      input.durationMinutes,
      input.priestName?.trim() || null,
      input.status,
      input.amountTotal,
      input.currency,
      input.paymentStatus,
      input.notes?.trim() || null,
      input.source?.trim() || null,
    ]
  );
  return { id: rows[0]!.id };
}

export async function updateBookingStatus(
  pool: Pool,
  id: string,
  status: BookingInput["status"]
): Promise<boolean> {
  const params: unknown[] = [status];
  let extra = "";
  if (status === "cancelled") {
    extra = ", cancelled_at = NOW()";
  }
  params.push(id);
  const r = await pool.query(
    `UPDATE bookings SET status = $1, updated_at = NOW()${extra} WHERE id = $2`,
    params
  );
  return (r.rowCount ?? 0) > 0;
}

// ── POS Registers ────────────────────────────────────────────────────

export type PosRegisterRow = {
  id: string;
  code: string;
  name: string;
  store_id: string | null;
  store_name: string | null;
  is_active: boolean;
};

export async function listRegisters(pool: Pool): Promise<PosRegisterRow[]> {
  const { rows } = await pool.query<PosRegisterRow>(
    `SELECT r.id::text AS id, r.code, r.name, r.store_id::text AS store_id,
            s.name AS store_name, r.is_active
       FROM pos_registers r
       LEFT JOIN inventory_store_locations s ON s.id = r.store_id
      WHERE r.deleted_at IS NULL
      ORDER BY r.created_at DESC`
  );
  return rows;
}

export async function insertRegister(
  pool: Pool,
  input: { code: string; name: string; storeId: string | null; isActive: boolean }
): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO pos_registers (code, name, store_id, is_active)
     VALUES ($1,$2,$3,$4) RETURNING id::text AS id`,
    [input.code.trim(), input.name.trim(), input.storeId, input.isActive]
  );
  return { id: rows[0]!.id };
}

// ── POS Sessions ─────────────────────────────────────────────────────

export type PosSessionRow = {
  id: string;
  register_id: string;
  register_name: string;
  opened_by: string | null;
  opened_at: string;
  opening_float: string;
  closed_by: string | null;
  closed_at: string | null;
  closing_amount: string | null;
  status: "open" | "closed";
};

export async function listSessions(pool: Pool, registerId?: string): Promise<PosSessionRow[]> {
  const params: unknown[] = [];
  let where = "";
  if (registerId) {
    params.push(registerId);
    where = `WHERE s.register_id = $1`;
  }
  const { rows } = await pool.query<PosSessionRow>(
    `SELECT s.id::text AS id, s.register_id::text AS register_id, r.name AS register_name,
            s.opened_by, s.opened_at::text AS opened_at, s.opening_float::text AS opening_float,
            s.closed_by, s.closed_at::text AS closed_at, s.closing_amount::text AS closing_amount,
            s.status
       FROM pos_sessions s
       JOIN pos_registers r ON r.id = s.register_id
      ${where}
      ORDER BY s.created_at DESC
      LIMIT 200`,
    params
  );
  return rows;
}

export async function openSession(
  pool: Pool,
  input: { registerId: string; openedBy: string | null; openingFloat: number }
): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO pos_sessions (register_id, opened_by, opening_float, status)
     VALUES ($1,$2,$3,'open') RETURNING id::text AS id`,
    [input.registerId, input.openedBy, input.openingFloat]
  );
  return { id: rows[0]!.id };
}

export async function closeSession(
  pool: Pool,
  id: string,
  input: { closedBy: string | null; closingAmount: number }
): Promise<boolean> {
  const r = await pool.query(
    `UPDATE pos_sessions
        SET status = 'closed', closed_by = $1, closing_amount = $2, closed_at = NOW()
      WHERE id = $3 AND status = 'open'`,
    [input.closedBy, input.closingAmount, id]
  );
  return (r.rowCount ?? 0) > 0;
}

// ── POS Orders ───────────────────────────────────────────────────────

export type PosOrderRow = {
  id: string;
  reference: string;
  session_id: string | null;
  register_id: string | null;
  devotee_id: string | null;
  total_amount: string;
  tax_amount: string;
  discount_amount: string;
  currency: string;
  payment_method: string | null;
  payment_status: string;
  notes: string | null;
  occurred_at: string;
  line_count: number;
};

export async function listPosOrders(pool: Pool, limit = 100): Promise<PosOrderRow[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const { rows } = await pool.query<PosOrderRow>(
    `SELECT o.id::text AS id, o.reference,
            o.session_id::text AS session_id, o.register_id::text AS register_id,
            o.devotee_id::text AS devotee_id,
            o.total_amount::text AS total_amount,
            o.tax_amount::text AS tax_amount,
            o.discount_amount::text AS discount_amount,
            o.currency, o.payment_method, o.payment_status, o.notes,
            o.occurred_at::text AS occurred_at,
            (SELECT COUNT(*)::int FROM pos_order_lines pl WHERE pl.order_id = o.id) AS line_count
       FROM pos_orders o
      ORDER BY o.created_at DESC
      LIMIT ${safeLimit}`
  );
  return rows;
}

export type PosOrderInput = {
  reference: string;
  sessionId: string | null;
  registerId: string | null;
  devoteeId: string | null;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  currency: string;
  paymentMethod: string | null;
  paymentStatus: "paid" | "refunded" | "pending";
  notes: string | null;
  lines: Array<{
    productId: string | null;
    description: string;
    quantity: number;
    unitAmount: number;
    totalAmount: number;
  }>;
};

export async function createPosOrder(pool: Pool, input: PosOrderInput): Promise<{ id: string }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO pos_orders (reference, session_id, register_id, devotee_id,
                               total_amount, tax_amount, discount_amount, currency,
                               payment_method, payment_status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id::text AS id`,
      [
        input.reference.trim(),
        input.sessionId,
        input.registerId,
        input.devoteeId,
        input.totalAmount,
        input.taxAmount,
        input.discountAmount,
        input.currency,
        input.paymentMethod,
        input.paymentStatus,
        input.notes?.trim() || null,
      ]
    );
    const id = rows[0]!.id;
    for (const ln of input.lines) {
      await client.query(
        `INSERT INTO pos_order_lines (order_id, product_id, description, quantity, unit_amount, total_amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, ln.productId, ln.description.trim(), ln.quantity, ln.unitAmount, ln.totalAmount]
      );
      // Decrement inventory + record ledger when product attached and order is paid
      if (ln.productId && input.paymentStatus === "paid") {
        const updated = await client.query(
          `UPDATE inventory_products SET quantity = quantity - $2, updated_at = NOW()
            WHERE id = $1 AND deleted_at IS NULL AND quantity >= $2`,
          [ln.productId, ln.quantity]
        );
        if ((updated.rowCount ?? 0) !== 1) {
          throw new Error("Product not found or insufficient stock for POS order.");
        }
        await client.query(
          `INSERT INTO inventory_stock_ledger (product_id, movement_kind, quantity_delta, reference_type, reference_id)
           VALUES ($1, 'sale_out', $2, 'pos_order', $3)`,
          [ln.productId, -ln.quantity, id]
        );
      }
    }
    await client.query("COMMIT");
    return { id };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Donations ───────────────────────────────────────────────────────

export type DonationRow = {
  id: string;
  receipt_number: string;
  devotee_id: string | null;
  devotee_name: string | null;
  donor_name: string | null;
  donor_phone: string | null;
  donor_email: string | null;
  amount: string;
  currency: string;
  category: string | null;
  payment_method: string | null;
  reference: string | null;
  is_anonymous: boolean;
  notes: string | null;
  occurred_at: string;
};

export async function listDonations(pool: Pool, limit = 200): Promise<DonationRow[]> {
  const safe = Math.min(Math.max(limit, 1), 1000);
  const { rows } = await pool.query<DonationRow>(
    `SELECT d.id::text AS id, d.receipt_number,
            d.devotee_id::text AS devotee_id, dv.full_name AS devotee_name,
            d.donor_name, d.donor_phone, d.donor_email,
            d.amount::text AS amount, d.currency, d.category,
            d.payment_method, d.reference, d.is_anonymous, d.notes,
            d.occurred_at::text AS occurred_at
       FROM donations d
       LEFT JOIN devotees dv ON dv.id = d.devotee_id
      WHERE d.deleted_at IS NULL
      ORDER BY d.created_at DESC
      LIMIT ${safe}`
  );
  return rows;
}

export type DonationInput = {
  receiptNumber: string;
  devoteeId: string | null;
  donorName: string | null;
  donorPhone: string | null;
  donorEmail: string | null;
  amount: number;
  currency: string;
  category: string | null;
  paymentMethod: string | null;
  reference: string | null;
  isAnonymous: boolean;
  notes: string | null;
  occurredAt: string;
};

export async function insertDonation(pool: Pool, input: DonationInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO donations (receipt_number, devotee_id, donor_name, donor_phone, donor_email,
                             amount, currency, category, payment_method, reference,
                             is_anonymous, notes, occurred_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id::text AS id`,
    [
      input.receiptNumber.trim(),
      input.devoteeId,
      input.donorName?.trim() || null,
      input.donorPhone?.trim() || null,
      input.donorEmail?.trim() || null,
      input.amount,
      input.currency,
      input.category?.trim() || null,
      input.paymentMethod?.trim() || null,
      input.reference?.trim() || null,
      input.isAnonymous,
      input.notes?.trim() || null,
      input.occurredAt,
    ]
  );
  return { id: rows[0]!.id };
}

// ── Finance entries ──────────────────────────────────────────────────

export type FinanceEntryRow = {
  id: string;
  entry_kind: "expense" | "income" | "adjustment";
  amount: string;
  currency: string;
  category: string | null;
  description: string | null;
  reference: string | null;
  occurred_at: string;
  created_by: string | null;
};

export async function listFinanceEntries(pool: Pool, limit = 200): Promise<FinanceEntryRow[]> {
  const safe = Math.min(Math.max(limit, 1), 1000);
  const { rows } = await pool.query<FinanceEntryRow>(
    `SELECT id::text AS id, entry_kind, amount::text AS amount, currency,
            category, description, reference,
            occurred_at::text AS occurred_at, created_by
       FROM finance_entries
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${safe}`
  );
  return rows;
}

export type FinanceEntryInput = {
  entryKind: "expense" | "income" | "adjustment";
  amount: number;
  currency: string;
  category: string | null;
  description: string | null;
  reference: string | null;
  occurredAt: string;
  createdBy: string | null;
};

export async function insertFinanceEntry(pool: Pool, input: FinanceEntryInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO finance_entries (entry_kind, amount, currency, category, description,
                                   reference, occurred_at, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id::text AS id`,
    [
      input.entryKind,
      input.amount,
      input.currency,
      input.category?.trim() || null,
      input.description?.trim() || null,
      input.reference?.trim() || null,
      input.occurredAt,
      input.createdBy?.trim() || null,
    ]
  );
  return { id: rows[0]!.id };
}

// ── Finance transactions view ────────────────────────────────────────

export type FinanceTransactionRow = {
  id: string;
  source_table: string;
  source_id: string;
  reference: string;
  type: string;
  amount: string;
  currency: string;
  devotee_id: string | null;
  description: string;
  occurred_at: string;
  created_at: string;
};

export async function listFinanceTransactions(
  pool: Pool,
  filters: { from?: string; to?: string; type?: string; source?: string; limit?: number } = {}
): Promise<FinanceTransactionRow[]> {
  const conds: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (filters.from) {
    conds.push(`occurred_at >= $${i++}`);
    params.push(filters.from);
  }
  if (filters.to) {
    conds.push(`occurred_at <= $${i++}`);
    params.push(filters.to);
  }
  if (filters.type) {
    conds.push(`type = $${i++}`);
    params.push(filters.type);
  }
  if (filters.source) {
    conds.push(`source_table = $${i++}`);
    params.push(filters.source);
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const limit = Math.min(Math.max(filters.limit ?? 200, 1), 1000);
  const { rows } = await pool.query<FinanceTransactionRow>(
    `SELECT id, source_table, source_id, reference, type,
            amount::text AS amount, currency, devotee_id::text AS devotee_id,
            description, occurred_at::text AS occurred_at, created_at::text AS created_at
       FROM v_finance_transactions
       ${where}
      ORDER BY created_at DESC
      LIMIT ${limit}`,
    params
  );
  return rows;
}

// ── Dashboard summary ────────────────────────────────────────────────

export type DashboardSummary = {
  bookings: { total: number; today: number; upcoming: number; confirmed: number };
  pos: { todayTotal: string; todayOrders: number; openSessions: number };
  donations: { todayTotal: string; monthTotal: string; donorCount: number };
  inventory: { totalProducts: number; lowStock: number; outOfStock: number };
  finance: { incomeMonth: string; expenseMonth: string };
};

export async function getDashboardSummary(pool: Pool): Promise<DashboardSummary> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [bookings, pos, sessions, donations, donationsMonth, inventoryStats, financeMonth] = await Promise.all([
    pool.query<{ total: string; today: string; upcoming: string; confirmed: string }>(
      `SELECT
         COUNT(*)::text AS total,
         COUNT(*) FILTER (WHERE scheduled_at >= $1 AND scheduled_at < $1::timestamptz + INTERVAL '1 day')::text AS today,
         COUNT(*) FILTER (WHERE scheduled_at >= NOW() AND status NOT IN ('cancelled', 'completed', 'no_show'))::text AS upcoming,
         COUNT(*) FILTER (WHERE status = 'confirmed')::text AS confirmed
       FROM bookings`,
      [startOfDay]
    ),
    pool.query<{ today_total: string; today_orders: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text AS today_total,
              COUNT(*)::text AS today_orders
         FROM pos_orders WHERE occurred_at >= $1`,
      [startOfDay]
    ),
    pool.query<{ open: string }>(
      `SELECT COUNT(*)::text AS open FROM pos_sessions WHERE status = 'open'`
    ),
    pool.query<{ today_total: string; donor_count: string }>(
      `SELECT COALESCE(SUM(amount), 0)::text AS today_total,
              COUNT(DISTINCT COALESCE(devotee_id::text, donor_phone, donor_email, id::text))::text AS donor_count
         FROM donations WHERE occurred_at >= $1 AND deleted_at IS NULL`,
      [startOfDay]
    ),
    pool.query<{ month_total: string }>(
      `SELECT COALESCE(SUM(amount), 0)::text AS month_total
         FROM donations WHERE occurred_at >= $1 AND deleted_at IS NULL`,
      [startOfMonth]
    ),
    pool.query<{ total: string; low: string; out: string }>(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE reorder_point IS NOT NULL AND quantity > 0 AND quantity <= reorder_point)::text AS low,
              COUNT(*) FILTER (WHERE quantity <= 0)::text AS out
         FROM inventory_products WHERE deleted_at IS NULL`
    ),
    pool.query<{ income: string; expense: string }>(
      `SELECT COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)::text AS income,
              COALESCE(SUM(-amount) FILTER (WHERE type = 'expense'), 0)::text AS expense
         FROM v_finance_transactions WHERE occurred_at >= $1`,
      [startOfMonth]
    ),
  ]);

  return {
    bookings: {
      total: Number(bookings.rows[0]!.total),
      today: Number(bookings.rows[0]!.today),
      upcoming: Number(bookings.rows[0]!.upcoming),
      confirmed: Number(bookings.rows[0]!.confirmed),
    },
    pos: {
      todayTotal: pos.rows[0]!.today_total,
      todayOrders: Number(pos.rows[0]!.today_orders),
      openSessions: Number(sessions.rows[0]!.open),
    },
    donations: {
      todayTotal: donations.rows[0]!.today_total,
      monthTotal: donationsMonth.rows[0]!.month_total,
      donorCount: Number(donations.rows[0]!.donor_count),
    },
    inventory: {
      totalProducts: Number(inventoryStats.rows[0]!.total),
      lowStock: Number(inventoryStats.rows[0]!.low),
      outOfStock: Number(inventoryStats.rows[0]!.out),
    },
    finance: {
      incomeMonth: financeMonth.rows[0]!.income,
      expenseMonth: financeMonth.rows[0]!.expense,
    },
  };
}
