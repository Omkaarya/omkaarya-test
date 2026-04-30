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

export type SuperAdminDashboardOverviewResponse = {
  period: { startDate: string; endDateExclusive: string } | null;
  kpis: {
    totalTemples: number;
    globalDevotees: number;
    avgCompliancePct: number | null;
    planBreakdownPct: Array<{ plan: string; percent: number; count: number }>;
    financial: Awaited<ReturnType<PostgresBillingRepository["revenueDashboard"]>>;
  };
  alerts: Array<
    | { type: "pending_payment"; title: string; count: number; createdAt: string | null }
    | { type: "trial_temples"; title: string; count: number; oldestTrialCreatedAt: string | null }
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

      const [financial, templeAgg, planAgg, complianceAgg, pendingSubmissions, latestTemple] = await Promise.all([
        billing.revenueDashboard({ period }),
        pool.query<{ total: number; devotees: number; trial_count: number; oldest_trial_created_at: string | null }>(
          `SELECT
             COUNT(*)::int AS total,
             COALESCE(SUM(devotees), 0)::int AS devotees,
             COUNT(*) FILTER (WHERE status = 'Trial')::int AS trial_count,
             (MIN(created_at) FILTER (WHERE status = 'Trial'))::timestamptz::text AS oldest_trial_created_at
           FROM public.temples`
        ),
        pool.query<{ plan: string; cnt: number }>(
          `SELECT COALESCE(NULLIF(TRIM(plan), ''), '—') AS plan,
                  COUNT(*)::int AS cnt
           FROM public.temples
           GROUP BY 1
           ORDER BY cnt DESC, plan ASC`
        ),
        pool.query<{ verified: number; pending: number; total: number }>(
          `SELECT
             COUNT(*) FILTER (WHERE compliance = 'Verified')::int AS verified,
             COUNT(*) FILTER (WHERE compliance = 'Pending')::int AS pending,
             COUNT(*)::int AS total
           FROM public.temples`
        ),
        listPendingPaymentSubmissionsForConfirm(),
        pool.query<{ tenant_id: string; name: string; created_at: string }>(
          `SELECT tenant_id, name, created_at::text AS created_at
           FROM public.temples
           ORDER BY created_at DESC
           LIMIT 1`
        ),
      ]);

      const totalTemples = templeAgg.rows[0]?.total ?? 0;
      const globalDevotees = templeAgg.rows[0]?.devotees ?? 0;

      const complianceTotal = complianceAgg.rows[0]?.total ?? 0;
      const verified = complianceAgg.rows[0]?.verified ?? 0;
      const pending = complianceAgg.rows[0]?.pending ?? 0;
      const avgCompliancePct =
        complianceTotal <= 0 ? null : Math.max(0, Math.min(100, Math.round(((verified + pending * 0.5) / complianceTotal) * 1000) / 10));

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
      const oldestTrialCreatedAt = templeAgg.rows[0]?.oldest_trial_created_at ?? null;
      const trialAlert: SuperAdminDashboardOverviewResponse["alerts"][number] = {
        type: "trial_temples",
        title: "Temples on Trial",
        count: trialCount,
        oldestTrialCreatedAt,
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

      const out: SuperAdminDashboardOverviewResponse = {
        period: financial?.period ?? null,
        kpis: {
          totalTemples,
          globalDevotees,
          avgCompliancePct,
          planBreakdownPct,
          financial,
        },
        alerts,
      };

      sendSuccess(res, 200, out, "Super-admin dashboard overview", "Aggregate KPIs for the super-admin home dashboard.");
    })
  );

  return r;
}

