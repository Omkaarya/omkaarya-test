-- Final onboarding step ("You're all set") — dashboard-ready timestamp
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ NULL;
