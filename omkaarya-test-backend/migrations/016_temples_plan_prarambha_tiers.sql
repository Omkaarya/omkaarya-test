-- Align temples.plan with marketing names (Prarambha, Sankalpa, Aaradhana) + Free.
-- Legacy: Aaaradhana -> Aaradhana, Mandala -> Prarambha (per product mapping).

-- Backfill existing rows before changing CHECK
UPDATE public.temples
SET plan = 'Aaradhana'
WHERE plan = 'Aaaradhana';

UPDATE public.temples
SET plan = 'Prarambha'
WHERE plan = 'Mandala';

UPDATE public.subscriptions
SET plan = 'Aaradhana'
WHERE plan = 'Aaaradhana';

UPDATE public.subscriptions
SET plan = 'Prarambha'
WHERE plan = 'Mandala';

-- Drop old plan CHECK (PostgreSQL names it temples_plan_check for inline column checks)
ALTER TABLE public.temples
  DROP CONSTRAINT IF EXISTS temples_plan_check;

ALTER TABLE public.temples
  ADD CONSTRAINT temples_plan_check
  CHECK (plan IN ('Prarambha', 'Sankalpa', 'Aaradhana', 'Free'));

-- Link to catalog; optional FK
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS pricing_plan_id UUID NULL REFERENCES public.pricing_plans (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_temples_pricing_plan_id ON public.temples (pricing_plan_id);

-- Store UUID (36 chars) for onboarding plan selection; column was VARCHAR(32)
ALTER TABLE public.temples
  ALTER COLUMN onboarding_plan_tier TYPE VARCHAR(40);

-- Backfill pricing_plan_id from name match (requires pricing_plans rows)
UPDATE public.temples t
SET pricing_plan_id = p.id
FROM public.pricing_plans p
WHERE t.pricing_plan_id IS NULL
  AND t.plan = p.name;
