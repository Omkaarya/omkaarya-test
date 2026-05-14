-- 029: UUID migration for temples.tenant_id, public.users.id, feature registry, and sa_* RBAC.
-- Run during maintenance; backup first. Keeps uuid_migration_* map tables for temple-ops mirror script.

-- ═══════════════════════════════════════════════════════════════════════════
-- A) Drop foreign keys referencing temples(tenant_id)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_tenant_id_fkey;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tenant_id_fkey;
ALTER TABLE public.billing_invoices DROP CONSTRAINT IF EXISTS billing_invoices_tenant_id_fkey;
ALTER TABLE public.billing_transactions DROP CONSTRAINT IF EXISTS billing_transactions_tenant_id_fkey;
ALTER TABLE public.billing_receipts DROP CONSTRAINT IF EXISTS billing_receipts_tenant_id_fkey;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'temple_payment_submission_index'
  ) THEN
    ALTER TABLE public.temple_payment_submission_index
      DROP CONSTRAINT IF EXISTS temple_payment_submission_index_tenant_id_fkey;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- B) Temple UUID mapping + populate children
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.uuid_migration_tenant_map (
  old_tenant_id VARCHAR(32) PRIMARY KEY,
  new_tenant_id UUID NOT NULL UNIQUE
);

TRUNCATE public.uuid_migration_tenant_map;

ALTER TABLE public.temples ADD COLUMN IF NOT EXISTS _mig_tenant_uuid UUID;
UPDATE public.temples SET _mig_tenant_uuid = gen_random_uuid() WHERE _mig_tenant_uuid IS NULL;

INSERT INTO public.uuid_migration_tenant_map (old_tenant_id, new_tenant_id)
SELECT tenant_id, _mig_tenant_uuid FROM public.temples;

-- subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS _mig_tenant_uuid UUID;
UPDATE public.subscriptions s
SET _mig_tenant_uuid = m.new_tenant_id
FROM public.uuid_migration_tenant_map m
WHERE s.tenant_id = m.old_tenant_id;
DELETE FROM public.subscriptions WHERE _mig_tenant_uuid IS NULL;
ALTER TABLE public.subscriptions DROP COLUMN tenant_id;
ALTER TABLE public.subscriptions RENAME COLUMN _mig_tenant_uuid TO tenant_id;
ALTER TABLE public.subscriptions ALTER COLUMN tenant_id SET NOT NULL;

-- billing_invoices
ALTER TABLE public.billing_invoices ADD COLUMN IF NOT EXISTS _mig_tenant_uuid UUID;
UPDATE public.billing_invoices b
SET _mig_tenant_uuid = m.new_tenant_id
FROM public.uuid_migration_tenant_map m
WHERE b.tenant_id = m.old_tenant_id;
DELETE FROM public.billing_invoices WHERE _mig_tenant_uuid IS NULL;
ALTER TABLE public.billing_invoices DROP COLUMN tenant_id;
ALTER TABLE public.billing_invoices RENAME COLUMN _mig_tenant_uuid TO tenant_id;
ALTER TABLE public.billing_invoices ALTER COLUMN tenant_id SET NOT NULL;

-- billing_transactions
ALTER TABLE public.billing_transactions ADD COLUMN IF NOT EXISTS _mig_tenant_uuid UUID;
UPDATE public.billing_transactions b
SET _mig_tenant_uuid = m.new_tenant_id
FROM public.uuid_migration_tenant_map m
WHERE b.tenant_id = m.old_tenant_id;
DELETE FROM public.billing_transactions WHERE _mig_tenant_uuid IS NULL;
ALTER TABLE public.billing_transactions DROP COLUMN tenant_id;
ALTER TABLE public.billing_transactions RENAME COLUMN _mig_tenant_uuid TO tenant_id;
ALTER TABLE public.billing_transactions ALTER COLUMN tenant_id SET NOT NULL;

-- billing_receipts
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS _mig_tenant_uuid UUID;
UPDATE public.billing_receipts b
SET _mig_tenant_uuid = m.new_tenant_id
FROM public.uuid_migration_tenant_map m
WHERE b.tenant_id = m.old_tenant_id;
DELETE FROM public.billing_receipts WHERE _mig_tenant_uuid IS NULL;
ALTER TABLE public.billing_receipts DROP COLUMN tenant_id;
ALTER TABLE public.billing_receipts RENAME COLUMN _mig_tenant_uuid TO tenant_id;
ALTER TABLE public.billing_receipts ALTER COLUMN tenant_id SET NOT NULL;

-- users.tenant_id (nullable)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS _mig_tenant_uuid UUID;
UPDATE public.users u
SET _mig_tenant_uuid = m.new_tenant_id
FROM public.uuid_migration_tenant_map m
WHERE u.tenant_id = m.old_tenant_id;
ALTER TABLE public.users DROP COLUMN tenant_id;
ALTER TABLE public.users RENAME COLUMN _mig_tenant_uuid TO tenant_id;

-- temple_payment_submission_index (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'temple_payment_submission_index'
  ) THEN
    ALTER TABLE public.temple_payment_submission_index ADD COLUMN IF NOT EXISTS _mig_tenant_uuid UUID;
    UPDATE public.temple_payment_submission_index t
    SET _mig_tenant_uuid = m.new_tenant_id
    FROM public.uuid_migration_tenant_map m
    WHERE t.tenant_id = m.old_tenant_id;
    DELETE FROM public.temple_payment_submission_index WHERE _mig_tenant_uuid IS NULL;
    ALTER TABLE public.temple_payment_submission_index DROP COLUMN tenant_id;
    ALTER TABLE public.temple_payment_submission_index RENAME COLUMN _mig_tenant_uuid TO tenant_id;
    ALTER TABLE public.temple_payment_submission_index ALTER COLUMN tenant_id SET NOT NULL;
  END IF;
END $$;

-- delete_account_requests.tenant_id -> UUID (nullable)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'delete_account_requests'
  ) THEN
    ALTER TABLE public.delete_account_requests ADD COLUMN IF NOT EXISTS _mig_tenant_uuid UUID;
    UPDATE public.delete_account_requests d
    SET _mig_tenant_uuid = m.new_tenant_id
    FROM public.uuid_migration_tenant_map m
    WHERE d.tenant_id IS NOT NULL AND trim(d.tenant_id) = m.old_tenant_id;
    UPDATE public.delete_account_requests SET _mig_tenant_uuid = NULL
    WHERE tenant_id IS NOT NULL AND _mig_tenant_uuid IS NULL;
    ALTER TABLE public.delete_account_requests DROP COLUMN IF EXISTS tenant_id;
    ALTER TABLE public.delete_account_requests RENAME COLUMN _mig_tenant_uuid TO tenant_id;
  END IF;
END $$;

-- Swap temples primary key to UUID
ALTER TABLE public.temples DROP CONSTRAINT IF EXISTS temples_pkey;
ALTER TABLE public.temples DROP COLUMN tenant_id;
ALTER TABLE public.temples RENAME COLUMN _mig_tenant_uuid TO tenant_id;
ALTER TABLE public.temples ADD PRIMARY KEY (tenant_id);

-- Recreate FKs to temples(tenant_id) UUID
ALTER TABLE public.users
  ADD CONSTRAINT users_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.temples (tenant_id) ON DELETE SET NULL;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.temples (tenant_id) ON DELETE CASCADE;

ALTER TABLE public.billing_invoices
  ADD CONSTRAINT billing_invoices_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.temples (tenant_id) ON DELETE CASCADE;

ALTER TABLE public.billing_transactions
  ADD CONSTRAINT billing_transactions_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.temples (tenant_id) ON DELETE CASCADE;

ALTER TABLE public.billing_receipts
  ADD CONSTRAINT billing_receipts_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.temples (tenant_id) ON DELETE CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'temple_payment_submission_index'
  ) THEN
    ALTER TABLE public.temple_payment_submission_index
      ADD CONSTRAINT temple_payment_submission_index_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.temples (tenant_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_tenant ON public.billing_invoices (tenant_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_tenant ON public.billing_transactions (tenant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_receipts_tenant ON public.billing_receipts (tenant_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users (tenant_id);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'temple_payment_submission_index'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_tpsi_tenant ON public.temple_payment_submission_index (tenant_id);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_tpsi_tenant_payment_ref
      ON public.temple_payment_submission_index (tenant_id, payment_ref);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- C) public.users.id -> UUID (password_reset_challenges, temples.admin_user_id)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.temples DROP CONSTRAINT IF EXISTS temples_admin_user_id_fkey;

ALTER TABLE public.password_reset_challenges DROP CONSTRAINT IF EXISTS password_reset_challenges_user_id_fkey;
ALTER TABLE public.password_reset_challenges DROP CONSTRAINT IF EXISTS password_reset_challenges_pkey;

CREATE TABLE IF NOT EXISTS public.uuid_migration_user_map (
  old_id INTEGER PRIMARY KEY,
  new_id UUID NOT NULL UNIQUE
);

TRUNCATE public.uuid_migration_user_map;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS _mig_user_uuid UUID;
UPDATE public.users SET _mig_user_uuid = gen_random_uuid() WHERE _mig_user_uuid IS NULL;

INSERT INTO public.uuid_migration_user_map (old_id, new_id)
SELECT id, _mig_user_uuid FROM public.users;

-- password_reset_challenges: replace user_id with UUID
ALTER TABLE public.password_reset_challenges ADD COLUMN IF NOT EXISTS _mig_user_uuid UUID;
UPDATE public.password_reset_challenges p
SET _mig_user_uuid = m.new_id
FROM public.uuid_migration_user_map m
WHERE p.user_id = m.old_id;
DELETE FROM public.password_reset_challenges WHERE _mig_user_uuid IS NULL;
ALTER TABLE public.password_reset_challenges DROP COLUMN user_id;
ALTER TABLE public.password_reset_challenges RENAME COLUMN _mig_user_uuid TO user_id;
ALTER TABLE public.password_reset_challenges ADD PRIMARY KEY (user_id);

-- temples.admin_user_id -> UUID
ALTER TABLE public.temples ADD COLUMN IF NOT EXISTS _mig_admin_user_uuid UUID;
UPDATE public.temples t
SET _mig_admin_user_uuid = m.new_id
FROM public.uuid_migration_user_map m
WHERE t.admin_user_id = m.old_id;
ALTER TABLE public.temples DROP COLUMN admin_user_id;
ALTER TABLE public.temples RENAME COLUMN _mig_admin_user_uuid TO admin_user_id;

-- users: swap primary key to UUID
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq CASCADE;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE public.users DROP COLUMN id;
ALTER TABLE public.users RENAME COLUMN _mig_user_uuid TO id;
ALTER TABLE public.users ADD PRIMARY KEY (id);

ALTER TABLE public.password_reset_challenges
  ADD CONSTRAINT password_reset_challenges_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

ALTER TABLE public.temples
  ADD CONSTRAINT temples_admin_user_id_fkey
  FOREIGN KEY (admin_user_id) REFERENCES public.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_temples_admin_user ON public.temples (admin_user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- D) sa_roles / sa_users / sa_role_permissions -> UUID PKs + FKs
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.sa_users DROP CONSTRAINT IF EXISTS sa_users_role_id_fkey;
ALTER TABLE public.sa_role_permissions DROP CONSTRAINT IF EXISTS sa_role_permissions_role_id_fkey;
ALTER TABLE public.sa_role_permissions DROP CONSTRAINT IF EXISTS sa_role_permissions_role_id_feature_key_key;

CREATE TABLE IF NOT EXISTS public.uuid_migration_sa_role_map (
  old_id INTEGER PRIMARY KEY,
  new_id UUID NOT NULL UNIQUE
);

TRUNCATE public.uuid_migration_sa_role_map;

ALTER TABLE public.sa_roles ADD COLUMN IF NOT EXISTS _mig_uuid UUID;
UPDATE public.sa_roles SET _mig_uuid = gen_random_uuid() WHERE _mig_uuid IS NULL;
INSERT INTO public.uuid_migration_sa_role_map (old_id, new_id) SELECT id, _mig_uuid FROM public.sa_roles;

ALTER TABLE public.sa_users ADD COLUMN IF NOT EXISTS _mig_role_uuid UUID;
UPDATE public.sa_users u
SET _mig_role_uuid = m.new_id
FROM public.uuid_migration_sa_role_map m
WHERE u.role_id = m.old_id;
ALTER TABLE public.sa_users DROP COLUMN role_id;
ALTER TABLE public.sa_users RENAME COLUMN _mig_role_uuid TO role_id;

ALTER TABLE public.sa_role_permissions ADD COLUMN IF NOT EXISTS _mig_role_uuid UUID;
UPDATE public.sa_role_permissions p
SET _mig_role_uuid = m.new_id
FROM public.uuid_migration_sa_role_map m
WHERE p.role_id = m.old_id;
DELETE FROM public.sa_role_permissions WHERE _mig_role_uuid IS NULL;
ALTER TABLE public.sa_role_permissions DROP COLUMN role_id;
ALTER TABLE public.sa_role_permissions RENAME COLUMN _mig_role_uuid TO role_id;
ALTER TABLE public.sa_role_permissions ALTER COLUMN role_id SET NOT NULL;

-- sa_roles PK
ALTER TABLE public.sa_roles DROP CONSTRAINT IF EXISTS sa_roles_pkey;
ALTER TABLE public.sa_roles DROP COLUMN id;
ALTER TABLE public.sa_roles RENAME COLUMN _mig_uuid TO id;
ALTER TABLE public.sa_roles ADD PRIMARY KEY (id);

ALTER TABLE public.sa_users
  ADD CONSTRAINT sa_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.sa_roles (id) ON DELETE SET NULL;

ALTER TABLE public.sa_role_permissions
  ADD CONSTRAINT sa_role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.sa_roles (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_sa_users_role_id ON public.sa_users (role_id);
CREATE INDEX IF NOT EXISTS idx_sa_role_perms_role ON public.sa_role_permissions (role_id);

-- sa_users.id -> UUID
ALTER TABLE public.sa_users ADD COLUMN IF NOT EXISTS _mig_uuid UUID;
UPDATE public.sa_users SET _mig_uuid = gen_random_uuid() WHERE _mig_uuid IS NULL;
ALTER TABLE public.sa_users DROP CONSTRAINT IF EXISTS sa_users_pkey;
ALTER TABLE public.sa_users ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.sa_users_id_seq CASCADE;
ALTER TABLE public.sa_users DROP COLUMN id;
ALTER TABLE public.sa_users RENAME COLUMN _mig_uuid TO id;
ALTER TABLE public.sa_users ADD PRIMARY KEY (id);

CREATE INDEX IF NOT EXISTS idx_sa_users_email ON public.sa_users (email);

-- sa_role_permissions.id -> UUID
ALTER TABLE public.sa_role_permissions ADD COLUMN IF NOT EXISTS _mig_pk UUID;
UPDATE public.sa_role_permissions SET _mig_pk = gen_random_uuid() WHERE _mig_pk IS NULL;
ALTER TABLE public.sa_role_permissions DROP CONSTRAINT IF EXISTS sa_role_permissions_pkey;
ALTER TABLE public.sa_role_permissions ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.sa_role_permissions_id_seq CASCADE;
ALTER TABLE public.sa_role_permissions DROP COLUMN id;
ALTER TABLE public.sa_role_permissions RENAME COLUMN _mig_pk TO id;
ALTER TABLE public.sa_role_permissions ADD PRIMARY KEY (id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sa_role_permissions_role_feature
  ON public.sa_role_permissions (role_id, feature_key);

-- ═══════════════════════════════════════════════════════════════════════════
-- E) features + plan_features -> UUID
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.plan_features DROP CONSTRAINT IF EXISTS plan_features_feature_id_fkey;
ALTER TABLE public.plan_features DROP CONSTRAINT IF EXISTS plan_features_plan_id_feature_id_key;

CREATE TABLE IF NOT EXISTS public.uuid_migration_feature_map (
  old_id INTEGER PRIMARY KEY,
  new_id UUID NOT NULL UNIQUE
);

TRUNCATE public.uuid_migration_feature_map;

ALTER TABLE public.features ADD COLUMN IF NOT EXISTS _mig_uuid UUID;
UPDATE public.features SET _mig_uuid = gen_random_uuid() WHERE _mig_uuid IS NULL;
INSERT INTO public.uuid_migration_feature_map (old_id, new_id) SELECT id, _mig_uuid FROM public.features;

ALTER TABLE public.plan_features ADD COLUMN IF NOT EXISTS _mig_feature_uuid UUID;
UPDATE public.plan_features pf
SET _mig_feature_uuid = m.new_id
FROM public.uuid_migration_feature_map m
WHERE pf.feature_id = m.old_id;
DELETE FROM public.plan_features WHERE _mig_feature_uuid IS NULL;
ALTER TABLE public.plan_features DROP COLUMN feature_id;
ALTER TABLE public.plan_features RENAME COLUMN _mig_feature_uuid TO feature_id;
ALTER TABLE public.plan_features ALTER COLUMN feature_id SET NOT NULL;

ALTER TABLE public.features DROP CONSTRAINT IF EXISTS features_pkey;
ALTER TABLE public.features ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.features_id_seq CASCADE;
ALTER TABLE public.features DROP COLUMN id;
ALTER TABLE public.features RENAME COLUMN _mig_uuid TO id;
ALTER TABLE public.features ADD PRIMARY KEY (id);

ALTER TABLE public.plan_features
  ADD CONSTRAINT plan_features_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_features_module_key ON public.features (module_key);

-- plan_features.id -> UUID
ALTER TABLE public.plan_features ADD COLUMN IF NOT EXISTS _mig_pk UUID;
UPDATE public.plan_features SET _mig_pk = gen_random_uuid() WHERE _mig_pk IS NULL;
ALTER TABLE public.plan_features DROP CONSTRAINT IF EXISTS plan_features_pkey;
ALTER TABLE public.plan_features ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.plan_features_id_seq CASCADE;
ALTER TABLE public.plan_features DROP COLUMN id;
ALTER TABLE public.plan_features RENAME COLUMN _mig_pk TO id;
ALTER TABLE public.plan_features ADD PRIMARY KEY (id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_plan_features_plan_feature ON public.plan_features (plan_id, feature_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON public.plan_features (plan_id);

COMMENT ON TABLE public.uuid_migration_tenant_map IS 'Temporary map from legacy tenant_id strings to UUIDs; safe to DROP after migrate:ops-auth-mirror-user-ids.';
COMMENT ON TABLE public.uuid_migration_user_map IS 'Temporary map from legacy users.id integers to UUIDs; used by ops mirror migration script.';
COMMENT ON TABLE public.uuid_migration_sa_role_map IS 'Temporary map for sa_roles id migration; safe to DROP after verification.';
COMMENT ON TABLE public.uuid_migration_feature_map IS 'Temporary map for features id migration; safe to DROP after verification.';
