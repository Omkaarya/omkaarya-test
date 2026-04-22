-- Bank transfer payment submissions (slip uploaded to SharePoint; metadata stored here)

CREATE TABLE IF NOT EXISTS public.temple_payment_submissions (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  payment_ref TEXT NOT NULL,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL,
  transferred_date DATE NOT NULL,
  notes TEXT NULL,
  slip_file_name TEXT NOT NULL,
  slip_mime_type TEXT NOT NULL,
  sharepoint_drive_item_id TEXT NOT NULL,
  sharepoint_web_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temple_payment_submissions_tenant_id
  ON public.temple_payment_submissions (tenant_id);

CREATE INDEX IF NOT EXISTS idx_temple_payment_submissions_status_created_at
  ON public.temple_payment_submissions (status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_temple_payment_submissions_tenant_payment_ref
  ON public.temple_payment_submissions (tenant_id, payment_ref);

