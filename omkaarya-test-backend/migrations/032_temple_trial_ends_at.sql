-- Trial end timestamp for new temples (14-day default set at create). No backfill for existing rows.
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_temples_trial_expiry
  ON public.temples (status, trial_ends_at)
  WHERE trial_ends_at IS NOT NULL;
