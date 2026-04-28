-- 019: Super Admin Users and Role-Based Access Control tables
-- Creates platform-level roles and links super admin users to roles

CREATE TABLE IF NOT EXISTS sa_roles (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sa_role_permissions (
  id         SERIAL PRIMARY KEY,
  role_id    INTEGER NOT NULL REFERENCES sa_roles(id) ON DELETE CASCADE,
  feature_key VARCHAR(255) NOT NULL,           -- references features.key
  access_level VARCHAR(20) NOT NULL DEFAULT 'none'
                CHECK (access_level IN ('none', 'view', 'full')),
  UNIQUE (role_id, feature_key)
);

CREATE TABLE IF NOT EXISTS sa_users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  role_id     INTEGER REFERENCES sa_roles(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sa_users_email   ON sa_users(email);
CREATE INDEX IF NOT EXISTS idx_sa_users_role_id ON sa_users(role_id);
CREATE INDEX IF NOT EXISTS idx_sa_role_perms_role ON sa_role_permissions(role_id);

-- Seed default roles
INSERT INTO sa_roles (name, description) VALUES
  ('Super Admin', 'Full access to all platform features, including pricing, registry and system settings.'),
  ('Support Agent', 'Manage temples and subscriptions. Limited access to system settings.'),
  ('Finance Reviewer', 'Read-only access to revenue and transaction reports.')
ON CONFLICT (name) DO NOTHING;

-- Seed one default super admin user (password must be set separately)
INSERT INTO sa_users (name, email, role_id, is_active)
  SELECT 'Pepulux Admin', 'admin@pepulux.com', id, TRUE
  FROM sa_roles WHERE name = 'Super Admin'
ON CONFLICT (email) DO NOTHING;
