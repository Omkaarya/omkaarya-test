-- Switch payment slip storage metadata from SharePoint-specific fields to generic storage fields.

ALTER TABLE public.temple_payment_submissions
  ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'bunny';

ALTER TABLE public.temple_payment_submissions
  RENAME COLUMN sharepoint_drive_item_id TO storage_object_key;

ALTER TABLE public.temple_payment_submissions
  RENAME COLUMN sharepoint_web_url TO storage_public_url;

