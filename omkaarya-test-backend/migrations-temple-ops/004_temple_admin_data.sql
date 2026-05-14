-- Temple-admin operational state (single row per ops database).
-- Platform `public.temples` retains directory + billing linkage; profile/deity/onboarding timestamps live here.

CREATE TABLE IF NOT EXISTS temple_admin_data (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  contact_phone JSONB NULL,
  contact_whatsapp JSONB NULL,
  fax JSONB NULL,
  website_url TEXT NULL,
  established_year VARCHAR(8) NULL,
  full_address JSONB NULL,
  logo_data_url TEXT NULL,
  tradition TEXT NULL,
  charity_registered BOOLEAN NOT NULL DEFAULT false,
  charity_registration_number TEXT NULL,
  primary_deity_id VARCHAR(64) NULL,
  sub_deity_ids TEXT[] NOT NULL DEFAULT '{}',
  deity_custom_note TEXT NULL,
  deity_prefer_custom_later BOOLEAN NULL,
  payment_onboarding_completed_at TIMESTAMPTZ NULL,
  payment_save_card_preference BOOLEAN NULL,
  onboarding_completed_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO temple_admin_data (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Source of truth for slip uploads; tenant implied by database (no tenant_id column).
CREATE TABLE IF NOT EXISTS temple_payment_submissions (
  id UUID PRIMARY KEY,
  payment_ref TEXT NOT NULL,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL,
  transferred_date DATE NOT NULL,
  notes TEXT NULL,
  slip_file_name TEXT NOT NULL,
  slip_mime_type TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'bunny',
  storage_object_key TEXT NOT NULL,
  storage_public_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  invoice_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temple_payment_submissions_status_created_at
  ON temple_payment_submissions (status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_temple_payment_submissions_payment_ref
  ON temple_payment_submissions (payment_ref);

CREATE INDEX IF NOT EXISTS idx_temple_payment_submissions_invoice
  ON temple_payment_submissions (invoice_id)
  WHERE invoice_id IS NOT NULL;
