"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import AdminListCard from "@/app/components/admin/AdminListCard";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import {
  HorizontalBarChartSkeleton,
  KpiTileGridSkeleton,
} from "@/app/components/admin/ApiFetchPlaceholders";

// ── Types ──────────────────────────────────────────────────────────

type TempleSummary = {
  id: string;
  name: string;
  location: string;
  portalUrl: string;
  initials: string;
  plan: string;
  billing: string;
  amount: string;
  status: "active" | "pending" | "trial";
  nextRenewal: string;
};

// ── Helpers ──────────────────────────────────────────────────────────

function statusBadgeColor(s: string) {
  if (s === "active") return "success" as const;
  if (s === "pending") return "warning" as const;
  if (s === "trial") return "warning" as const;
  return "gray" as const;
}

function statusLabel(s: string) {
  if (s === "active") return "Active";
  if (s === "pending") return "Awaiting payment";
  if (s === "trial") return "Trial";
  return s;
}

function planBadgeColor(p: string) {
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "pink" as const;
}

// ── API Types ──────────────────────────────────────────────────────

type ApiDashboard = {
  period?: { startDate: string; endDateExclusive: string };
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
  subscriptionSummary: Array<{
    tenantId: string;
    templeName: string;
    location: string;
    portalUrl: string;
    plan: string;
    billingCycle: string;
    amountCents: number;
    status: "active" | "pending" | "trial";
    nextRenewal: string | null;
  }>;
};

type BillingProfile = {
  issuer: { name: string; address: string; email: string; website: string; brandLine: string };
  paymentMethodLabel: string;
  bank: { bankName: string; accountName: string; accountNumber: string; swift: string; notes: string };
  tax: { rateBps: number; label: string };
  money: { currency: string };
};

// ── Bar Chart Component ──────────────────────────────────────────

function HorizontalBarChart({ title, subtitle, bars }: {
  title: string;
  subtitle?: string;
  bars: { label: string; value: string; percentage: number; color: string }[];
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
        {subtitle && <span className="text-[10px] text-text-tertiary">{subtitle}</span>}
      </div>
      <div className="space-y-3">
        {bars.map((bar, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-[140px] text-right shrink-0 truncate">{bar.label}</span>
            <div className="flex-1 bg-subtle rounded h-[22px] overflow-hidden">
              <div
                className={`h-full rounded flex items-center px-2 transition-all duration-500 ${bar.color}`}
                style={{ width: `${bar.percentage}%` }}
              >
                <span className="text-[10px] font-bold text-white whitespace-nowrap">{bar.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────

export default function RevenueDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [dash, setDash] = useState<ApiDashboard | null>(null);
  const [profile, setProfile] = useState<BillingProfile | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setLoadErr(null);
      try {
        const profRes = await fetch("/api/billing/profile", { cache: "no-store" });
        const prof = (await profRes.json().catch(() => null)) as { success?: boolean; data?: BillingProfile } | null;
        if (!cancel && prof && prof.success === true && prof.data) setProfile(prof.data);

        const res = await fetch(`/api/billing/revenue-dashboard?period=this-month`, { cache: "no-store" });
        const d = (await res.json().catch(() => null)) as { success?: boolean; data?: ApiDashboard } | null;
        if (cancel) return;
        if (!d || d.success !== true || !d.data) {
          setDash(null);
          setLoadErr(jsonApiErrorMessage(d) || "Failed to load revenue dashboard");
          return;
        }
        setDash(d.data);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const temples: TempleSummary[] = (dash?.subscriptionSummary ?? []).map((r) => ({
    id: r.tenantId,
    name: r.templeName,
    location: r.location,
    portalUrl: r.portalUrl,
    initials: (r.templeName.trim().split(/\s+/).filter(Boolean)[0]?.[0] ?? "T") + (r.templeName.trim().split(/\s+/).filter(Boolean)[1]?.[0] ?? ""),
    plan: r.plan,
    billing: profile?.paymentMethodLabel || "—",
    amount: r.amountCents ? `${formatUsdFromCents(r.amountCents)}${r.billingCycle === "Annual" ? "/yr" : "/mo"}` : "—",
    status: r.status,
    nextRenewal: r.nextRenewal ?? "—",
  }));

  const kpis = dash?.kpis;

  const columns = useMemo<ColumnDef<TempleSummary>[]>(() => [
    {
      key: "name", header: "Temple", sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-sm">🛕</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{r.name}</p>
            <p className="text-[10px] text-text-tertiary truncate">{r.location} · {r.portalUrl}</p>
          </div>
        </div>
      ),
    },
    {
      key: "plan", header: "Plan",
      cell: (r) => <Badge color={planBadgeColor(r.plan)} size="sm" dot>{r.plan}</Badge>,
    },
    {
      key: "billing", header: "Billing",
      cell: (r) => <Badge color="indigo" size="sm">{r.billing}</Badge>,
    },
    {
      key: "amount", header: "Amount",
      cell: (r) => <span className="text-sm font-bold text-green-600">{r.amount}</span>,
    },
    {
      key: "status", header: "Status",
      cell: (r) => <Badge color={statusBadgeColor(r.status)} size="sm" dot>{statusLabel(r.status)}</Badge>,
    },
    {
      key: "nextRenewal", header: "Next renewal",
      cell: (r) => <span className="text-xs text-text-tertiary">{r.nextRenewal}</span>,
    },
    {
      key: "actions", header: "Actions", align: "right",
      cell: () => (
        <div className="flex items-center gap-1.5">
          <Link href="/super-admin/finance/invoices/generate">
            <Button variant="outline" size="sm">Invoice</Button>
          </Link>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-5">
      {loadErr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {loadErr}
        </div>
      )}
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Revenue Dashboard</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            {(profile?.issuer?.name ? `${profile.issuer.name} ` : "")}
            subscription revenue from all onboarded temples
            {dash?.period?.startDate ? ` · ${dash.period.startDate}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/super-admin/finance/invoices/generate">
            <Button variant="primary" size="sm" leadingIcon={<Plus className="h-4 w-4" />}>Generate invoice</Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      {loading ? (
        <KpiTileGridSkeleton columns={4} />
      ) : kpis ? (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="text-lg mb-2">💰</div>
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">MRR (Monthly Recurring)</p>
            <p className="text-2xl font-bold text-green-600">{formatUsdFromCents(kpis.paidAmountCents)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">from {kpis.paidCount} payment(s) confirmed</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="text-lg mb-2">📈</div>
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">ARR (Annual Recurring)</p>
            <p className="text-2xl font-bold text-brand">{formatUsdFromCents(kpis.paidAmountCents * 12)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">simple annualized from this period</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="text-lg mb-2">⏳</div>
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Pending payments</p>
            <p className="text-2xl font-bold text-amber-600">{formatUsdFromCents(kpis.pendingAmountCents)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">{kpis.pendingCount} invoice(s) awaiting bank transfer</p>
            <p className="text-[10px] font-semibold text-amber-600 mt-1">{kpis.overdueCount} overdue</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="text-lg mb-2">🛕</div>
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Active temples</p>
            <p className="text-2xl font-bold text-indigo-600">{kpis.activeTemples}</p>
            <p className="text-[10px] text-text-tertiary mt-1">{kpis.trialTemples} on trial</p>
          </div>
        </div>
      ) : null}

      {/* Two Charts Side by Side */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <HorizontalBarChartSkeleton />
          <HorizontalBarChartSkeleton />
        </div>
      ) : dash ? (
        <div className="grid grid-cols-2 gap-3">
          <HorizontalBarChart
            title="Revenue by plan"
            subtitle="this month"
            bars={(dash.revenueByPlan ?? []).map((b, i) => {
              const colors = ["bg-brand", "bg-indigo-500", "bg-purple-500", "bg-green-500", "bg-amber-500"];
              const total = (dash.revenueByPlan ?? []).reduce((a, x) => a + x.amountCents, 0) || 1;
              return {
                label: b.plan,
                value: `${formatUsdFromCents(b.amountCents)} × ${b.count}`,
                percentage: Math.max(0, Math.min(100, Math.round((b.amountCents / total) * 100))),
                color: colors[i % colors.length]!,
              };
            })}
          />
          <HorizontalBarChart
            title="Monthly revenue trend"
            bars={(dash.trend ?? []).map((t, i, arr) => {
              const max = Math.max(1, ...arr.map((x) => x.amountCents));
              return {
                label: t.month,
                value: formatUsdFromCents(t.amountCents),
                percentage: Math.max(0, Math.min(100, Math.round((t.amountCents / max) * 100))),
                color: i === arr.length - 1 ? "bg-brand" : "bg-green-500",
              };
            })}
          />
        </div>
      ) : null}

      {/* Temple Subscription Summary Table */}
      <div>
        <AdminListCard>
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-bold text-text-primary">Temple subscription summary</h2>
            <Link href="/super-admin/finance/subscriptions" className="shrink-0">
              <Button variant="outline" size="sm">View all →</Button>
            </Link>
          </div>
          <DataTable<TempleSummary>
            columns={columns}
            data={temples}
            keyExtractor={(r) => r.id}
            isLoading={loading}
            loadingRows={5}
          />
        </AdminListCard>
      </div>

    </div>
  );
}
