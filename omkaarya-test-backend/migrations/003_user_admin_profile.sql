-- Temple admin onboarding profile (screen 3)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS full_name TEXT NULL;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS whatsapp TEXT NULL;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS roles TEXT[] NOT NULL DEFAULT '{}';
