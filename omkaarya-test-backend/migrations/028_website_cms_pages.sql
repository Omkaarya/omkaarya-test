-- Super-admin: editable marketing / CMS snippets (JSON per page key).

CREATE TABLE IF NOT EXISTS public.website_cms_pages (
  page_key text PRIMARY KEY,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
