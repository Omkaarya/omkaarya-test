-- Super-admin create/edit wizard: tradition + temple WhatsApp (separate from contact_phone)
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS tradition TEXT NULL;

ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS contact_whatsapp JSONB NULL;
