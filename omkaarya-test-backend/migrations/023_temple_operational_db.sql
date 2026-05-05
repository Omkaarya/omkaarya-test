-- Per-temple operational PostgreSQL (inventory, etc.): connection metadata on platform directory row.
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS operational_db_name VARCHAR(63) NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS operational_database_url TEXT NULL;

COMMENT ON COLUMN public.temples.operational_db_name IS 'Database name on TEMPLE_OPS_DB_* host; used when operational_database_url is NULL.';
COMMENT ON COLUMN public.temples.operational_database_url IS 'Optional full connection URL for this temple ops DB (e.g. Neon branch). Prefer operational_db_name + shared TEMPLE_OPS_* for same-host setups.';
