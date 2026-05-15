-- 030: Restore UUID primary-key defaults after 029 removed SERIAL without adding gen_random_uuid().
-- Fixes INSERTs that omit id (temple create -> public.users, sa_*, features, plan_features).

ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.sa_roles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.sa_users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.sa_role_permissions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.features ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.plan_features ALTER COLUMN id SET DEFAULT gen_random_uuid();
