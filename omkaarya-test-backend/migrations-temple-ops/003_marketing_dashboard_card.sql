-- Marketing homepage "Temple Dashboard" card (single-tenant per ops database).
-- Consumed by GET /api/public/why-it-matters-dashboard when PUBLIC_MARKETING_TEMPLE_OPS_TENANT_ID points at this tenant.

CREATE TABLE IF NOT EXISTS marketing_dashboard_stats (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  header_icon VARCHAR(32) NOT NULL DEFAULT '📊',
  header_title VARCHAR(255) NOT NULL DEFAULT 'Temple Dashboard',
  devotees_count INT NOT NULL DEFAULT 1240 CHECK (devotees_count >= 0),
  month_amount_label VARCHAR(64) NOT NULL DEFAULT 'This Month',
  month_amount_display VARCHAR(64) NOT NULL DEFAULT '£4,820',
  gift_aid_banner_text TEXT NOT NULL DEFAULT '🇬🇧 Gift Aid receipt generated · £125.00',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO marketing_dashboard_stats (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS marketing_dashboard_activity_lines (
  id BIGSERIAL PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  line_text TEXT NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ('booked', 'receipt', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_dashboard_activity_sort
  ON marketing_dashboard_activity_lines (sort_order, id);

INSERT INTO marketing_dashboard_activity_lines (sort_order, line_text, status)
SELECT v.sort_order, v.line_text, v.status::varchar(16)
FROM (
  VALUES
    (0, 'Ganesh Pooja — Ramesh K.', 'booked'),
    (1, 'Donation — Priya N. — £50', 'receipt'),
    (2, 'Abhishekam — Suresh P.', 'pending')
) AS v(sort_order, line_text, status)
WHERE NOT EXISTS (
  SELECT 1 FROM marketing_dashboard_activity_lines t WHERE t.line_text = v.line_text
);
