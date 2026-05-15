"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, PieChart, TrendingUp } from "lucide-react";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { MetricCardGridSkeleton } from "@/app/components/admin/ApiFetchPlaceholders";

// ── Page Component ──────────────────────────────────────────────────

type Overview = {
  period: { startDate: string; endDateExclusive: string } | null;
  kpis: {
    totalTemples: number;
    globalDevotees: number;
    avgCompliancePct: number | null;
    planBreakdownPct: Array<{ plan: string; percent: number; count: number }>;
    financial: {
      period: { startDate: string; endDateExclusive: string };
      kpis: {
        paidAmountCents: number;
        paidCount: number;
        pendingAmountCents: number;
        pendingCount: number;
        overdueAmountCents: number;
        overdueCount: number;
        activeTemples: number;
        trialTemples: number;
      };
      revenueByPlan: Array<{ plan: string; amountCents: number; count: number }>;
      trend: Array<{ month: string; amountCents: number }>;
    };
  };
  alerts: Array<
    | { type: "pending_payment"; title: string; count: number; createdAt: string | null }
    | { type: "trial_temples"; title: string; count: number; oldestTrialCreatedAt: string | null }
    | { type: "new_temple"; title: string; tenantId: string; templeName: string; createdAt: string }
  >;
};

function compactNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setLoadErr(null);
      try {
        const res = await fetch(`/api/super-admin/dashboard/overview?period=this-month`, { cache: "no-store" });
        const j = (await res.json().catch(() => null)) as { success?: boolean; data?: Overview } | null;
        if (cancel) return;
        if (!j || j.success !== true || !j.data) {
          setOverview(null);
          setLoadErr(jsonApiErrorMessage(j) || "Failed to load dashboard overview");
          return;
        }
        setOverview(j.data);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const topPlan = overview?.kpis.planBreakdownPct?.[0];
  const pendingPaymentAlert = overview?.alerts.find((a) => a.type === "pending_payment") as
    | { type: "pending_payment"; title: string; count: number; createdAt: string | null }
    | undefined;

  const chartLine = useMemo(() => {
    const src = overview?.kpis.financial.revenueByPlan ?? [];
    if (src.length === 0) return "No paid transactions for this period.";
    const total = src.reduce((a, x) => a + x.amountCents, 0) || 1;
    return src
      .slice(0, 5)
      .map((x) => `${x.plan} (${Math.round((x.amountCents / total) * 100)}%)`)
      .join(", ");
  }, [overview]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {loadErr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {loadErr}
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
            Analytics Overview
          </h1>
          <p className="mt-1 text-sm text-text-tertiary font-medium">
            Global platform health, multi-tenant performance, and financial
            monitoring.
          </p>
        </div>
        <Badge
          color={loading ? "gray" : overview ? "success" : "warning"}
          size="sm"
          className="font-bold py-1 px-3"
        >
          {loading ? "LOADING…" : overview ? "SYSTEM ONLINE" : "SYSTEM DEGRADED"}
        </Badge>
      </div>

      {/* ── SECTION 1: Temple Analytics ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Building2 className="w-4 h-4 text-text-disabled" />
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
            Global Temple Health
          </h2>
        </div>
        {loading ? (
          <MetricCardGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Temples"
              value={overview ? String(overview.kpis.totalTemples) : "—"}
              trendLabel="Total onboarded"
              chartColor="brand"
              showMenu={false}
            />
            <MetricCard
              title="Plan Breakdown"
              value={overview && topPlan ? `${topPlan.percent}%` : "—"}
              trendLabel={overview && topPlan ? `${topPlan.plan} (${topPlan.count})` : "Top plan"}
              chartColor="brand"
              showMenu={false}
            />
            <MetricCard
              title="Global Devotees"
              value={overview ? compactNumber(overview.kpis.globalDevotees) : "—"}
              trendLabel="Sum across temples"
              chartColor="brand"
              showMenu={false}
            />
            <MetricCard
              title="Avg. Compliance"
              value={overview?.kpis.avgCompliancePct != null ? `${overview.kpis.avgCompliancePct}%` : "—"}
              trendLabel="From compliance status"
              chartColor="success"
              showMenu={false}
            />
          </div>
        )}
      </div>

      {/* ── SECTION 2: Financial & Subscription Analytics ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-4 h-4 text-text-disabled" />
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
            Financial Performance
          </h2>
        </div>
        {loading ? (
          <MetricCardGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={overview ? formatUsdFromCents(overview.kpis.financial.kpis.paidAmountCents) : "—"}
              trendLabel="Confirmed this period"
              chartColor="success"
              showMenu={false}
            />
            <MetricCard
              title="Pending Subs"
              value={overview ? String(pendingPaymentAlert?.count ?? 0) : "—"}
              trendLabel="Awaiting verification"
              chartColor="warning"
              showMenu={false}
            />
            <MetricCard
              title="Active Subs"
              value={overview ? String(overview.kpis.financial.kpis.activeTemples) : "—"}
              trendLabel={overview ? `${overview.kpis.financial.kpis.trialTemples} on trial` : "Verified accounts"}
              chartColor="brand"
              showMenu={false}
            />
            <MetricCard
              title="Avg. MRR"
              value={overview ? formatUsdFromCents(overview.kpis.financial.kpis.paidAmountCents) : "—"}
              trendLabel="Recurring revenue (period)"
              chartColor="brand"
              showMenu={false}
            />
          </div>
        )}
      </div>

      {/* ── SECTION 3: Operations & Reports ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Revenue by Plan Chart Placeholder */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between shadow-xs min-h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight">
                Revenue Breakdown by Plan
              </h3>
            </div>
            <button className="text-xs font-bold text-text-tertiary hover:text-brand transition-colors">
              7 DAYS
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl text-text-disabled text-xs font-medium">
            Chart: {chartLine}
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight mb-4">
            Critical Alerts
          </h3>
          <div className="space-y-3">
            {loading && (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-subtle border border-border" />
                ))}
              </div>
            )}
            {!loading && (overview?.alerts ?? []).map((alert, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-subtle border border-border"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    alert.type === "pending_payment"
                      ? "bg-amber-500"
                      : alert.type === "trial_temples"
                        ? "bg-red-500"
                        : "bg-emerald-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-text-primary">
                    {alert.type === "pending_payment"
                      ? `${alert.title} (${alert.count})`
                      : alert.type === "trial_temples"
                        ? `${alert.title} (${alert.count})`
                        : `${alert.title}: ${alert.templeName}`}
                  </p>
                  <p className="text-[10px] text-text-tertiary">
                    {alert.type === "pending_payment"
                      ? timeAgo(alert.createdAt)
                      : alert.type === "trial_temples"
                        ? timeAgo(alert.oldestTrialCreatedAt)
                        : timeAgo(alert.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
