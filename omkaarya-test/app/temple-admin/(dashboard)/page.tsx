"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  fetchTempleAdminJson,
  type DashboardSummary,
  type FinanceTransaction,
} from "@/lib/temple-admin-api";

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-bold ${
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-zinc-500"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : trend === "down" ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : null}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 tracking-tight uppercase">{title}</p>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{value}</h3>
      </div>
    </div>
  );
}

function ShortcutButton({
  icon: Icon,
  label,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[var(--brand-primary)] hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-bold text-zinc-900 dark:text-white">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[var(--brand-primary)] transition-colors" />
    </Link>
  );
}

function fmtCurrency(amount: string | number, currency = "INR") {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  const symbol = currency === "INR" ? "₹" : currency === "GBP" ? "£" : currency === "USD" ? "$" : "";
  return `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function TempleDashboard() {
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
        const [sumData, txData] = await Promise.all([
          fetchTempleAdminJson<{ summary: DashboardSummary }>("/api/temple-admin/dashboard/summary"),
          fetchTempleAdminJson<{ items: FinanceTransaction[] }>(
            "/api/temple-admin/finance/transactions?limit=10"
          ),
        ]);
        if (!cancelled) {
          setSummary(sumData.summary ?? null);
          setRecent(txData.items ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load dashboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Temple Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Namaste! Here&apos;s what&apos;s happening at your temple today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{dateStr}</span>
          </div>
          <Link
            href="/temple-admin/pos/open-session"
            className="px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-all"
          >
            Open POS
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Income"
          value={loading || !summary ? "…" : fmtCurrency(Number(summary.pos.todayTotal) + Number(summary.donations.todayTotal))}
          change={loading || !summary ? "" : `${summary.pos.todayOrders} POS · ${summary.donations.donorCount} donors`}
          trend="neutral"
          icon={DollarSign}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
        />
        <StatCard
          title="This Month"
          value={loading || !summary ? "…" : fmtCurrency(summary.donations.monthTotal)}
          change={loading || !summary ? "" : `Donations · ${fmtCurrency(summary.finance.incomeMonth)} income`}
          trend="neutral"
          icon={Users}
          color="bg-blue-50 text-blue-600 dark:bg-blue-950/30"
        />
        <StatCard
          title="Today's Sevas"
          value={loading || !summary ? "…" : String(summary.bookings.today)}
          change={loading || !summary ? "" : `${summary.bookings.upcoming} upcoming`}
          trend="neutral"
          icon={Calendar}
          color="bg-purple-50 text-purple-600 dark:bg-purple-950/30"
        />
        <StatCard
          title="POS Sessions"
          value={loading || !summary ? "…" : String(summary.pos.openSessions).padStart(2, "0")}
          change={
            loading || !summary
              ? ""
              : summary.inventory.lowStock > 0 || summary.inventory.outOfStock > 0
                ? `${summary.inventory.lowStock} low · ${summary.inventory.outOfStock} out`
                : "All stocked"
          }
          trend={loading || !summary ? "neutral" : summary.inventory.outOfStock > 0 ? "down" : "up"}
          icon={TrendingUp}
          color="bg-orange-50 text-orange-600 dark:bg-orange-950/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Transactions</h3>
            <Link
              href="/temple-admin/finance/transactions"
              className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-zinc-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading…
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-12 text-sm text-zinc-500">No transactions yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reference</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Source</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {recent.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{tx.reference || "—"}</div>
                        <div className="text-[10px] text-zinc-400">{tx.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                          {tx.source_table.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-black ${Number(tx.amount) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {fmtCurrency(tx.amount, tx.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-zinc-400">
                        {new Date(tx.occurred_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Quick Shortcuts</h3>
          <div className="grid grid-cols-1 gap-3">
            <ShortcutButton icon={Users} label="Add New Devotee" href="/temple-admin/peoples/staff/new" color="text-blue-500 bg-blue-50" />
            <ShortcutButton icon={Calendar} label="Book a Seva" href="/temple-admin/bookings/new" color="text-purple-500 bg-purple-50" />
            <ShortcutButton icon={DollarSign} label="Record Donation" href="/temple-admin/finance/donations" color="text-emerald-500 bg-emerald-50" />
            <ShortcutButton icon={LayoutDashboard} label="Inventory Check" href="/temple-admin/inventory/low-stock" color="text-orange-500 bg-orange-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
