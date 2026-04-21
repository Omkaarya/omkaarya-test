"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, X } from "lucide-react";

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
    <div className="flex bg-subtle border border-border rounded-lg p-0.5">
      {items.map((s) => (
        <button key={s} onClick={() => onChange(s)} className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${active === s ? "bg-surface text-brand shadow-xs" : "text-text-tertiary"}`}>{s}</button>
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
  { type: "Rudrabhishekam", bookings: 18, total: "£1,350", avg: "£75" },
  { type: "Archana", bookings: 42, total: "£126", avg: "£3" },
  { type: "Satyanarayan Puja", bookings: 4, total: "£480", avg: "£120" },
  { type: "Homam", bookings: 2, total: "£600", avg: "£300" },
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => showToast("Downloading PDF…")}>📄 PDF</Button>
          <Button variant="outline" size="sm" onClick={() => showToast("Exporting Excel…")}>📊 Excel</Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-border rounded-xl p-3.5 flex items-center gap-2.5 flex-wrap">
        <Segment items={["Today", "This week", "This month", "This year", "Custom"]} active={period} onChange={setPeriod} />
        <select className="border border-border rounded-lg px-2 py-2 text-[11px] text-text-secondary bg-surface outline-none">
          <option>All categories</option><option>Donations</option><option>Pooja</option><option>Counter Sales</option><option>Expenses</option>
        </select>
        <Button variant="primary" size="sm">Apply filters</Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Total income</p>
          <p className="text-2xl font-bold text-green-600">£4,820</p>
          <p className="text-[10px] text-text-quaternary mt-1">Pooja + Donations + Sales</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Total expenses</p>
          <p className="text-2xl font-bold text-red-600">£2,140</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Net surplus</p>
          <p className="text-2xl font-bold text-brand">£2,680</p>
          <p className="text-[10px] font-semibold text-green-600 mt-1">NOT profit — charitable surplus</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Donations</p>
          <p className="text-2xl font-bold text-blue-600">£2,340</p>
          <p className="text-[10px] text-text-quaternary mt-1">34 donors · £1,200 Gift Aid eligible</p>
        </div>
      </div>

      {/* Income Category Breakdown */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 flex items-center gap-2">📊 Income category breakdown</h3>
        <div className="space-y-2.5">
          {[
            { label: "Donations", value: "£2,340", pct: 48, color: "bg-blue-600" },
            { label: "Pooja bookings", value: "£1,560", pct: 32, color: "bg-brand" },
            { label: "Counter sales", value: "£920", pct: 19, color: "bg-green-600" },
          ].map((b) => (
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

      {/* Inventory Movement Report */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 flex items-center gap-2">📦 Inventory movement report <span className="text-[11px] text-text-tertiary font-normal">(Opening → Closing stock per item)</span></h3>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-subtle">
              {["Item", "Opening", "Purchased", "Used in pooja", "Returned from pooja", "Counter sold", "Closing"].map((h) => (
                <th key={h} className={`text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-3 py-2 border-b border-border ${h === "Returned from pooja" ? "text-purple-600" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INV_MOVEMENT.map((r, i) => (
              <tr key={i} className="border-b border-border-secondary last:border-b-0 hover:bg-subtle transition-colors">
                <td className="px-3 py-2 font-bold">{r.item}</td>
                <td className="px-3 py-2">{r.opening}</td>
                <td className="px-3 py-2">{r.purchased}</td>
                <td className="px-3 py-2 text-amber-600">{r.used}</td>
                <td className="px-3 py-2 text-purple-600 font-semibold">{r.returned}</td>
                <td className="px-3 py-2">{r.sold}</td>
                <td className="px-3 py-2 font-bold">{r.closing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pooja Report */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 flex items-center gap-2">🙏 Pooja report</h3>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-subtle">
              {["Pooja type", "Bookings", "Total collection", "Avg per booking"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-3 py-2 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POOJA_REPORT.map((r, i) => (
              <tr key={i} className="border-b border-border-secondary last:border-b-0 hover:bg-subtle transition-colors">
                <td className="px-3 py-2 font-bold">{r.type}</td>
                <td className="px-3 py-2">{r.bookings}</td>
                <td className="px-3 py-2">{r.total}</td>
                <td className="px-3 py-2">{r.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
