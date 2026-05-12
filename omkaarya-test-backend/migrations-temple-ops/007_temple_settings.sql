-- Temple settings: one row per area, payload as JSONB.
-- Single-tenant per ops database. Each area has id=1 enforced.

CREATE TABLE IF NOT EXISTS temple_settings_areas (
  area_key        TEXT PRIMARY KEY,
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed all known settings areas with empty payloads (idempotent).
INSERT INTO temple_settings_areas (area_key, payload) VALUES
  ('general',          '{}'::jsonb),
  ('web',              '{}'::jsonb),
  ('org_tree',         '{"tree": []}'::jsonb),
  ('system_email',     '{"provider": "smtp"}'::jsonb),
  ('system_finance',   '{"baseCurrency": "INR", "taxEnabled": false}'::jsonb),
  ('system_inventory', '{}'::jsonb),
  ('app_invoice',      '{}'::jsonb),
  ('app_pos',          '{}'::jsonb),
  ('app_printers',     '{}'::jsonb),
  ('public_branding',  '{}'::jsonb),
  ('public_seo',       '{}'::jsonb),
  ('public_features',  '{"features": []}'::jsonb)
ON CONFLICT (area_key) DO NOTHING;
