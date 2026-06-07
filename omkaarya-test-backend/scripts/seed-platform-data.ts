import type pg from "pg";

const SA_ROLES_SQL = `
INSERT INTO sa_roles (name, description) VALUES
  ('Super Admin', 'Full access to all platform features, including pricing, registry and system settings.'),
  ('Support Agent', 'Manage temples and subscriptions. Limited access to system settings.'),
  ('Finance Reviewer', 'Read-only access to revenue and transaction reports.')
ON CONFLICT (name) DO NOTHING;
`;

const SA_USERS_SQL = `
INSERT INTO sa_users (name, email, role_id, is_active)
  SELECT 'Pepulux Admin', 'admin@pepulux.com', id, TRUE
  FROM sa_roles WHERE name = 'Super Admin'
ON CONFLICT (email) DO NOTHING;
`;

const MASTER_DEITIES_SQL = `
INSERT INTO public.master_deities (slug, display_serial, name, secondary_label, is_active, country_code, placeholder_hue, image_data_url)
VALUES
  ('pillaiyaar', 1, 'Pillaiyaar', '(Ganesha)', true, NULL, 'from-amber-400 to-orange-500', NULL),
  ('murugan', 2, 'Murugan', NULL, true, NULL, 'from-emerald-500 to-teal-600', NULL),
  ('shivan', 3, 'Shivan', NULL, true, NULL, 'from-slate-500 to-zinc-600', NULL),
  ('guruvayurappan', 4, 'Guruvayurappan', NULL, true, NULL, 'from-rose-400 to-pink-600', NULL),
  ('amman', 5, 'Amman', NULL, true, NULL, 'from-fuchsia-500 to-purple-600', NULL),
  ('aanjaneyar', 6, 'Aanjaneyar', NULL, true, NULL, 'from-orange-500 to-red-600', NULL)
ON CONFLICT (slug) DO NOTHING;
`;

const TESTIMONIALS_SQL = `
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
`;

export async function seedPlatformReferenceData(client: pg.Client): Promise<void> {
  await client.query(SA_ROLES_SQL);
  console.log("sa_roles: upserted default roles");

  await client.query(SA_USERS_SQL);
  console.log("sa_users: upserted default super-admin user (admin@pepulux.com)");

  await client.query(MASTER_DEITIES_SQL);
  console.log("master_deities: upserted canonical deity catalog");

  const testimonials = await client.query(TESTIMONIALS_SQL);
  console.log(`testimonials: upserted demo rows (${testimonials.rowCount ?? 0} inserted this run)`);
}
