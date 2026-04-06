-- Payment onboarding step completion (no card data; gateway integration later)
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS payment_onboarding_completed_at TIMESTAMPTZ NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS payment_save_card_preference BOOLEAN NULL;
