-- Minimal subscriptions table for super-admin subscriptions UI.
-- Stores payment verification + subscription state per temple.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(32) NOT NULL REFERENCES public.temples(tenant_id) ON DELETE CASCADE,
  plan VARCHAR(32) NOT NULL,
  billing_cycle VARCHAR(16) NOT NULL,
  amount INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  receipt_id VARCHAR(128) NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ('Pending', 'Active', 'Expired', 'Rejected')),
  verified_by VARCHAR(255) NULL,
  activated_on DATE NULL,
  expires_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_date ON public.subscriptions (payment_date DESC);
