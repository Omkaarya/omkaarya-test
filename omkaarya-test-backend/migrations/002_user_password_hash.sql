-- Permanent password (bcrypt) after first-time set-password; temp can be cleared.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_hash TEXT NULL;

ALTER TABLE public.users
  ALTER COLUMN temp_password DROP NOT NULL;
