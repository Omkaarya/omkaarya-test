import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { sendSuccess } from "../middleware/api-envelope.js";
import { requirePool } from "../db/pool.js";
import type { PostgresBillingRepository, RevenueDashboardPeriod } from "./billing.repository.js";
import { listPendingPaymentSubmissionsForConfirm } from "./billing.repository.js";

function asString(v: unknown): string {
  return typeof v === "string" ? v : Array.isArray(v) ? String(v[0] ?? "") : "";
}

function parsePeriod(raw: string): RevenueDashboardPeriod {
  const s = (raw || "").trim();
  if (s === "this-month" || s === "last-month" || s === "this-year") return s;
  const m = /^(\d{4})-(\d{2})$/.exec(s);
  if (m) return s as RevenueDashboardPeriod;
  return "this-month";
}

type SubscriptionSummaryItem = {
  amountCents: number;
  billingCycle: string;
  status: "active" | "pending" | "trial";
};

function calcMrrCents(subs: SubscriptionSummaryItem[]): number {
  return subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const cycle = (s.billingCycle ?? "").toLowerCase();
      const monthly = cycle.includes("annual") ? Math.round(s.amountCents / 12) : s.amountCents;
      return sum + monthly;
    }, 0);
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}

export type DashboardRecentTemple = {
  tenantId: string;
  name: string;
  country: string;
  status: string;
  createdAt: string;
};

export type DashboardRecentActivity = {
  type: "temple_onboarded" | "subscription_upgraded" | "payment_received" | "pending_payment";
  title: string;
  subtitle: string;
  timestamp: string;
  href?: string;
};

export type SuperAdminDashboardOverviewResponse = {
  period: { startDate: string; endDateExclusive: string } | null;
  kpis: {
    totalTemples: number;
    globalDevotees: number;
    avgCompliancePct: number | null;
    planBreakdownPct: Array<{ plan: string; percent: number; count: number }>;
    financial: Awaited<ReturnType<PostgresBillingRepository["revenueDashboard"]>>;
  };
  kpiCards: {
    activeTemples: { count: number; changePct: number | null };
    activeSubscriptions: { count: number; expiringThisMonth: number };
    mrrCents: { amountCents: number; changePct: number | null };
    pendingVerifications: { count: number; oldestDaysAgo: number | null };
  };
  templeGrowth: Array<{ monthKey: string; monthLabel: string; count: number }>;
  recentTemples: DashboardRecentTemple[];
  recentActivities: DashboardRecentActivity[];
  alerts: Array<
    | { type: "pending_payment"; title: string; count: number; createdAt: string | null }
    | { type: "trial_temples"; title: string; count: number; oldestTrialEndsAt: string | null }
    | { type: "new_temple"; title: string; tenantId: string; templeName: string; createdAt: string }
  >;
};

export function createDashboardRouter(billing: PostgresBillingRepository): Router {
  const r = Router();

  r.get(
    "/super-admin/dashboard/overview",
    asyncHandler(async (req, res) => {
      const period = parsePeriod(asString(req.query.period));
      const pool = requirePool();

      const [
        financial,
        lastMonthFinancial,
        templeAgg,
        planAgg,
        complianceAgg,
        pendingSubmissions,
        latestTemple,
        activeKpiAgg,
        subscriptionKpiAgg,
        templeGrowthRes,
        recentTemplesRes,
        recentPaymentsRes,
        recentSubscriptionsRes,
      ] = await Promise.all([
        billing.revenueDashboard({ period }),
        billing.revenueDashboard({ period: "last-month" }),
        pool.query<{
          total: number;
          devotees: number;
          trial_count: number;
          oldest_trial_ends_at: string | null;
        }>(
          `SELECT
             COUNT(*)::int AS total,
             COALESCE(SUM(devotees), 0)::int AS devotees,
             COUNT(*) FILTER (WHERE status = 'Trial')::int AS trial_count,
             (MIN(trial_ends_at) FILTER (WHERE status = 'Trial' AND trial_ends_at IS NOT NULL))::timestamptz::text AS oldest_trial_ends_at
           FROM public.temples`
        ),
        pool.query<{ plan: string; cnt: number }>(
          `SELECT COALESCE(NULLIF(TRIM(plan), ''), '—') AS plan,
                  COUNT(*)::int AS cnt
           FROM public.temples
           GROUP BY 1
           ORDER BY cnt DESC, plan ASC`
        ),
        pool.query<{ verified: number; pending: number; total: number; oldest_pending_at: string | null }>(
          `SELECT
             COUNT(*) FILTER (WHERE compliance = 'Verified')::int AS verified,
             COUNT(*) FILTER (WHERE compliance = 'Pending')::int AS pending,
             COUNT(*)::int AS total,
             (MIN(created_at) FILTER (WHERE compliance = 'Pending'))::timestamptz::text AS oldest_pending_at
           FROM public.temples`
        ),
        listPendingPaymentSubmissionsForConfirm(),
        pool.query<{ tenant_id: string; name: string; created_at: string }>(
          `SELECT tenant_id, name, created_at::text AS created_at
           FROM public.temples
           ORDER BY created_at DESC
           LIMIT 1`
        ),
        pool.query<{ active_now: number; active_at_month_start: number }>(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'Active')::int AS active_now,
             COUNT(*) FILTER (
               WHERE status = 'Active'
                 AND created_at < date_trunc('month', CURRENT_DATE)
             )::int AS active_at_month_start
           FROM public.temples`
        ),
        pool.query<{ active_count: number; expiring_this_month: number }>(
          `SELECT
             COUNT(*) FILTER (WHERE s.status = 'Active')::int AS active_count,
             COUNT(*) FILTER (
               WHERE s.status = 'Active'
                 AND s.expires_on >= date_trunc('month', CURRENT_DATE)::date
                 AND s.expires_on < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
             )::int AS expiring_this_month
           FROM public.subscriptions s`
        ),
        pool.query<{ month_key: string; cnt: number }>(
          `WITH months AS (
             SELECT generate_series(
               date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
               date_trunc('month', CURRENT_DATE),
               INTERVAL '1 month'
             )::date AS month_start
           )
           SELECT
             to_char(m.month_start, 'YYYY-MM') AS month_key,
             COUNT(t.tenant_id)::int AS cnt
           FROM months m
           LEFT JOIN public.temples t
             ON t.created_at >= m.month_start
            AND t.created_at < (m.month_start + INTERVAL '1 month')
           GROUP BY m.month_start
           ORDER BY m.month_start ASC`
        ),
        pool.query<{
          tenant_id: string;
          name: string;
          country_code: string;
          status: string;
          created_at: string;
        }>(
          `SELECT tenant_id, name, country_code, status, created_at::text AS created_at
           FROM public.temples
           ORDER BY created_at DESC
           LIMIT 5`
        ),
        pool.query<{
          recorded_at: string;
          temple_name: string;
          city: string;
          country_code: string;
          amount_cents: number;
        }>(
          `SELECT
             tx.recorded_at::text AS recorded_at,
             t.name AS temple_name,
             t.city,
             t.country_code,
             tx.amount_cents
           FROM public.billing_transactions tx
           JOIN public.temples t ON t.tenant_id = tx.tenant_id
           WHERE tx.status = 'paid'
           ORDER BY tx.recorded_at DESC
           LIMIT 5`
        ),
        pool.query<{
          payment_date: string;
          temple_name: string;
          city: string;
          country_code: string;
          plan: string;
        }>(
          `SELECT
             COALESCE(s.payment_date, s.created_at)::text AS payment_date,
             t.name AS temple_name,
             t.city,
             t.country_code,
             s.plan
           FROM public.subscriptions s
           JOIN public.temples t ON t.tenant_id = s.tenant_id
           WHERE s.status = 'Active'
           ORDER BY COALESCE(s.payment_date, s.created_at) DESC
           LIMIT 5`
        ),
      ]);

      const totalTemples = templeAgg.rows[0]?.total ?? 0;
      const globalDevotees = templeAgg.rows[0]?.devotees ?? 0;

      const complianceTotal = complianceAgg.rows[0]?.total ?? 0;
      const verified = complianceAgg.rows[0]?.verified ?? 0;
      const pendingCompliance = complianceAgg.rows[0]?.pending ?? 0;
      const avgCompliancePct =
        complianceTotal <= 0
          ? null
          : Math.max(0, Math.min(100, Math.round(((verified + pendingCompliance * 0.5) / complianceTotal) * 1000) / 10));

      const planBreakdownPct = planAgg.rows.map((r0) => {
        const count = r0.cnt ?? 0;
        const percent = totalTemples <= 0 ? 0 : Math.round((count / totalTemples) * 1000) / 10;
        return { plan: r0.plan, count, percent };
      });

      const pendingCount = pendingSubmissions.length;
      const pendingLatestCreatedAt = pendingSubmissions[0]?.createdAt ?? null;

      const pendingAlert: SuperAdminDashboardOverviewResponse["alerts"][number] = {
        type: "pending_payment",
        title: "Payment Verification",
        count: pendingCount,
        createdAt: pendingLatestCreatedAt,
      };

      const trialCount = templeAgg.rows[0]?.trial_count ?? 0;
      const oldestTrialEndsAt = templeAgg.rows[0]?.oldest_trial_ends_at ?? null;
      const trialAlert: SuperAdminDashboardOverviewResponse["alerts"][number] = {
        type: "trial_temples",
        title: "Temples on Trial",
        count: trialCount,
        oldestTrialEndsAt,
      };

      const lt = latestTemple.rows[0];
      const newTempleAlert: SuperAdminDashboardOverviewResponse["alerts"][number] | null =
        lt?.tenant_id && lt?.created_at
          ? {
              type: "new_temple",
              title: "New Temple Onboarded",
              tenantId: lt.tenant_id,
              templeName: lt.name,
              createdAt: lt.created_at,
            }
          : null;

      const alerts: SuperAdminDashboardOverviewResponse["alerts"] = [pendingAlert, trialAlert];
      if (newTempleAlert) alerts.push(newTempleAlert);

      const activeNow = activeKpiAgg.rows[0]?.active_now ?? 0;
      const activeAtMonthStart = activeKpiAgg.rows[0]?.active_at_month_start ?? 0;

      const mrrCents = calcMrrCents(financial.subscriptionSummary);
      const lastMonthMrrCents = calcMrrCents(lastMonthFinancial.subscriptionSummary);

      const monthLabel = (monthKey: string) => {
        const [y, m] = monthKey.split("-").map(Number);
        const d = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, 1));
        return d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
      };

      const templeGrowth = templeGrowthRes.rows.map((row) => ({
        monthKey: row.month_key,
        monthLabel: monthLabel(row.month_key),
        count: row.cnt ?? 0,
      }));

      const recentTemples: DashboardRecentTemple[] = recentTemplesRes.rows.map((row) => ({
        tenantId: row.tenant_id,
        name: row.name,
        country: row.country_code,
        status: row.status,
        createdAt: row.created_at,
      }));

      const activities: DashboardRecentActivity[] = [];

      for (const row of recentSubscriptionsRes.rows) {
        activities.push({
          type: "subscription_upgraded",
          title: "Subscription upgraded",
          subtitle: `${row.temple_name} — ${row.plan} (${row.city}, ${row.country_code})`,
          timestamp: row.payment_date,
        });
      }

      for (const row of recentPaymentsRes.rows) {
        activities.push({
          type: "payment_received",
          title: "Payment received",
          subtitle: `${row.temple_name} (${row.city}, ${row.country_code})`,
          timestamp: row.recorded_at,
        });
      }

      for (const sub of pendingSubmissions.slice(0, 3)) {
        activities.push({
          type: "pending_payment",
          title: "Payment verification pending",
          subtitle: sub.temple ?? "Awaiting confirmation",
          timestamp: sub.createdAt,
          href: "/super-admin/finance/confirm-payments",
        });
      }

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const recentActivities = activities.slice(0, 10);

      const out: SuperAdminDashboardOverviewResponse = {
        period: financial?.period ?? null,
        kpis: {
          totalTemples,
          globalDevotees,
          avgCompliancePct,
          planBreakdownPct,
          financial,
        },
        kpiCards: {
          activeTemples: {
            count: activeNow,
            changePct: pctChange(activeNow, activeAtMonthStart),
          },
          activeSubscriptions: {
            count: subscriptionKpiAgg.rows[0]?.active_count ?? 0,
            expiringThisMonth: subscriptionKpiAgg.rows[0]?.expiring_this_month ?? 0,
          },
          mrrCents: {
            amountCents: mrrCents,
            changePct: pctChange(mrrCents, lastMonthMrrCents),
          },
          pendingVerifications: {
            count: pendingCompliance,
            oldestDaysAgo: daysSince(complianceAgg.rows[0]?.oldest_pending_at ?? null),
          },
        },
        templeGrowth,
        recentTemples,
        recentActivities,
        alerts,
      };

      sendSuccess(res, 200, out, "Super-admin dashboard overview", "Aggregate KPIs for the super-admin home dashboard.");
    })
  );

  return r;
}
