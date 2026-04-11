-- Plan selection from temple onboarding (screen 6)
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(16) NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS onboarding_plan_tier VARCHAR(32) NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS plan_confirmed_at TIMESTAMPTZ NULL;
