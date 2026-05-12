-- Inventory ecosystem: categories, suppliers, stores, stock ledger, transfers, POs, BOM, alerts.
-- Single-tenant per ops database.

-- ── Categories (hierarchical) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_categories (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  parent_id       BIGINT NULL REFERENCES inventory_categories(id) ON DELETE SET NULL,
  description     TEXT NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent
  ON inventory_categories (parent_id)
  WHERE deleted_at IS NULL;

-- ── Suppliers ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_suppliers (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  contact_person  TEXT NULL,
  email           TEXT NULL,
  phone           TEXT NULL,
  address         TEXT NULL,
  notes           TEXT NULL,
  payment_terms   TEXT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_active
  ON inventory_suppliers (is_active, name)
  WHERE deleted_at IS NULL;

-- ── Store Locations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_store_locations (
  id              BIGSERIAL PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

-- ── Stock Ledger (append-only movement log) ──────────────────────
CREATE TABLE IF NOT EXISTS inventory_stock_ledger (
  id              BIGSERIAL PRIMARY KEY,
  product_id      BIGINT NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
  movement_kind   TEXT NOT NULL CHECK (movement_kind IN (
    'adjustment', 'transfer_in', 'transfer_out', 'return',
    'purchase_in', 'sale_out', 'consumption', 'open_balance', 'wastage'
  )),
  quantity_delta  NUMERIC(18, 4) NOT NULL,
  store_id        BIGINT NULL REFERENCES inventory_store_locations(id) ON DELETE SET NULL,
  reference_type  TEXT NULL,
  reference_id    TEXT NULL,
  reason          TEXT NULL,
  created_by      TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_stock_ledger_product
  ON inventory_stock_ledger (product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_stock_ledger_kind
  ON inventory_stock_ledger (movement_kind, created_at DESC);

-- ── Transfers (between stores) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_transfers (
  id              BIGSERIAL PRIMARY KEY,
  reference       TEXT NOT NULL UNIQUE,
  from_store_id   BIGINT NULL REFERENCES inventory_store_locations(id) ON DELETE SET NULL,
  to_store_id     BIGINT NULL REFERENCES inventory_store_locations(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'dispatched', 'received', 'cancelled')),
  dispatched_at   TIMESTAMPTZ NULL,
  received_at     TIMESTAMPTZ NULL,
  cancelled_at    TIMESTAMPTZ NULL,
  notes           TEXT NULL,
  created_by      TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_transfer_lines (
  id              BIGSERIAL PRIMARY KEY,
  transfer_id     BIGINT NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  product_id      BIGINT NOT NULL REFERENCES inventory_products(id),
  quantity        NUMERIC(18, 4) NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_inventory_transfer_lines_transfer
  ON inventory_transfer_lines (transfer_id);

-- ── Purchase Orders ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_purchase_orders (
  id              BIGSERIAL PRIMARY KEY,
  po_number       TEXT NOT NULL UNIQUE,
  supplier_id     BIGINT NULL REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'partial', 'cancelled')),
  expected_at     DATE NULL,
  received_at     TIMESTAMPTZ NULL,
  total_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  notes           TEXT NULL,
  created_by      TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_purchase_order_lines (
  id              BIGSERIAL PRIMARY KEY,
  po_id           BIGINT NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  product_id      BIGINT NOT NULL REFERENCES inventory_products(id),
  quantity        NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  unit_cost       NUMERIC(14, 4) NOT NULL DEFAULT 0,
  received_qty    NUMERIC(18, 4) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_inventory_po_lines_po
  ON inventory_purchase_order_lines (po_id);

CREATE INDEX IF NOT EXISTS idx_inventory_po_status
  ON inventory_purchase_orders (status, created_at DESC);

-- ── Bill of Materials ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_bom (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  pooja_seva_id   BIGINT NULL REFERENCES master_pooja_sevas(id) ON DELETE SET NULL,
  description     TEXT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS inventory_bom_lines (
  id              BIGSERIAL PRIMARY KEY,
  bom_id          BIGINT NOT NULL REFERENCES inventory_bom(id) ON DELETE CASCADE,
  product_id      BIGINT NOT NULL REFERENCES inventory_products(id),
  quantity        NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  is_optional     BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_bom_lines_bom
  ON inventory_bom_lines (bom_id);

-- ── Reorder Alerts (snapshot of low stock) ────────────────────────
CREATE TABLE IF NOT EXISTS inventory_reorder_alerts (
  id              BIGSERIAL PRIMARY KEY,
  product_id      BIGINT NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_quantity NUMERIC(18, 4) NOT NULL,
  reorder_point   NUMERIC(18, 4) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  resolved_at     TIMESTAMPTZ NULL,
  notes           TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_reorder_status
  ON inventory_reorder_alerts (status, triggered_at DESC);

-- ── Extend inventory_products with optional FK columns (idempotent) ──
ALTER TABLE inventory_products
  ADD COLUMN IF NOT EXISTS category_id BIGINT NULL REFERENCES inventory_categories(id) ON DELETE SET NULL;

ALTER TABLE inventory_products
  ADD COLUMN IF NOT EXISTS supplier_id BIGINT NULL REFERENCES inventory_suppliers(id) ON DELETE SET NULL;

ALTER TABLE inventory_products
  ADD COLUMN IF NOT EXISTS default_store_id BIGINT NULL REFERENCES inventory_store_locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_products_category
  ON inventory_products (category_id)
  WHERE deleted_at IS NULL;
