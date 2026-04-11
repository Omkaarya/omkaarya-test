-- Primary admin link: temples.admin_user_id -> users.id (admin_email kept for display / legacy rows)
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS admin_user_id INTEGER NULL REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_temples_admin_user ON public.temples (admin_user_id);

UPDATE public.temples t
SET admin_user_id = u.id
FROM public.users u
WHERE lower(trim(t.admin_email)) = lower(trim(u.email))
  AND t.admin_user_id IS NULL;
