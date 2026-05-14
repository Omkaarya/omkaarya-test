-- Credential mirror for temple ops DB (canonical auth remains platform public.users).

CREATE TABLE IF NOT EXISTS temple_auth_mirror (
  platform_user_id UUID NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,
  password_hash    TEXT NULL,
  temp_password    TEXT NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temple_auth_mirror_platform_user_id ON temple_auth_mirror (platform_user_id);
