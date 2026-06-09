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
DELETE FROM public.master_deities;
INSERT INTO public.master_deities (slug, display_serial, name, secondary_label, is_active, country_code, placeholder_hue, image_data_url)
VALUES
  ('pillaiyar', 1, 'Pillaiyar', '(Ganesha)', true, NULL, 'from-amber-400 to-orange-500', '/deities/pillaiyar.png'),
  ('murugan', 2, 'Murugan', '(Kartikeya)', true, NULL, 'from-emerald-500 to-teal-600', '/deities/murugan.png'),
  ('hanuman', 3, 'Hanuman', '(Anjaneyar)', true, NULL, 'from-orange-500 to-red-600', '/deities/hanuman.png'),
  ('satyanarayan', 4, 'Satyanarayan', NULL, true, NULL, 'from-yellow-400 to-amber-500', '/deities/satyanarayan.png'),
  ('ramar', 5, 'Ramar', '(Rama)', true, NULL, 'from-sky-400 to-blue-600', '/deities/ramar.png'),
  ('brahma', 6, 'Brahma', NULL, true, NULL, 'from-orange-400 to-amber-600', '/deities/brahma.png'),
  ('vishnu', 7, 'Vishnu', NULL, true, NULL, 'from-blue-500 to-indigo-600', '/deities/vishnu.png'),
  ('shivan', 8, 'Shivan', '(Shiva)', true, NULL, 'from-slate-500 to-zinc-600', '/deities/shivan.png'),
  ('ayyappan', 9, 'Ayyappan', NULL, true, NULL, 'from-stone-500 to-neutral-700', '/deities/ayyappan.png'),
  ('lakshmi-narasimha', 10, 'Lakshmi Narasimha', NULL, true, NULL, 'from-amber-500 to-yellow-600', '/deities/lakshmi-narasimha.png'),
  ('venkesha', 11, 'Venkesha', '(Venkateshwara)', true, NULL, 'from-indigo-500 to-purple-600', '/deities/venkesha.png'),
  ('saraswati', 12, 'Saraswati', NULL, true, NULL, 'from-teal-400 to-cyan-600', '/deities/saraswati.png'),
  ('lakshmi', 13, 'Lakshmi', NULL, true, NULL, 'from-pink-500 to-rose-600', '/deities/lakshmi.png'),
  ('parvati', 14, 'Parvati', NULL, true, NULL, 'from-purple-500 to-indigo-600', '/deities/parvati.png'),
  ('durgai', 15, 'Durgai', '(Durga)', true, NULL, 'from-red-500 to-rose-600', '/deities/durgai.png'),
  ('varahi', 16, 'Varahi', NULL, true, NULL, 'from-emerald-600 to-green-700', '/deities/varahi.png'),
  ('meenakshi', 17, 'Meenakshi', NULL, true, NULL, 'from-emerald-400 to-teal-500', '/deities/meenakshi.png'),
  ('bhadrakali', 18, 'Bhadrakali', NULL, true, NULL, 'from-red-600 to-zinc-900', '/deities/bhadrakali.png'),
  ('maariamman', 19, 'Maariamman', NULL, true, NULL, 'from-rose-500 to-red-600', '/deities/maariamman.png'),
  ('navakiragam', 20, 'Navakiragam', '(Navagraha)', true, NULL, 'from-gray-600 to-slate-800', '/deities/navakiragam.png'),
  ('naga-thambiran', 21, 'Naga Thambiran', NULL, true, NULL, 'from-zinc-600 to-stone-800', '/deities/naga-thambiran.png'),
  ('vairavar', 22, 'Vairavar', '(Bhairava)', true, NULL, 'from-red-700 to-zinc-800', '/deities/vairavar.png'),
  ('thachchanamoorthy', 23, 'Thachchanamoorthy', '(Dakshinamurthy)', true, NULL, 'from-amber-600 to-yellow-700', '/deities/thachchanamoorthy.png'),
  ('sandeswari-sandeswarar', 24, 'Sandeswari / Sandeswarar', NULL, true, NULL, 'from-gray-500 to-slate-600', '/deities/sandeswari-sandeswarar.png'),
  ('nadeswarar', 25, 'Nadeswarar', NULL, true, NULL, 'from-zinc-500 to-neutral-600', '/deities/nadeswarar.png'),
  ('thirugnana-sambandar', 26, 'Thirugnana Sambandar', NULL, true, NULL, 'from-amber-500 to-orange-600', '/deities/thirugnana-sambandar.png'),
  ('thirunavukkarasar-appar', 27, 'Thirunavukkarasar (Appar)', '(Appar)', true, NULL, 'from-emerald-500 to-teal-700', '/deities/thirunavukkarasar-appar.png'),
  ('sundarar', 28, 'Sundarar', NULL, true, NULL, 'from-rose-500 to-pink-700', '/deities/sundarar.png'),
  ('manikkavasagar', 29, 'Manikkavasagar', NULL, true, NULL, 'from-indigo-500 to-violet-700', '/deities/manikkavasagar.png')
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
