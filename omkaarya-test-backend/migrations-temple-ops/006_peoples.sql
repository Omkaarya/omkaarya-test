-- Peoples module: roles, role permissions, staff members, staff invitations.

CREATE TABLE IF NOT EXISTS roles (
  id              BIGSERIAL PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT NULL,
  is_system       BOOLEAN NOT NULL DEFAULT false,
  required_plan   TEXT NOT NULL DEFAULT 'Prarambha',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id              BIGSERIAL PRIMARY KEY,
  role_id         BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_key      TEXT NOT NULL,
  can_create      BOOLEAN NOT NULL DEFAULT false,
  can_read        BOOLEAN NOT NULL DEFAULT false,
  can_update      BOOLEAN NOT NULL DEFAULT false,
  can_delete      BOOLEAN NOT NULL DEFAULT false,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_id, module_key)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role
  ON role_permissions (role_id);

-- Seed system roles (idempotent).
INSERT INTO roles (slug, name, description, is_system, required_plan)
VALUES
  ('super-admin', 'Super Admin', 'Full system access — cannot be restricted.', true, 'Prarambha'),
  ('admin', 'Admin', 'Full operational access, limited system settings.', true, 'Prarambha'),
  ('manager', 'Manager', 'Operational oversight, approvals and reporting.', true, 'Sankalpa'),
  ('cashier', 'Cashier', 'POS sales and basic inventory view.', true, 'Prarambha'),
  ('inventory-manager', 'Inventory Manager', 'Full inventory control, purchases and manufacturing.', true, 'Sankalpa'),
  ('priest-head', 'Head Priest', 'Pooja roster and ritual oversight.', true, 'Prarambha'),
  ('accountant', 'Accountant', 'Finance, donations, and reports.', true, 'Prarambha'),
  ('trustee', 'Trustee', 'Read-only finance and reports.', true, 'Sankalpa'),
  ('counter', 'Counter Staff', 'POS-only access for counter staff.', true, 'Prarambha')
ON CONFLICT (slug) DO NOTHING;

-- Seed default permissions for system roles (every role gets every module read by default).
DO $$
DECLARE
  module_keys TEXT[] := ARRAY[
    'core', 'inventory', 'sales', 'finance', 'manufacturing',
    'pawning', 'stock_transfer', 'reports', 'logs', 'bookings',
    'master_data', 'peoples', 'public_site', 'settings'
  ];
  m TEXT;
  r RECORD;
BEGIN
  FOR r IN SELECT id, slug FROM roles WHERE is_system = true LOOP
    FOREACH m IN ARRAY module_keys LOOP
      INSERT INTO role_permissions (role_id, module_key, can_create, can_read, can_update, can_delete)
      VALUES (
        r.id, m,
        r.slug IN ('super-admin', 'admin'),
        true,
        r.slug IN ('super-admin', 'admin', 'manager', 'inventory-manager', 'accountant'),
        r.slug = 'super-admin'
      )
      ON CONFLICT (role_id, module_key) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS staff_members (
  id              BIGSERIAL PRIMARY KEY,
  external_id     TEXT NULL UNIQUE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT NULL,
  phone_country_code TEXT NULL,
  role_id         BIGINT NULL REFERENCES roles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  joined_at       DATE NULL,
  notes           TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_members_role
  ON staff_members (role_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_staff_members_status
  ON staff_members (status)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS staff_invitations (
  id              BIGSERIAL PRIMARY KEY,
  email           TEXT NOT NULL,
  role_id         BIGINT NULL REFERENCES roles(id) ON DELETE SET NULL,
  invited_by      TEXT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invite_token    TEXT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NULL,
  accepted_at     TIMESTAMPTZ NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_invitations_email_status
  ON staff_invitations (email, status);
