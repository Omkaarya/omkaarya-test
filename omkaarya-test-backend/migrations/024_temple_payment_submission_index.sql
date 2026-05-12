-- Denormalized index on platform DB for cross-tenant billing queries and FK-safe UUID references.
-- Canonical rows live in each temple operational DB (`temple_payment_submissions`).

CREATE TABLE IF NOT EXISTS public.temple_payment_submission_index (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR(32) NOT NULL REFERENCES public.temples (tenant_id) ON DELETE CASCADE,
  payment_ref TEXT NOT NULL,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL,
  transferred_date DATE NOT NULL,
  notes TEXT NULL,
  slip_file_name TEXT NOT NULL,
  slip_mime_type TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'bunny',
  storage_object_key TEXT NOT NULL,
  storage_public_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  invoice_id UUID NULL REFERENCES public.billing_invoices (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tpsi_tenant ON public.temple_payment_submission_index (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tpsi_status_created ON public.temple_payment_submission_index (status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tpsi_tenant_payment_ref ON public.temple_payment_submission_index (tenant_id, payment_ref);
CREATE INDEX IF NOT EXISTS idx_tpsi_invoice ON public.temple_payment_submission_index (invoice_id)
  WHERE invoice_id IS NOT NULL;

-- One-time backfill from legacy single-DB table (if present).
INSERT INTO public.temple_payment_submission_index (
  id, tenant_id, payment_ref, amount_cents, currency, transferred_date, notes,
  slip_file_name, slip_mime_type, storage_provider, storage_object_key, storage_public_url,
  status, invoice_id, created_at
)
SELECT
  s.id,
  s.tenant_id,
  s.payment_ref,
  s.amount_cents,
  s.currency,
  s.transferred_date,
  s.notes,
  s.slip_file_name,
  s.slip_mime_type,
  s.storage_provider,
  s.storage_object_key,
  s.storage_public_url,
  s.status,
  s.invoice_id,
  s.created_at
FROM public.temple_payment_submissions s
WHERE NOT EXISTS (
  SELECT 1 FROM public.temple_payment_submission_index i WHERE i.id = s.id
);
