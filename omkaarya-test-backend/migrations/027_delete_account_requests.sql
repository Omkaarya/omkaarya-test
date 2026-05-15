-- Super-admin: temple account deletion requests (review queue).

CREATE TABLE IF NOT EXISTS public.delete_account_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NULL,
  temple_name text NOT NULL,
  email text NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  requested_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delete_account_requests_status
  ON public.delete_account_requests (status);

CREATE INDEX IF NOT EXISTS idx_delete_account_requests_requested_at
  ON public.delete_account_requests (requested_at DESC);
