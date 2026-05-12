"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";
import SelectInput from "@/app/components/admin/SelectInput";
import { fetchTempleAdminJson, type FinanceTransaction } from "@/lib/temple-admin-api";

const templeToolbarSelect =
  "!h-10 !min-h-0 !rounded-xl !py-0 !pl-3 !text-sm !border-zinc-100 !bg-white focus:!ring-2 focus:!ring-[var(--brand-primary)] dark:!border-zinc-800 dark:!bg-zinc-950";

function fmtCurrency(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return `${currency} 0`;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

const TYPE_STYLES: Record<string, string> = {
  pooja: "bg-orange-50 text-[var(--brand-primary)] border border-orange-100",
  booking: "bg-orange-50 text-[var(--brand-primary)] border border-orange-100",
  donation: "bg-blue-50 text-blue-700 border border-blue-100",
  pos_sale: "bg-green-50 text-green-700 border border-green-100",
  income: "bg-green-50 text-green-700 border border-green-100",
  expense: "bg-red-50 text-red-700 border border-red-100",
  adjustment: "bg-purple-50 text-purple-700 border border-purple-100",
};

function TypePill({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full ${
        TYPE_STYLES[type] || "bg-zinc-50 text-zinc-600 border border-zinc-200"
      }`}
    >
      {type.replace("_", " ")}
    </span>
  );
}

function Segment({ items, active, onChange }: { items: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 ml-auto">
      {items.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
            active === s
              ? "bg-white dark:bg-zinc-800 text-[var(--brand-primary)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export default function TempleTransactionsPage() {
  const [items, setItems] = useState<FinanceTransaction[]>([]);
  const [segment, setSegment] = useState("All");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTempleAdminJson<{ items: FinanceTransaction[] }>(
          "/api/temple-admin/finance/transactions?limit=200"
        );
        if (!cancelled) setItems(data.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load transactions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (segment === "Income") list = list.filter((t) => Number(t.amount) >= 0);
    if (segment === "Expense") list = list.filter((t) => Number(t.amount) < 0);
    if (typeFilter) list = list.filter((t) => t.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, segment, typeFilter, search]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let donations = 0;
    for (const t of items) {
      const a = Number(t.amount);
      if (!Number.isFinite(a)) continue;
      if (a >= 0) income += a;
      else expense += Math.abs(a);
      if (t.type === "donation") donations += a;
    }
    return { income, expense, donations, surplus: income - expense };
  }, [items]);

  const types = useMemo(() => {
    const s = new Set<string>();
    for (const t of items) s.add(t.type);
    return Array.from(s);
  }, [items]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Transactions</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Live financial entries from bookings, POS, donations and manual entries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/temple-admin/finance/transactions/add">
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add transaction
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total income</p>
          <p className="text-2xl font-bold text-green-600">{fmtCurrency(stats.income)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total expenses</p>
          <p className="text-2xl font-bold text-red-600">{fmtCurrency(stats.expense)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Net surplus</p>
          <p className="text-2xl font-bold text-[var(--brand-primary)]">{fmtCurrency(stats.surplus)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Donations</p>
          <p className="text-2xl font-bold text-blue-600">{fmtCurrency(stats.donations)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="h-10 w-full rounded-xl border border-zinc-100 bg-zinc-50 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <SelectInput
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={templeToolbarSelect}
          wrapperClassName="w-auto min-w-[8.5rem]"
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </SelectInput>
        <Segment items={["All", "Income", "Expense"]} active={segment} onChange={setSegment} />
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["When", "Description", "Type", "Source", "Reference", "Amount"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500">
                    {items.length === 0 ? "No transactions yet." : "No transactions match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const amount = Number(t.amount);
                  const isPositive = amount >= 0;
                  return (
                    <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                        {new Date(t.occurred_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {t.description || t.reference}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <TypePill type={t.type} />
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)] capitalize">
                        {t.source_table.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
                        {t.reference}
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
                        {isPositive ? "+" : "-"}
                        {fmtCurrency(Math.abs(amount), t.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-50 bg-zinc-50/30 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/30 text-sm">
          <p className="text-[var(--text-muted)]">
            Showing <span className="font-bold text-[var(--text-primary)]">{filtered.length}</span> of{" "}
            <span className="font-bold text-[var(--text-primary)]">{items.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
