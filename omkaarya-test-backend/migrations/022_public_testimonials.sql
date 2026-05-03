-- Public testimonials for marketing pages
-- Used by GET /api/public/testimonials

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(255) NOT NULL,
  temple_name VARCHAR(255) NOT NULL DEFAULT '',
  country_code VARCHAR(8) NOT NULL DEFAULT '',
  country_flag VARCHAR(32) NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_published_sort
  ON public.testimonials (is_published, sort_order, created_at DESC);

-- Seed: mirror the current public-site testimonial cards (idempotent).
INSERT INTO public.testimonials (quote, author_name, author_role, temple_name, country_code, country_flag, rating, is_published, sort_order)
SELECT
  v.quote,
  v.author_name,
  v.author_role,
  v.temple_name,
  v.country_code,
  v.country_flag,
  v.rating,
  true,
  v.sort_order
FROM (
  VALUES
    (
      'We were doing Gift Aid manually on spreadsheets for 200+ donors every year. Omkaarya automated it completely. Our treasurer saves 3 full days per year — and the receipts look professional.',
      'Ramesh Kumar',
      'Temple Secretary',
      'Shiva Mandir London',
      'GB',
      '🇬🇧',
      5,
      10
    ),
    (
      'The pooja booking system changed everything. Devotees book from their phones, we get instant notifications. No more 6am phone calls. We set it up in one afternoon.',
      'Priya Nair',
      'Temple Administrator',
      'Ganesh Temple Sydney',
      'AU',
      '🇦🇺',
      5,
      20
    ),
    (
      'We needed IPC-compliant receipts and Omkaarya was the only platform that had this built in. Verified in 3 business days, receipts active immediately after.',
      'Suresh Pillai',
      'Trustee',
      'Murugan Kovil Singapore',
      'SG',
      '🇸🇬',
      5,
      30
    ),
    (
      'Our devotee records were scattered across 3 different Excel files. Now everything is in one place — searchable, exportable and always up to date.',
      'Lakshmi Reddy',
      'Temple Manager',
      'Sri Venkateswara Birmingham',
      'GB',
      '🇬🇧',
      5,
      40
    ),
    (
      'The Panchangam display on our microsite has been loved by our Tamil community. Devotees check auspicious dates directly from our temple website now.',
      'Vijay Sharma',
      'Head Trustee',
      'Durga Mandir Toronto',
      'CA',
      '🇨🇦',
      5,
      50
    ),
    (
      'Setting up our temple subdomain took less than 10 minutes. Our community now books poojas and donates online. Completely transformed how we operate.',
      'Anita Patel',
      'Temple Secretary',
      'Hanuman Temple Chicago',
      'US',
      '🇺🇸',
      5,
      60
    )
) AS v(quote, author_name, author_role, temple_name, country_code, country_flag, rating, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.testimonials t WHERE t.quote = v.quote
);

