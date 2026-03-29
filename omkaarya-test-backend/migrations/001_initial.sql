-- Invite / acceptance login (matches PostgresAuthRepository)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  temp_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Super-admin temple directory (matches TempleRecord / list UI)
CREATE TABLE IF NOT EXISTS temples (
  tenant_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  country_code VARCHAR(8) NOT NULL,
  country_flag VARCHAR(32) NOT NULL DEFAULT '',
  city VARCHAR(255) NOT NULL,
  plan VARCHAR(32) NOT NULL CHECK (plan IN ('Aaaradhana', 'Sankalpa', 'Mandala', 'Free')),
  devotees INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL CHECK (status IN ('Active', 'Trial', 'Suspended')),
  compliance VARCHAR(32) NOT NULL CHECK (compliance IN ('Verified', 'Pending', 'Not set up')),
  admin_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temples_country ON temples (country_code);
CREATE INDEX IF NOT EXISTS idx_temples_status ON temples (status);
