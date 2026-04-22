-- Feature Registry + plan ↔ feature config (consumed by Next `lib/features-db.ts` / `lib/plan-features-db.ts`).

CREATE TABLE IF NOT EXISTS public.features (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  key VARCHAR(255) NOT NULL UNIQUE,
  module_key VARCHAR(100) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  has_limit BOOLEAN NOT NULL DEFAULT false,
  limit_type VARCHAR(32),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_visible_in_plan_config BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_module_key ON public.features (module_key);

-- Links pricing plan ids (UUID from `pricing_plans` or legacy tier strings) to registry features.
CREATE TABLE IF NOT EXISTS public.plan_features (
  id SERIAL PRIMARY KEY,
  plan_id TEXT NOT NULL,
  feature_id INTEGER NOT NULL REFERENCES public.features (id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  limit_value INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plan_id, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON public.plan_features (plan_id);
