-- One-to-many: each user belongs to at most one temple (nullable for non–temple-admin users).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(32) NULL REFERENCES public.temples(tenant_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users (tenant_id);

-- Backfill from temples.admin_user_id (after 009) where possible.
UPDATE public.users u
SET tenant_id = t.tenant_id
FROM public.temples t
WHERE t.admin_user_id = u.id
  AND u.tenant_id IS NULL;

-- Remaining users: match by admin_email (one temple per email if multiple, pick smallest tenant_id).
UPDATE public.users u
SET tenant_id = sub.tenant_id
FROM (
  SELECT DISTINCT ON (u2.id) u2.id AS user_id, t.tenant_id
  FROM public.users u2
  INNER JOIN public.temples t ON lower(trim(t.admin_email)) = lower(trim(u2.email))
  WHERE u2.tenant_id IS NULL
  ORDER BY u2.id, t.tenant_id
) sub
WHERE u.id = sub.user_id;
