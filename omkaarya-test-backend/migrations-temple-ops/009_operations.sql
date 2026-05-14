-- Phase 3: Operations — devotees, bookings, POS, donations, finance view.
-- Single-tenant per ops database.

-- ── Devotees (unified contact directory) ──────────────────────────
CREATE TABLE IF NOT EXISTS devotees (
  id              BIGSERIAL PRIMARY KEY,
  full_name       TEXT NOT NULL,
  phone           TEXT NULL,
  phone_country_code TEXT NULL,
  email           TEXT NULL,
  address         JSONB NOT NULL DEFAULT '{}'::jsonb,
  date_of_birth   DATE NULL,
  gotra           TEXT NULL,
  rashi           TEXT NULL,
  nakshatra       TEXT NULL,
  notes           TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_devotees_phone ON devotees (phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_devotees_email ON devotees (email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_devotees_name ON devotees (full_name) WHERE deleted_at IS NULL;

-- ── Bookings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              BIGSERIAL PRIMARY KEY,
  reference       TEXT NOT NULL UNIQUE,
  devotee_id      BIGINT NULL REFERENCES devotees(id) ON DELETE SET NULL,
  pooja_seva_id   BIGINT NULL REFERENCES master_pooja_sevas(id) ON DELETE SET NULL,
  pooja_name      TEXT NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_minutes INT NULL,
  priest_name     TEXT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  amount_total    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  payment_status  TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partial')),
  notes           TEXT NULL,
  source          TEXT NULL,
  created_by      TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at    TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_devotee ON bookings (devotee_id);

CREATE TABLE IF NOT EXISTS booking_lines (
  id              BIGSERIAL PRIMARY KEY,
  booking_id      BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantity        NUMERIC(18, 4) NOT NULL DEFAULT 1,
  unit_amount     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_booking_lines_booking ON booking_lines (booking_id);

-- ── POS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pos_registers (
  id              BIGSERIAL PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  store_id        BIGINT NULL REFERENCES inventory_store_locations(id) ON DELETE SET NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS pos_sessions (
  id              BIGSERIAL PRIMARY KEY,
  register_id     BIGINT NOT NULL REFERENCES pos_registers(id) ON DELETE CASCADE,
  opened_by       TEXT NULL,
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opening_float   NUMERIC(14, 2) NOT NULL DEFAULT 0,
  closed_by       TEXT NULL,
  closed_at       TIMESTAMPTZ NULL,
  closing_amount  NUMERIC(14, 2) NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

CREATE INDEX IF NOT EXISTS idx_pos_sessions_register ON pos_sessions (register_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions (status, opened_at DESC);

CREATE TABLE IF NOT EXISTS pos_orders (
  id              BIGSERIAL PRIMARY KEY,
  reference       TEXT NOT NULL UNIQUE,
  session_id      BIGINT NULL REFERENCES pos_sessions(id) ON DELETE SET NULL,
  register_id     BIGINT NULL REFERENCES pos_registers(id) ON DELETE SET NULL,
  devotee_id      BIGINT NULL REFERENCES devotees(id) ON DELETE SET NULL,
  total_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  payment_method  TEXT NULL,
  payment_status  TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'refunded', 'pending')),
  notes           TEXT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_orders_occurred ON pos_orders (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_orders_session ON pos_orders (session_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_devotee ON pos_orders (devotee_id);

CREATE TABLE IF NOT EXISTS pos_order_lines (
  id              BIGSERIAL PRIMARY KEY,
  order_id        BIGINT NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
  product_id      BIGINT NULL REFERENCES inventory_products(id) ON DELETE SET NULL,
  description     TEXT NOT NULL,
  quantity        NUMERIC(18, 4) NOT NULL DEFAULT 1,
  unit_amount     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pos_order_lines_order ON pos_order_lines (order_id);

-- ── Donations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id              BIGSERIAL PRIMARY KEY,
  receipt_number  TEXT NOT NULL UNIQUE,
  devotee_id      BIGINT NULL REFERENCES devotees(id) ON DELETE SET NULL,
  donor_name      TEXT NULL,
  donor_phone     TEXT NULL,
  donor_email     TEXT NULL,
  amount          NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  category        TEXT NULL,
  payment_method  TEXT NULL,
  reference       TEXT NULL,
  is_anonymous    BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_donations_occurred ON donations (occurred_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_donations_devotee ON donations (devotee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_donations_category ON donations (category) WHERE deleted_at IS NULL;

-- ── Finance ledger (manual entries: expenses, adjustments) ───────
CREATE TABLE IF NOT EXISTS finance_entries (
  id              BIGSERIAL PRIMARY KEY,
  entry_kind      TEXT NOT NULL CHECK (entry_kind IN ('expense', 'income', 'adjustment')),
  amount          NUMERIC(14, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'INR',
  category        TEXT NULL,
  description     TEXT NULL,
  reference       TEXT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_finance_entries_occurred ON finance_entries (occurred_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_finance_entries_kind ON finance_entries (entry_kind, occurred_at DESC) WHERE deleted_at IS NULL;

-- ── Unified finance transactions view ────────────────────────────
-- Drop and recreate to support iterations.
DROP VIEW IF EXISTS v_finance_transactions;

CREATE VIEW v_finance_transactions AS
SELECT
  CONCAT('booking:', b.id) AS id,
  'booking'::text AS source_table,
  b.id::text AS source_id,
  b.reference AS reference,
  CASE WHEN b.payment_status = 'paid' THEN 'income' ELSE 'pending' END AS type,
  b.amount_total AS amount,
  b.currency AS currency,
  b.devotee_id AS devotee_id,
  b.pooja_name AS description,
  b.scheduled_at AS occurred_at,
  b.created_at AS created_at
FROM bookings b
WHERE b.cancelled_at IS NULL
  AND b.amount_total > 0

UNION ALL

SELECT
  CONCAT('pos:', o.id) AS id,
  'pos_order'::text AS source_table,
  o.id::text AS source_id,
  o.reference AS reference,
  CASE WHEN o.payment_status = 'paid' THEN 'income' ELSE 'pending' END AS type,
  o.total_amount AS amount,
  o.currency AS currency,
  o.devotee_id AS devotee_id,
  COALESCE(o.notes, 'POS sale') AS description,
  o.occurred_at AS occurred_at,
  o.created_at AS created_at
FROM pos_orders o

UNION ALL

SELECT
  CONCAT('donation:', d.id) AS id,
  'donation'::text AS source_table,
  d.id::text AS source_id,
  d.receipt_number AS reference,
  'income'::text AS type,
  d.amount AS amount,
  d.currency AS currency,
  d.devotee_id AS devotee_id,
  COALESCE(d.category, 'Donation') AS description,
  d.occurred_at AS occurred_at,
  d.created_at AS created_at
FROM donations d
WHERE d.deleted_at IS NULL

UNION ALL

SELECT
  CONCAT('finance:', f.id) AS id,
  'finance_entry'::text AS source_table,
  f.id::text AS source_id,
  COALESCE(f.reference, '') AS reference,
  f.entry_kind AS type,
  CASE WHEN f.entry_kind = 'expense' THEN -f.amount ELSE f.amount END AS amount,
  f.currency AS currency,
  NULL::bigint AS devotee_id,
  COALESCE(f.description, f.category, f.entry_kind) AS description,
  f.occurred_at AS occurred_at,
  f.created_at AS created_at
FROM finance_entries f
WHERE f.deleted_at IS NULL;
