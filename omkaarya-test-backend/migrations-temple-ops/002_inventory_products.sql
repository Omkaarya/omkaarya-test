-- Inventory (single-tenant per ops database; no temple_id column.)

CREATE TABLE IF NOT EXISTS inventory_products (
  id              BIGSERIAL PRIMARY KEY,
  sku             TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT '',
  sub_category    TEXT NOT NULL DEFAULT '',
  product_type    TEXT NOT NULL DEFAULT '',
  quantity        NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reorder_point   NUMERIC(18, 4) NULL,
  unit            TEXT NOT NULL DEFAULT '',
  cost_amount     NUMERIC(12, 4) NOT NULL DEFAULT 0 CHECK (cost_amount >= 0),
  supplier_name   TEXT NULL,
  image_url       TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_products_deleted ON inventory_products (deleted_at) WHERE deleted_at IS NULL;
