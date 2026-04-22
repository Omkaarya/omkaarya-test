"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, X, BarChart3, Plus, Wallet, CreditCard, TrendingUp, HeartHandshake } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-success-500/20 bg-status-success-bg text-status-success-text px-5 py-4 shadow-xl">
      <CheckCircle2 className="h-5 w-5 shrink-0" /><p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────
function BarChart({ title, bars }: { title: string; bars: { label: string; value: string; pct: number; color: string }[] }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-5">{title}</h3>
      <div className="space-y-2.5">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-2.5">
            <span className="text-[11px] text-text-tertiary w-[120px] text-right shrink-0">{b.label}</span>
            <div className="flex-1 bg-subtle rounded h-[22px] overflow-hidden">
              <div className={`h-full rounded flex items-center px-2 ${b.color}`} style={{ width: `${b.pct}%` }}>
                <span className="text-[10px] font-bold text-white">{b.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Type Pill ─────────────────────────────────────────────────────
function TypePill({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Pooja: "bg-orange-50 text-[var(--brand-primary)] border border-orange-100",
    Donation: "bg-blue-50 text-blue-700 border border-blue-100",
    "Counter sale": "bg-green-50 text-green-700 border border-green-100",
    Expense: "bg-red-50 text-red-700 border border-red-100",
    "Ritual Return": "bg-purple-50 text-purple-700 border border-purple-100",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full ${styles[type] || "bg-zinc-50 text-zinc-600 border border-zinc-200"}`}>
      {type}
    </span>
  );
}

// ── Transaction Data ──────────────────────────────────────────────
const RECENT_TXNS = [
  { date: "Today 09:14", desc: "Rudrabhishekam — Rajan Kumar", type: "Pooja", cat: "Pooja income", ref: "POOJA-0142", amt: "+LKR 7500.00", pos: true, by: "Admin" },
  { date: "Today 08:30", desc: "Cash donation — anonymous", type: "Donation", cat: "Cash donation", ref: "DON-0087", amt: "+LKR 2000.00", pos: true, by: "Priest" },
  { date: "Yesterday", desc: "Rose garland × 12 — supplier", type: "Expense", cat: "Inventory purchase", ref: "PO-0034", amt: "−LKR 3600.00", pos: false, by: "Admin" },
  { date: "Yesterday", desc: "Prasad packet × 5 — counter sale", type: "Counter sale", cat: "POS sales", ref: "POS-0221", amt: "+LKR 750.00", pos: true, by: "Admin" },
  { date: "2 days ago", desc: "Camphor returned from Abhishekam", type: "Ritual Return", cat: "Inventory only", ref: "POOJA-0138", amt: "— (no entry)", pos: false, by: "Priest" },
];

export default function TempleFinanceDashboardPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Finance Dashboard</h1>
          <p className="mt-1 text-sm text-text-tertiary">Financial overview for Omkaarya Temple · April 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/temple-admin/finance/reports">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" /> View reports
            </Button>
          </Link>
          <Link href="/temple-admin/finance/transactions/add">
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)] hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Total income (This Month)</p>
          <p className="text-2xl font-bold text-green-600">LKR 482,000</p>
          <p className="text-[10px] text-text-quaternary mt-1">Pooja + Donations + Counter sales</p>
          <p className="text-[10px] font-semibold text-green-600 mt-2">↑ 12% vs last month</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)] hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Total expenses (This Month)</p>
          <p className="text-2xl font-bold text-red-600">LKR 214,000</p>
          <p className="text-[10px] text-text-quaternary mt-1">Purchases + maintenance + salaries</p>
          <p className="text-[10px] font-semibold text-red-600 mt-2">↑ 8% vs last month</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)] hover:shadow-md">
           <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Net surplus (This Month)</p>
          <p className="text-2xl font-bold text-brand">LKR 268,000</p>
          <p className="text-[10px] text-text-quaternary mt-1">Income minus expenses</p>
          <p className="text-[10px] font-semibold text-brand mt-2">Healthy surplus</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)] hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Total donations (This Month)</p>
          <p className="text-2xl font-bold text-blue-600">LKR 234,000</p>
          <p className="text-[10px] text-text-quaternary mt-1">Cash + in-kind donations</p>
          <p className="text-[10px] font-semibold text-blue-600 mt-2">34 donors this month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-3.5">
        <BarChart
          title="Income breakdown — April 2026"
          bars={[
    { label: "Donations", value: "LKR 234,000", pct: 48, color: "bg-blue-600" },
            { label: "Pooja bookings", value: "LKR 156,000", pct: 32, color: "bg-orange-500" },
            { label: "Counter sales", value: "LKR 92,000", pct: 19, color: "bg-green-600" },
          ]}
        />
        <BarChart
          title="Expense breakdown — April 2026"
          bars={[
            { label: "Inventory purchases", value: "LKR 112,000", pct: 52, color: "bg-amber-500" },
            { label: "Staff / priest", value: "LKR 75,000", pct: 35, color: "bg-purple-600" },
            { label: "Maintenance", value: "LKR 27,000", pct: 13, color: "bg-teal-500" },
          ]}
        />
      </div>

      {/* Recent Transactions */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-primary">Recent transactions</h2>
        <Link href="/temple-admin/finance/transactions">
          <Button variant="outline" size="sm">View all →</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-subtle">
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "18%" }}>Date</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "22%" }}>Description</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "14%" }}>Type</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "14%" }}>Category</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "12%" }}>Reference</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "10%" }}>Amount</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "10%" }}>By</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_TXNS.map((t, i) => (
              <tr key={i} className="border-b border-border-secondary last:border-b-0 hover:bg-subtle transition-colors cursor-pointer" onClick={() => showToast(`Viewing ${t.ref}`)}>
                <td className="px-4 py-3 text-[11px] text-text-tertiary">{t.date}</td>
                <td className="px-4 py-3"><span className="text-xs font-semibold text-text-primary">{t.desc}</span></td>
                <td className="px-4 py-3"><TypePill type={t.type} /></td>
                <td className="px-4 py-3 text-[11px] text-text-secondary">{t.cat}</td>
                <td className="px-4 py-3 text-[10px] text-text-tertiary font-mono">{t.ref}</td>
                <td className={`px-4 py-3 text-[13px] font-bold ${t.pos ? "text-green-600" : t.amt.startsWith("—") ? "text-text-tertiary text-xs font-normal" : "text-red-600"}`}>{t.amt}</td>
                <td className="px-4 py-3 text-[11px] text-text-tertiary">{t.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-secondary">
          <span className="text-[11px] text-text-tertiary">Showing 5 of 248 transactions this month</span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded-md border border-border bg-surface text-[11px] text-text-secondary flex items-center justify-center">‹</button>
            <button className="w-7 h-7 rounded-md bg-brand text-white text-[11px] flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-md border border-border bg-surface text-[11px] text-text-secondary flex items-center justify-center">2</button>
            <button className="w-7 h-7 rounded-md border border-border bg-surface text-[11px] text-text-secondary flex items-center justify-center">›</button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
