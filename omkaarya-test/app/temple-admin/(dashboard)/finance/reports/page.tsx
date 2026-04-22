"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, X, FileDown, Sheet, PieChart, Package, Sparkles } from "lucide-react";

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

// ── Segment Toggle ────────────────────────────────────────────────
function Segment({ items, active, onChange }: { items: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
      {items.map((s) => (
        <button key={s} onClick={() => onChange(s)} className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${active === s ? "bg-white dark:bg-zinc-800 text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>{s}</button>
      ))}
    </div>
  );
}

// ── Inventory Movement Data ───────────────────────────────────────
const INV_MOVEMENT = [
  { item: "Camphor tablets", opening: "24", purchased: "50", used: "−38", returned: "+8", sold: "0", closing: "44" },
  { item: "Rose garland", opening: "8", purchased: "20", used: "−14", returned: "+3", sold: "−5", closing: "12" },
  { item: "Sesame oil", opening: "10L", purchased: "10L", used: "−8L", returned: "+1L", sold: "0", closing: "13L" },
  { item: "Kumkum powder", opening: "30", purchased: "0", used: "−12", returned: "+2", sold: "−4", closing: "16" },
  { item: "Besan Ladoo", opening: "60", purchased: "100", used: "−45", returned: "0", sold: "−28", closing: "87" },
];

const POOJA_REPORT = [
  { type: "Rudrabhishekam", bookings: 18, total: "LKR 135,000", avg: "LKR 7,500" },
  { type: "Archana", bookings: 42, total: "LKR 12,600", avg: "LKR 300" },
  { type: "Satyanarayan Puja", bookings: 4, total: "LKR 48,000", avg: "LKR 12,000" },
  { type: "Homam", bookings: 2, total: "LKR 60,000", avg: "LKR 30,000" },
];

export default function TempleReportsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);
  const [period, setPeriod] = useState("This month");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Reports</h1>
          <p className="mt-1 text-sm text-text-tertiary">Financial and inventory reports — use date filter to select any period</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => showToast("Downloading PDF…")} className="gap-2">
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => showToast("Exporting Excel…")} className="gap-2">
            <Sheet className="h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 flex-wrap shadow-sm">
        <Segment items={["Today", "This week", "This month", "This year", "Custom"]} active={period} onChange={setPeriod} />
        <select className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950">
          <option>All categories</option><option>Donations</option><option>Pooja</option><option>Counter Sales</option><option>Expenses</option>
        </select>
        <Button variant="primary" size="sm">Apply filters</Button>
      </div>

      {/* Summary Metrics */}
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total income</p>
          <p className="text-2xl font-bold text-green-600">LKR 482,000</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Pooja + Donations + Sales</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total expenses</p>
          <p className="text-2xl font-bold text-red-600">LKR 214,000</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Net surplus</p>
          <p className="text-2xl font-bold text-[var(--brand-primary)]">LKR 268,000</p>
          <p className="text-[10px] font-bold text-green-600 mt-1">NOT profit — charitable surplus</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Donations</p>
          <p className="text-2xl font-bold text-blue-600">LKR 234,000</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">34 donors · 30% Gift Aid eligible</p>
        </div>
      </div>

      {/* Income Category Breakdown */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-5 flex items-center gap-2">
          <PieChart className="h-4 w-4" /> Income category breakdown
        </h3>
        <div className="space-y-4">
          {[
            { label: "Donations", value: "LKR 234,000", pct: 48, color: "bg-blue-600" },
            { label: "Pooja bookings", value: "LKR 156,000", pct: 32, color: "bg-orange-500" },
            { label: "Counter sales", value: "LKR 92,000", pct: 19, color: "bg-green-600" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-4">
              <span className="text-xs font-bold text-[var(--text-primary)] w-[120px] text-right shrink-0">{b.label}</span>
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg h-8 overflow-hidden">
                <div className={`h-full flex items-center px-3 ${b.color} transition-all duration-500 ease-out`} style={{ width: `${b.pct}%` }}>
                  <span className="text-[11px] font-bold text-white">{b.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Movement Report */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            <Package className="h-4 w-4" /> Inventory movement report
            <span className="text-[10px] lowercase text-[var(--text-muted)] font-normal ml-2">(Opening → Closing stock per item)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["Item", "Opening", "Purchased", "Used in pooja", "Returned from pooja", "Counter sold", "Closing"].map((h) => (
                  <th key={h} className={`text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4 ${h === "Returned from pooja" ? "text-purple-500" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {INV_MOVEMENT.map((r, i) => (
                <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-[var(--text-primary)]">{r.item}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{r.opening}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{r.purchased}</td>
                  <td className="px-6 py-4 text-xs font-medium text-amber-600">{r.used}</td>
                  <td className="px-6 py-4 text-xs font-bold text-purple-600">{r.returned}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{r.sold}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">{r.closing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pooja Report */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Pooja report
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["Pooja type", "Bookings", "Total collection", "Avg per booking"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {POOJA_REPORT.map((r, i) => (
                <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">{r.type}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{r.bookings}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{r.total}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[var(--text-muted)]">{r.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
