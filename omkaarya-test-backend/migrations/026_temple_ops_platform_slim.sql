-- Remove temple-admin columns now stored in per-tenant operational DBs (`temple_admin_data`).
-- Run `npm run migrate:temple-admin-data-to-ops` before this migration on existing databases.

ALTER TABLE public.temples DROP COLUMN IF EXISTS charity_registered;
ALTER TABLE public.temples DROP COLUMN IF EXISTS charity_registration_number;
ALTER TABLE public.temples DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE public.temples DROP COLUMN IF EXISTS contact_whatsapp;
ALTER TABLE public.temples DROP COLUMN IF EXISTS fax;
ALTER TABLE public.temples DROP COLUMN IF EXISTS website_url;
ALTER TABLE public.temples DROP COLUMN IF EXISTS established_year;
ALTER TABLE public.temples DROP COLUMN IF EXISTS full_address;
ALTER TABLE public.temples DROP COLUMN IF EXISTS logo_data_url;
ALTER TABLE public.temples DROP COLUMN IF EXISTS tradition;
ALTER TABLE public.temples DROP COLUMN IF EXISTS primary_deity_id;
ALTER TABLE public.temples DROP COLUMN IF EXISTS sub_deity_ids;
ALTER TABLE public.temples DROP COLUMN IF EXISTS deity_custom_note;
ALTER TABLE public.temples DROP COLUMN IF EXISTS deity_prefer_custom_later;
ALTER TABLE public.temples DROP COLUMN IF EXISTS payment_onboarding_completed_at;
ALTER TABLE public.temples DROP COLUMN IF EXISTS payment_save_card_preference;
ALTER TABLE public.temples DROP COLUMN IF EXISTS onboarding_completed_at;
