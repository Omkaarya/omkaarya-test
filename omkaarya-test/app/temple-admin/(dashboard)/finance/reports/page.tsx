"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";

import {
  fetchTempleAdminJson,
  type Booking,
  type DashboardSummary,
  type FinanceTransaction,
} from "@/lib/temple-admin-api";

function fmtCurrency(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return `${currency} 0`;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

function Segment({ items, active, onChange }: { items: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
      {items.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
            active === s ? "bg-white dark:bg-zinc-800 text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

const PERIODS = {
  Today: 1,
  "This week": 7,
  "This month": 30,
  "This year": 365,
} as const;

type Period = keyof typeof PERIODS;

export default function TempleReportsPage() {
  const [period, setPeriod] = useState<Period>("This month");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [tx, setTx] = useState<FinanceTransaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const days = PERIODS[period];
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const [sum, txData, bks] = await Promise.all([
          fetchTempleAdminJson<{ summary: DashboardSummary }>("/api/temple-admin/dashboard/summary"),
          fetchTempleAdminJson<{ items: FinanceTransaction[] }>(
            `/api/temple-admin/finance/transactions?from=${encodeURIComponent(from)}&limit=500`
          ),
          fetchTempleAdminJson<{ items: Booking[] }>(
            `/api/temple-admin/bookings?from=${encodeURIComponent(from)}`
          ),
        ]);
        if (!cancelled) {
          setSummary(sum.summary ?? null);
          setTx(txData.items ?? []);
          setBookings(bks.items ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load reports.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let donations = 0;
    let posSales = 0;
    let bookingIncome = 0;
    for (const t of tx) {
      const a = Number(t.amount);
      if (!Number.isFinite(a)) continue;
      if (a >= 0) income += a;
      else expense += Math.abs(a);
      if (t.source_table === "donation") donations += a;
      if (t.source_table === "pos_order") posSales += a;
      if (t.source_table === "booking") bookingIncome += a;
    }
    return { income, expense, donations, posSales, bookingIncome, surplus: income - expense };
  }, [tx]);

  const breakdown = useMemo(() => {
    const total = stats.donations + stats.bookingIncome + stats.posSales;
    if (total === 0) return [];
    return [
      { label: "Donations", value: stats.donations, color: "bg-blue-600" },
      { label: "Pooja bookings", value: stats.bookingIncome, color: "bg-orange-500" },
      { label: "Counter sales", value: stats.posSales, color: "bg-green-600" },
    ].map((b) => ({ ...b, pct: (b.value / total) * 100 }));
  }, [stats]);

  const poojaReport = useMemo(() => {
    const map = new Map<string, { bookings: number; total: number }>();
    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      const cur = map.get(b.pooja_name) ?? { bookings: 0, total: 0 };
      cur.bookings += 1;
      cur.total += Number(b.amount_total) || 0;
      map.set(b.pooja_name, cur);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name,
        bookings: v.bookings,
        total: v.total,
        avg: v.bookings > 0 ? v.total / v.bookings : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [bookings]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Reports</h1>
          <p className="mt-1 text-sm text-text-tertiary">Live financial and operational reports.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 flex-wrap shadow-sm">
        <Segment items={Object.keys(PERIODS)} active={period} onChange={(v) => setPeriod(v as Period)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total income</p>
          <p className="text-2xl font-bold text-green-600">{loading ? "…" : fmtCurrency(stats.income)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total expenses</p>
          <p className="text-2xl font-bold text-red-600">{loading ? "…" : fmtCurrency(stats.expense)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Net surplus</p>
          <p className="text-2xl font-bold text-[var(--brand-primary)]">{loading ? "…" : fmtCurrency(stats.surplus)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Donations</p>
          <p className="text-2xl font-bold text-blue-600">{loading ? "…" : fmtCurrency(stats.donations)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-5 flex items-center gap-2">
          <PieChart className="h-4 w-4" /> Income breakdown
        </h3>
        {loading ? (
          <div className="text-center py-6 text-sm text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Loading…
          </div>
        ) : breakdown.length === 0 ? (
          <div className="text-[12px] text-text-tertiary py-6 text-center">No income recorded for this period.</div>
        ) : (
          <div className="space-y-4">
            {breakdown.map((b) => (
              <div key={b.label} className="flex items-center gap-4">
                <span className="text-xs font-bold text-[var(--text-primary)] w-[120px] text-right shrink-0">{b.label}</span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg h-8 overflow-hidden">
                  <div
                    className={`h-full flex items-center px-3 ${b.color} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(2, b.pct)}%` }}
                  >
                    <span className="text-[11px] font-bold text-white">{fmtCurrency(b.value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Pooja report
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["Pooja type", "Bookings", "Total collection", "Avg per booking"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-500">
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Loading…
                  </td>
                </tr>
              ) : poojaReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-500">
                    No bookings in this period.
                  </td>
                </tr>
              ) : (
                poojaReport.map((r) => (
                  <tr key={r.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="min-w-0 overflow-hidden px-6 py-4 text-sm font-bold text-[var(--text-primary)]">
                      <TruncateText title={r.name}>{r.name}</TruncateText>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{r.bookings}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">{fmtCurrency(r.total)}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[var(--text-muted)]">{fmtCurrency(r.avg)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {summary && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Inventory</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{summary.inventory.totalProducts}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">products tracked</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Low stock</p>
            <p className="text-lg font-bold text-amber-600">{summary.inventory.lowStock}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Out of stock</p>
            <p className="text-lg font-bold text-red-600">{summary.inventory.outOfStock}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Today's bookings</p>
            <p className="text-lg font-bold text-[var(--brand-primary)]">{summary.bookings.today}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{summary.bookings.upcoming} upcoming</p>
          </div>
        </div>
      )}
    </div>
  );
}
