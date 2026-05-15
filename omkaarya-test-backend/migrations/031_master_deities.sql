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

-- Seed canonical rows (slugs match legacy DEITY_CATALOG / onboarding).
INSERT INTO public.master_deities (slug, display_serial, name, secondary_label, is_active, country_code, placeholder_hue, image_data_url)
VALUES
  ('pillaiyaar', 1, 'Pillaiyaar', '(Ganesha)', true, NULL, 'from-amber-400 to-orange-500', NULL),
  ('murugan', 2, 'Murugan', NULL, true, NULL, 'from-emerald-500 to-teal-600', NULL),
  ('shivan', 3, 'Shivan', NULL, true, NULL, 'from-slate-500 to-zinc-600', NULL),
  ('guruvayurappan', 4, 'Guruvayurappan', NULL, true, NULL, 'from-rose-400 to-pink-600', NULL),
  ('amman', 5, 'Amman', NULL, true, NULL, 'from-fuchsia-500 to-purple-600', NULL),
  ('aanjaneyar', 6, 'Aanjaneyar', NULL, true, NULL, 'from-orange-500 to-red-600', NULL)
ON CONFLICT (slug) DO NOTHING;
