-- Backend performance: support server-side pagination + transaction listing.
-- These are safe additive indexes to keep list endpoints responsive as tables grow.

CREATE INDEX IF NOT EXISTS idx_temples_status
  ON public.temples (status);

CREATE INDEX IF NOT EXISTS idx_temples_country_code
  ON public.temples (country_code);

CREATE INDEX IF NOT EXISTS idx_billing_transactions_status_recorded_at
  ON public.billing_transactions (status, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_temple_payment_submissions_status_created_at
  ON public.temple_payment_submissions (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_plan
  ON public.billing_invoices (plan);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_pending_due_at
  ON public.billing_invoices (due_at)
  WHERE status = 'pending' AND due_at IS NOT NULL AND amount_cents > 0;

