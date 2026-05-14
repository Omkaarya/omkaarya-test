"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  BarChart3,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import {
  fetchTempleAdminJson,
  type DashboardSummary,
  type FinanceTransaction,
} from "@/lib/temple-admin-api";

function fmtCurrency(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return `${currency} 0`;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

function StatBar({ label, value, percentage, colorClass }: { label: string; value: string; percentage: number; colorClass: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="text-[11px] font-bold text-text-secondary w-32 text-right shrink-0">{label}</div>
      <div className="flex-1 h-[22px] bg-gray-100 rounded-lg overflow-hidden border border-border/50 relative">
        <div
          className={`h-full rounded-lg flex items-center px-2 transition-all duration-500 ${colorClass}`}
          style={{ width: `${Math.max(2, Math.min(100, percentage))}%` }}
        >
          <span className="text-[10px] font-black text-white">{value}</span>
        </div>
      </div>
    </div>
  );
}

function typeColor(t: string) {
  switch (t) {
    case "donation":
      return { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-600" };
    case "booking":
    case "pooja":
      return { bg: "bg-brand-muted", text: "text-brand", dot: "bg-brand" };
    case "pos_sale":
    case "pos":
      return { bg: "bg-status-success-bg", text: "text-status-success-text", dot: "bg-status-success-text" };
    case "expense":
      return { bg: "bg-status-danger-bg", text: "text-status-danger-text", dot: "bg-status-danger-text" };
    default:
      return { bg: "bg-gray-100", text: "text-text-secondary", dot: "bg-text-secondary" };
  }
}

export default function FinanceDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [sum, tx] = await Promise.all([
          fetchTempleAdminJson<{ summary: DashboardSummary }>("/api/temple-admin/dashboard/summary"),
          fetchTempleAdminJson<{ items: FinanceTransaction[] }>("/api/temple-admin/finance/transactions?limit=10"),
        ]);
        if (!cancelled) {
          setSummary(sum.summary ?? null);
          setRecent(tx.items ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load finance data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const breakdown = useMemo(() => {
    if (!summary) return null;
    const incomeMonth = Number(summary.finance.incomeMonth) || 0;
    const expenseMonth = Number(summary.finance.expenseMonth) || 0;
    const donationsMonth = Number(summary.donations.monthTotal) || 0;
    const posToday = Number(summary.pos.todayTotal) || 0;
    const totalIncome = incomeMonth + donationsMonth + posToday;
    const surplus = totalIncome - expenseMonth;
    return { incomeMonth, expenseMonth, donationsMonth, posToday, totalIncome, surplus };
  }, [summary]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-text-tertiary mb-1">
            <span>Finance</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand">Dashboard</span>
          </div>
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Finance Dashboard</h1>
          <p className="text-[12px] text-text-tertiary mt-1">
            Live financial overview from your temple operational database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/temple-admin/finance/reports">
            <Button variant="outline" size="sm" leadingIcon={<BarChart3 className="w-4 h-4" />}>
              View Reports
            </Button>
          </Link>
          <Link href="/temple-admin/finance/transactions/add">
            <Button size="sm" leadingIcon={<Plus className="w-4 h-4" />}>
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Income (this month)"
          value={loading || !breakdown ? "…" : fmtCurrency(breakdown.totalIncome)}
          chartColor="success"
        />
        <MetricCard
          title="Expenses (this month)"
          value={loading || !breakdown ? "…" : fmtCurrency(breakdown.expenseMonth)}
          chartColor="warning"
        />
        <MetricCard
          title="Net surplus"
          value={loading || !breakdown ? "…" : fmtCurrency(breakdown.surplus)}
          chartColor="brand"
        />
        <MetricCard
          title="Donations (this month)"
          value={loading || !summary ? "…" : fmtCurrency(summary.donations.monthTotal)}
          trendLabel={summary ? `${summary.donations.donorCount} donors` : ""}
          chartColor="brand"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="text-[12px] font-bold text-text-primary mb-4">Income breakdown</div>
          {!breakdown || breakdown.totalIncome === 0 ? (
            <div className="text-[11px] text-text-tertiary py-6 text-center">No income recorded yet.</div>
          ) : (
            <div className="space-y-1">
              <StatBar
                label="Donations"
                value={fmtCurrency(breakdown.donationsMonth)}
                percentage={(breakdown.donationsMonth / breakdown.totalIncome) * 100}
                colorClass="bg-blue-500"
              />
              <StatBar
                label="POS sales (today)"
                value={fmtCurrency(breakdown.posToday)}
                percentage={(breakdown.posToday / breakdown.totalIncome) * 100}
                colorClass="bg-brand"
              />
              <StatBar
                label="Other income"
                value={fmtCurrency(breakdown.incomeMonth)}
                percentage={(breakdown.incomeMonth / breakdown.totalIncome) * 100}
                colorClass="bg-status-success-text"
              />
            </div>
          )}
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="text-[12px] font-bold text-text-primary mb-4">Expense overview</div>
          <div className="text-[11px] text-text-tertiary py-6 text-center">
            {breakdown && breakdown.expenseMonth > 0 ? (
              <span>Total expenses this month: <span className="text-text-primary font-bold">{fmtCurrency(breakdown.expenseMonth)}</span></span>
            ) : (
              <span>No expenses recorded yet.</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-text-primary">Recent transactions</h2>
          <Link href="/temple-admin/finance/transactions">
            <Button variant="outline" size="sm" trailingIcon={<ChevronRight className="w-4 h-4" />}>
              View All
            </Button>
          </Link>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">When</th>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Description</th>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Type</th>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Source</th>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <span className="inline-flex items-center gap-2 text-text-tertiary text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                      </span>
                    </td>
                  </tr>
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-text-tertiary">
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  recent.map((tx) => {
                    const c = typeColor(tx.type);
                    const amount = Number(tx.amount);
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 text-[11px] text-text-tertiary font-medium">
                          {new Date(tx.occurred_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[12px] font-bold text-text-primary">{tx.description || tx.reference}</div>
                          <div className="text-[10px] text-text-tertiary mt-0.5">{tx.reference}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                            {tx.type}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[11px] text-text-secondary font-medium capitalize">
                          {tx.source_table.replace("_", " ")}
                        </td>
                        <td
                          className={`px-5 py-4 text-right text-[13px] font-black tracking-tight ${
                            amount >= 0 ? "text-status-success-text" : "text-status-danger-text"
                          }`}
                        >
                          {fmtCurrency(amount, tx.currency)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
