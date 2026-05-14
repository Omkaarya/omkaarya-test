import type { Pool } from "pg";

export type WhyItMattersActivityStatus = "booked" | "receipt" | "pending";

export type WhyItMattersDashboardPayload = {
  headerIcon: string;
  headerTitle: string;
  devoteesFormatted: string;
  monthAmountDisplay: string;
  monthAmountLabel: string;
  giftAidBannerText: string;
  activityLines: { lineText: string; status: WhyItMattersActivityStatus }[];
};

export type PublicWhyItMattersDashboardResponse = {
  source: "database" | "defaults";
  dashboard: WhyItMattersDashboardPayload;
};

const DEFAULT_STATS = {
  headerIcon: "📊",
  headerTitle: "Temple Dashboard",
  devoteesCount: 1240,
  monthAmountLabel: "This Month",
  monthAmountDisplay: "£4,820",
  giftAidBannerText: "🇬🇧 Gift Aid receipt generated · £125.00",
} as const;

const DEFAULT_ACTIVITY: { lineText: string; status: WhyItMattersActivityStatus }[] = [
  { lineText: "Ganesh Pooja — Ramesh K.", status: "booked" },
  { lineText: "Donation — Priya N. — £50", status: "receipt" },
  { lineText: "Abhishekam — Suresh P.", status: "pending" },
];

function formatDevotees(n: number): string {
  return Math.max(0, Math.floor(n)).toLocaleString("en-GB");
}

function buildDashboard(
  stats: {
    header_icon: string;
    header_title: string;
    devotees_count: number;
    month_amount_label: string;
    month_amount_display: string;
    gift_aid_banner_text: string;
  },
  lines: { line_text: string; status: string }[]
): WhyItMattersDashboardPayload {
  const activityLines: WhyItMattersDashboardPayload["activityLines"] = [];
  for (const row of lines) {
    const st = row.status.trim().toLowerCase();
    if (st === "booked" || st === "receipt" || st === "pending") {
      activityLines.push({ lineText: row.line_text, status: st });
    }
  }
  return {
    headerIcon: stats.header_icon,
    headerTitle: stats.header_title,
    devoteesFormatted: formatDevotees(stats.devotees_count),
    monthAmountDisplay: stats.month_amount_display,
    monthAmountLabel: stats.month_amount_label,
    giftAidBannerText: stats.gift_aid_banner_text,
    activityLines,
  };
}

export function defaultWhyItMattersDashboardResponse(): PublicWhyItMattersDashboardResponse {
  const dashboard: WhyItMattersDashboardPayload = {
    headerIcon: DEFAULT_STATS.headerIcon,
    headerTitle: DEFAULT_STATS.headerTitle,
    devoteesFormatted: formatDevotees(DEFAULT_STATS.devoteesCount),
    monthAmountDisplay: DEFAULT_STATS.monthAmountDisplay,
    monthAmountLabel: DEFAULT_STATS.monthAmountLabel,
    giftAidBannerText: DEFAULT_STATS.giftAidBannerText,
    activityLines: [...DEFAULT_ACTIVITY],
  };
  return { source: "defaults", dashboard };
}

export async function loadWhyItMattersDashboardFromOpsPool(
  opsPool: Pool
): Promise<PublicWhyItMattersDashboardResponse> {
  const [{ rows: statRows }, { rows: lineRows }] = await Promise.all([
    opsPool.query<{
      header_icon: string;
      header_title: string;
      devotees_count: number;
      month_amount_label: string;
      month_amount_display: string;
      gift_aid_banner_text: string;
    }>(
      `SELECT header_icon, header_title, devotees_count, month_amount_label, month_amount_display, gift_aid_banner_text
       FROM marketing_dashboard_stats
       WHERE id = 1
       LIMIT 1`
    ),
    opsPool.query<{ line_text: string; status: string }>(
      `SELECT line_text, status
       FROM marketing_dashboard_activity_lines
       ORDER BY sort_order ASC, id ASC`
    ),
  ]);

  const stat = statRows[0];
  const lines = lineRows.length ? lineRows : DEFAULT_ACTIVITY.map((a) => ({ line_text: a.lineText, status: a.status }));

  const statRow =
    stat ??
    ({
      header_icon: DEFAULT_STATS.headerIcon,
      header_title: DEFAULT_STATS.headerTitle,
      devotees_count: DEFAULT_STATS.devoteesCount,
      month_amount_label: DEFAULT_STATS.monthAmountLabel,
      month_amount_display: DEFAULT_STATS.monthAmountDisplay,
      gift_aid_banner_text: DEFAULT_STATS.giftAidBannerText,
    } as const);

  let dashboard = buildDashboard(statRow, lines);
  if (dashboard.activityLines.length === 0) {
    dashboard = { ...dashboard, activityLines: [...DEFAULT_ACTIVITY] };
  }

  return {
    source: "database",
    dashboard,
  };
}
