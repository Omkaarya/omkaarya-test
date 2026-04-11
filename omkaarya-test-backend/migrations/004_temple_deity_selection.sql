-- Deity selection from temple onboarding (screen 5)
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS primary_deity_id VARCHAR(64) NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS sub_deity_ids TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS deity_custom_note TEXT NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS deity_prefer_custom_later BOOLEAN NULL;
