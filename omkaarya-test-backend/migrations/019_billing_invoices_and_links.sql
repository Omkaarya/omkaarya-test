-- Billing: invoices, transactions, receipts; link subscriptions and payment submissions.

CREATE SEQUENCE IF NOT EXISTS public.billing_invoice_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.billing_receipt_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(32) NOT NULL REFERENCES public.temples (tenant_id) ON DELETE CASCADE,
  invoice_number VARCHAR(64) NOT NULL,
  plan VARCHAR(64) NOT NULL,
  billing_cycle VARCHAR(32) NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  status VARCHAR(32) NOT NULL
    CHECK (status IN ('proforma', 'pending', 'paid', 'void', 'rejected')),
  is_trial_proforma BOOLEAN NOT NULL DEFAULT false,
  issued_at DATE NOT NULL DEFAULT (CURRENT_DATE),
  due_at DATE NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_invoices_number ON public.billing_invoices (invoice_number);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_tenant ON public.billing_invoices (tenant_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON public.billing_invoices (status, issued_at DESC);

CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(32) NOT NULL REFERENCES public.temples (tenant_id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.billing_invoices (id) ON DELETE CASCADE,
  payment_submission_id UUID NULL REFERENCES public.temple_payment_submissions (id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  method VARCHAR(32) NOT NULL DEFAULT 'bank_transfer',
  status VARCHAR(32) NOT NULL DEFAULT 'paid'
    CHECK (status IN ('pending', 'paid', 'void')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_transactions_tenant ON public.billing_transactions (tenant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_invoice ON public.billing_transactions (invoice_id);

CREATE TABLE IF NOT EXISTS public.billing_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(32) NOT NULL REFERENCES public.temples (tenant_id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.billing_invoices (id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES public.billing_transactions (id) ON DELETE CASCADE,
  receipt_number VARCHAR(64) NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_receipts_number ON public.billing_receipts (receipt_number);
CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_receipts_tx ON public.billing_receipts (transaction_id);
CREATE INDEX IF NOT EXISTS idx_billing_receipts_tenant ON public.billing_receipts (tenant_id, issued_at DESC);

ALTER TABLE public.temple_payment_submissions
  ADD COLUMN IF NOT EXISTS invoice_id UUID NULL REFERENCES public.billing_invoices (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_temple_payment_submissions_invoice ON public.temple_payment_submissions (invoice_id)
  WHERE invoice_id IS NOT NULL;

-- Submission workflow (pending: awaiting review, approved, rejected)
ALTER TABLE public.temple_payment_submissions
  ALTER COLUMN status SET DEFAULT 'pending';

UPDATE public.temple_payment_submissions
SET status = 'pending'
WHERE status IS NOT NULL AND status::text NOT IN ('pending', 'approved', 'rejected');

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS invoice_id UUID NULL REFERENCES public.billing_invoices (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_invoice ON public.subscriptions (invoice_id)
  WHERE invoice_id IS NOT NULL;
