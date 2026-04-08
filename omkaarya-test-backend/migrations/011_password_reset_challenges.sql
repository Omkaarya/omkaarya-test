-- Temple admin forgot-password: OTP + reset token challenges (one row per user).
CREATE TABLE IF NOT EXISTS password_reset_challenges (
  user_id INTEGER NOT NULL PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
  otp_hash TEXT,
  otp_expires_at TIMESTAMPTZ,
  otp_attempts INTEGER NOT NULL DEFAULT 0,
  reset_token_hash TEXT,
  reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_challenges_reset_expires
  ON password_reset_challenges (reset_expires_at)
  WHERE reset_token_hash IS NOT NULL;
