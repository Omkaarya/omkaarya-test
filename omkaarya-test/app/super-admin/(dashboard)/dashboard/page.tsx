"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, CreditCard, ShieldCheck, TrendingUp, Users2 } from "lucide-react";
import { formatMoneyFromCents } from "@/lib/temple-pricing-plans";
import { useBillingCurrency } from "@/lib/use-billing-currency";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import SelectInput from "@/app/components/admin/SelectInput";
import {
  DashboardChartRowSkeleton,
  DashboardStatCardSkeleton,
} from "@/app/components/admin/ApiFetchPlaceholders";
import { DashboardGreeting } from "./_components/DashboardGreeting";
import { DashboardStatCard } from "./_components/DashboardStatCard";
import { TempleGrowthChart } from "./_components/TempleGrowthChart";
import { SubscriptionDonutChart } from "./_components/SubscriptionDonutChart";
import { RecentlyAddedList } from "./_components/RecentlyAddedList";
import { RecentActivitiesFeed } from "./_components/RecentActivitiesFeed";
import type { RecentActivityItem } from "./_components/RecentActivitiesFeed";
import type { RecentTempleItem } from "./_components/RecentlyAddedList";
import type { TempleGrowthPoint } from "./_components/TempleGrowthChart";
import type { PlanBreakdownItem } from "./_components/SubscriptionDonutChart";

type DashboardAlert =
  | { type: "pending_payment"; title: string; count: number; createdAt: string | null }
  | { type: "trial_temples"; title: string; count: number; oldestTrialEndsAt: string | null }
  | { type: "new_temple"; title: string; tenantId: string; templeName: string; createdAt: string };

type Overview = {
  period: { startDate: string; endDateExclusive: string } | null;
  kpis: {
    totalTemples: number;
    globalDevotees: number;
    avgCompliancePct: number | null;
    planBreakdownPct: PlanBreakdownItem[];
    financial: {
      paidAmountCents?: number;
      pendingAmountCents?: number;
    };
  };
  kpiCards: {
    activeTemples: { count: number; changePct: number | null };
    activeSubscriptions: { count: number; expiringThisMonth: number };
    mrrCents: { amountCents: number; changePct: number | null };
    pendingVerifications: { count: number; oldestDaysAgo: number | null };
  };
  templeGrowth: TempleGrowthPoint[];
  recentTemples: RecentTempleItem[];
  recentActivities: RecentActivityItem[];
  alerts: DashboardAlert[];
};

function formatChangePct(pct: number | null, suffix: string): { text: string; direction: "up" | "down" | "neutral" } {
  if (pct === null) return { text: suffix, direction: "neutral" };
  if (pct > 0) return { text: `↑ ${pct}% ${suffix}`, direction: "up" };
  if (pct < 0) return { text: `↓ ${Math.abs(pct)}% ${suffix}`, direction: "down" };
  return { text: `— ${suffix}`, direction: "neutral" };
}

export default function SuperAdminDashboard() {
  const billingCurrency = useBillingCurrency();
  const [period, setPeriod] = useState("this-month");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const res = await fetch(`/api/super-admin/dashboard/overview?period=${encodeURIComponent(period)}`, {
        cache: "no-store",
      });
      const j = (await res.json().catch(() => null)) as { success?: boolean; data?: Overview } | null;
      if (!j || j.success !== true || !j.data) {
        setOverview(null);
        setLoadErr(jsonApiErrorMessage(j) || "Failed to load dashboard overview");
        return;
      }
      setOverview(j.data);
    } catch {
      setOverview(null);
      setLoadErr("Failed to load dashboard overview. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const statCards = useMemo(() => {
    const k = overview?.kpiCards;
    if (!k) return null;

    const templesTrend = formatChangePct(k.activeTemples.changePct, "vs month start baseline");
    const mrrTrend = formatChangePct(k.mrrCents.changePct, "vs last month");
    const expiring = k.activeSubscriptions.expiringThisMonth;
    const subsTrend = {
      text:
        expiring > 0
          ? `${expiring} expiring this month`
          : "No subscriptions expiring this month",
      direction: expiring > 0 ? ("down" as const) : ("neutral" as const),
    };
    const pendingTrend = {
      text:
        k.pendingVerifications.oldestDaysAgo != null
          ? `Oldest pending: ${k.pendingVerifications.oldestDaysAgo} days`
          : "No pending compliance reviews",
      direction: "neutral" as const,
    };

    return [
      {
        title: "Active temples",
        value: String(k.activeTemples.count).padStart(2, "0"),
        icon: Building2,
        iconColor: "bg-status-success-text/10 text-status-success-text",
        trendText: templesTrend.text,
        trendDirection: templesTrend.direction,
      },
      {
        title: "Active subscriptions",
        value: String(k.activeSubscriptions.count),
        icon: CreditCard,
        iconColor: "bg-status-success-text/10 text-status-success-text",
        trendText: subsTrend.text,
        trendDirection: subsTrend.direction,
      },
      {
        title: "Active subscription MRR",
        value: formatMoneyFromCents(k.mrrCents.amountCents, billingCurrency),
        icon: TrendingUp,
        iconColor: "bg-status-success-text/10 text-status-success-text",
        trendText: mrrTrend.text,
        trendDirection: mrrTrend.direction,
      },
      {
        title: "Pending compliance reviews",
        value: String(k.pendingVerifications.count).padStart(2, "0"),
        icon: ShieldCheck,
        iconColor: "bg-status-warning-text/10 text-status-warning-text",
        trendText: pendingTrend.text,
        trendDirection: pendingTrend.direction,
      },
    ];
  }, [overview, billingCurrency]);

  const showKpiSkeleton = loading || Boolean(!overview && loadErr);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DashboardGreeting />
        <div className="flex items-center gap-2">
          <label htmlFor="dashboard-period" className="text-xs font-semibold text-text-tertiary">
            Period
          </label>
          <SelectInput
            id="dashboard-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="min-w-[10rem]"
          >
            <option value="this-month">This month</option>
            <option value="last-month">Last month</option>
            <option value="this-year">This year</option>
          </SelectInput>
        </div>
      </div>

      {loadErr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
          {loadErr}
          <button type="button" onClick={() => void loadOverview()} className="ml-3 font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {showKpiSkeleton ? (
        <DashboardStatCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards?.map((card) => (
            <DashboardStatCard key={card.title} {...card} />
          ))}
        </div>
      )}

      {!showKpiSkeleton && overview && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Total temples</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{overview.kpis.totalTemples}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <Users2 className="h-3.5 w-3.5" /> Global devotees
            </p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{overview.kpis.globalDevotees.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Avg compliance score</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {overview.kpis.avgCompliancePct != null ? `${overview.kpis.avgCompliancePct}%` : "—"}
            </p>
          </div>
        </div>
      )}

      {!showKpiSkeleton && overview?.alerts?.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {overview.alerts.map((alert) => (
            <div key={`${alert.type}-${alert.title}`} className="rounded-xl border border-border bg-subtle px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">{alert.title}</p>
              <p className="mt-1 text-lg font-bold text-text-primary">
                {"count" in alert ? alert.count : alert.templeName}
              </p>
              {alert.type === "pending_payment" && alert.count > 0 ? (
                <Link href="/super-admin/finance/confirm-payments" className="mt-2 inline-block text-xs font-semibold text-brand">
                  Review payments →
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {showKpiSkeleton ? (
        <DashboardChartRowSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <TempleGrowthChart data={overview?.templeGrowth ?? []} />
          <RecentlyAddedList items={overview?.recentTemples ?? []} />
        </div>
      )}

      <SubscriptionDonutChart
        data={overview?.kpis.planBreakdownPct ?? []}
        loading={showKpiSkeleton}
      />

      <RecentActivitiesFeed items={overview?.recentActivities ?? []} loading={showKpiSkeleton} />
    </div>
  );
}
