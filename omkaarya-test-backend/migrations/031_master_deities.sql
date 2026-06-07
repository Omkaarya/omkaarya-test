-- 031: Master deities catalog (super-admin CRUD + temple onboarding source of truth).

CREATE TABLE IF NOT EXISTS public.master_deities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(64) NOT NULL UNIQUE,
  display_serial INT NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  secondary_label TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  country_code VARCHAR(8) NULL,
  placeholder_hue VARCHAR(200) NULL,
  image_data_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_deities_active ON public.master_deities (is_active);
CREATE INDEX IF NOT EXISTS idx_master_deities_country ON public.master_deities (country_code);

-- Canonical deity rows: run `npm run seed` manually (not on migrate/server start).
