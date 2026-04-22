-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  popular BOOLEAN NOT NULL DEFAULT false,
  included_seats INTEGER NOT NULL DEFAULT 0,
  extra_seat_price_monthly INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure updated_at triggers or just manual update. Standard here seems to just set default NOW() and maybe update it in code.
CREATE INDEX IF NOT EXISTS idx_pricing_plans_popular ON public.pricing_plans (popular);
