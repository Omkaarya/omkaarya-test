-- Allow custom catalog tier names in temples.plan (authoritative tier is pricing_plan_id).

ALTER TABLE public.temples
  DROP CONSTRAINT IF EXISTS temples_plan_check;

COMMENT ON COLUMN public.temples.plan IS
  'Plan label for display and legacy queries; use pricing_plan_id for the catalog tier when set.';
