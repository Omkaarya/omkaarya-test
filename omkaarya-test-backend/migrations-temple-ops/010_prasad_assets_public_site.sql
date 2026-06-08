-- Prasad, finance assets, public site CMS, kiosk terminals

CREATE TABLE IF NOT EXISTS prasad_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS prasad_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES prasad_categories(id),
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(60),
  price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  included_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  emoji VARCHAR(16),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_prasad_items_category ON prasad_items(category_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS finance_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type VARCHAR(40) NOT NULL,
  name VARCHAR(300) NOT NULL,
  code VARCHAR(60),
  value_amount NUMERIC(14, 2),
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  weight_or_area VARCHAR(120),
  acquired_date DATE,
  status VARCHAR(60),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_finance_assets_type ON finance_assets(asset_type) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public_site_pages (
  page_key VARCHAR(80) PRIMARY KEY,
  title VARCHAR(200),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kiosk_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'online',
  last_seen_at TIMESTAMPTZ,
  location VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
