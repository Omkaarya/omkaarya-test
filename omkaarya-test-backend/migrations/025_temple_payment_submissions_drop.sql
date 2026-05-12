-- Drop legacy single-DB payment submissions after rows are copied to each temple ops DB
-- and `temple_payment_submission_index` is populated (see migration 024 + migrate-temple-admin-data-to-ops script).

ALTER TABLE public.billing_transactions
  DROP CONSTRAINT IF EXISTS billing_transactions_payment_submission_id_fkey;

DROP TABLE IF EXISTS public.temple_payment_submissions;
