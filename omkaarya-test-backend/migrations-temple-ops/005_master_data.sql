-- Master data tables: pooja sevas, schedules, festivals, panchangam, units of measure.
-- Single-tenant per ops database (no tenant_id column).

CREATE TABLE IF NOT EXISTS master_pooja_sevas (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  code            TEXT NULL,
  category        TEXT NOT NULL DEFAULT '',
  duration_minutes INT NULL,
  price_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price_amount >= 0),
  currency        TEXT NOT NULL DEFAULT 'INR',
  prasad_text     TEXT NULL,
  priest_name     TEXT NULL,
  description     TEXT NULL,
  online_enabled  BOOLEAN NOT NULL DEFAULT true,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_master_pooja_sevas_active
  ON master_pooja_sevas (is_active, name)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS master_schedules (
  id              BIGSERIAL PRIMARY KEY,
  pooja_seva_id   BIGINT NULL REFERENCES master_pooja_sevas(id) ON DELETE SET NULL,
  pooja_name      TEXT NOT NULL,
  days            TEXT[] NOT NULL DEFAULT '{}',
  time_of_day     TIME NULL,
  priest_name     TEXT NULL,
  max_slots       INT NULL,
  cutoff_hours    INT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_master_schedules_seva
  ON master_schedules (pooja_seva_id)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS master_festivals (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  festival_date   DATE NULL,
  category        TEXT NOT NULL DEFAULT '',
  description     TEXT NULL,
  priest_name     TEXT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_master_festivals_date
  ON master_festivals (festival_date)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS master_panchangam (
  id              BIGSERIAL PRIMARY KEY,
  panch_date      DATE NOT NULL,
  festival_label  TEXT NULL,
  type_label      TEXT NULL,
  auspicious_label TEXT NULL,
  notes           TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_master_panchangam_date
  ON master_panchangam (panch_date)
  WHERE deleted_at IS NULL;

-- UOM: base + bulk units. Bulk references base via base_unit_id with quantity_per_bulk.
CREATE TABLE IF NOT EXISTS master_uoms (
  id                BIGSERIAL PRIMARY KEY,
  kind              TEXT NOT NULL CHECK (kind IN ('base', 'bulk')),
  name              TEXT NOT NULL,
  abbreviation      TEXT NOT NULL,
  type_label        TEXT NOT NULL DEFAULT 'Unit (count)',
  base_unit_id      BIGINT NULL REFERENCES master_uoms(id) ON DELETE SET NULL,
  quantity_per_bulk NUMERIC(18, 4) NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_master_uoms_kind
  ON master_uoms (kind)
  WHERE deleted_at IS NULL;
