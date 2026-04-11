-- Temple onboarding "Set up your temple": core contact + foldable details (see temple-session-profile routes)
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255) NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS charity_registered BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS charity_registration_number TEXT NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS contact_phone JSONB NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS website_url TEXT NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS fax JSONB NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS domain_subdomain VARCHAR(255) NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS established_year VARCHAR(8) NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS full_address JSONB NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS logo_data_url TEXT NULL;
