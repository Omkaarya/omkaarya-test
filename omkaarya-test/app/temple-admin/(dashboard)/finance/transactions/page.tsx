"use client";

import { useState, useMemo, useCallback } from "react";
import { CheckCircle2, X } from "lucide-react";
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

// ── Type Pill ─────────────────────────────────────────────────────
function TypePill({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Pooja: "bg-orange-50 text-orange-700 before:bg-orange-500",
    Donation: "bg-blue-50 text-blue-700 before:bg-blue-500",
    Sale: "bg-green-50 text-green-700 before:bg-green-600",
    Expense: "bg-red-50 text-red-700 before:bg-red-500",
    Ritual: "bg-purple-50 text-purple-700 before:bg-purple-500",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg before:w-[5px] before:h-[5px] before:rounded-full before:shrink-0 ${styles[type] || "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  );
}

// ── Segment Toggle ────────────────────────────────────────────────
function Segment({ items, active, onChange }: { items: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-subtle border border-border rounded-lg p-0.5 ml-auto">
      {items.map((s) => (
        <button key={s} onClick={() => onChange(s)} className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${active === s ? "bg-surface text-brand shadow-xs" : "text-text-tertiary"}`}>{s}</button>
      ))}
    </div>
  );
}

// ── Transaction Data ──────────────────────────────────────────────
const TXNS = [
  { date: "Today 09:14", desc: "Rudrabhishekam — Rajan Kumar", type: "Pooja", cat: "Pooja income", ref: "POOJA-0142", amt: "+£75.00", by: "Admin", pos: true },
  { date: "Today 08:30", desc: "Cash donation — Priya Sharma", type: "Donation", cat: "Cash donation", ref: "DON-0087", amt: "+£120.00", by: "Priest", pos: true },
  { date: "Today 08:00", desc: "Prasad Packet × 5 — counter sale", type: "Sale", cat: "Counter sales", ref: "POS-0221", amt: "+£7.50", by: "Admin", pos: true },
  { date: "Yesterday 15:00", desc: "Camphor returned from Abhishekam", type: "Ritual", cat: "Inventory only", ref: "POOJA-0138", amt: "—", by: "Priest", pos: false },
  { date: "Yesterday 14:00", desc: "Rose garland × 12 — supplier", type: "Expense", cat: "Inventory purchase", ref: "PO-0034", amt: "−£36.00", by: "Admin", pos: false },
  { date: "Yesterday 10:00", desc: "Archana — 3 bookings", type: "Pooja", cat: "Pooja income", ref: "POOJA-0139", amt: "+£9.00", by: "Admin", pos: true },
  { date: "2 days ago", desc: "Sesame oil returned from Homam", type: "Ritual", cat: "Inventory only", ref: "POOJA-0135", amt: "—", by: "Priest", pos: false },
  { date: "2 days ago", desc: "Homam — Sri Murugan Trust", type: "Pooja", cat: "Pooja income", ref: "POOJA-0135", amt: "+£300.00", by: "Admin", pos: true },
];

export default function TempleTransactionsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);
  const [segment, setSegment] = useState("All");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = TXNS;
    if (segment === "Income") list = list.filter((t) => t.pos);
    if (segment === "Expense") list = list.filter((t) => !t.pos);
    if (typeFilter) list = list.filter((t) => t.type === typeFilter);
    if (search) list = list.filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [segment, typeFilter, search]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Transactions</h1>
          <p className="mt-1 text-sm text-text-tertiary">All financial entries — income, expenses, donations · Ritual returns shown as inventory-only</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => showToast("Exporting…")}>📥 Export</Button>
          <Link href="/temple-admin/finance/transactions/add">
            <Button variant="primary" size="sm">+ Add transaction</Button>
          </Link>
        </div>
      </div>

      {/* 5 Metrics */}
      <div className="grid grid-cols-5 gap-2.5">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Total income</p>
          <p className="text-2xl font-bold text-green-600">£4,820</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Total expenses</p>
          <p className="text-2xl font-bold text-red-600">£2,140</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Net surplus</p>
          <p className="text-2xl font-bold text-brand">£2,680</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Donations</p>
          <p className="text-2xl font-bold text-blue-600">£2,340</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Ritual returns</p>
          <p className="text-xl font-bold text-text-primary">12</p>
          <p className="text-[10px] text-text-quaternary mt-1">inventory only — no finance</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 min-w-[220px]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." className="bg-transparent border-none outline-none text-xs text-text-primary w-full" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-border rounded-lg px-2 py-2 text-[11px] text-text-secondary bg-surface outline-none">
          <option value="">All types</option>
          <option value="Pooja">Pooja</option>
          <option value="Donation">Donation</option>
          <option value="Sale">Counter Sale</option>
          <option value="Ritual">Ritual Return</option>
          <option value="Expense">Expense</option>
        </select>
        <select className="border border-border rounded-lg px-2 py-2 text-[11px] text-text-secondary bg-surface outline-none">
          <option>This month</option><option>Today</option><option>This week</option><option>Custom range</option>
        </select>
        <select className="border border-border rounded-lg px-2 py-2 text-[11px] text-text-secondary bg-surface outline-none">
          <option value="">All categories</option><option>Pooja income</option><option>Donations — cash</option><option>Donations — in-kind</option><option>Counter sales</option><option>Inventory purchase</option><option>Staff/priest</option><option>Maintenance</option>
        </select>
        <Segment items={["All", "Income", "Expense"]} active={segment} onChange={setSegment} />
      </div>

      {/* Info Alert */}
      <div className="rounded-xl p-3 flex gap-2 items-start bg-blue-50 border-[1.5px] border-blue-200">
        <span className="text-base shrink-0 mt-0.5">ℹ️</span>
        <div>
          <p className="text-xs font-bold text-blue-700 mb-0.5">About Ritual Returns</p>
          <p className="text-[11px] text-text-secondary leading-relaxed">Ritual Return entries show when a priest returns unused pooja items to stock. These are <strong>inventory-only</strong> entries — they do NOT affect income or expenses. The amount column shows "—" for these entries.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-subtle">
              {["Date & time", "Description", "Type", "Category", "Reference", "Amount", "By", "Actions"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i} className="border-b border-border-secondary last:border-b-0 hover:bg-subtle transition-colors cursor-pointer">
                <td className="px-4 py-3 text-[11px] text-text-tertiary">{t.date}</td>
                <td className="px-4 py-3"><span className="text-xs font-semibold text-text-primary">{t.desc}</span></td>
                <td className="px-4 py-3"><TypePill type={t.type} /></td>
                <td className="px-4 py-3 text-[11px] text-text-secondary">{t.cat}</td>
                <td className="px-4 py-3 text-[10px] text-text-tertiary font-mono">{t.ref}</td>
                <td className={`px-4 py-3 text-[13px] font-bold ${t.pos ? "text-green-600" : t.amt === "—" ? "text-text-tertiary text-xs font-normal" : "text-red-600"}`}>{t.amt}</td>
                <td className="px-4 py-3 text-[11px] text-text-tertiary">{t.by}</td>
                <td className="px-4 py-3"><button onClick={() => showToast(`Viewing ${t.ref}`)} className="text-[11px] border border-border rounded-md px-2 py-1 text-text-secondary hover:border-brand hover:text-brand transition-colors">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-secondary">
          <span className="text-[11px] text-text-tertiary">Showing {filtered.length} of 248 this month</span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded-md border border-border bg-surface text-[11px] text-text-secondary flex items-center justify-center">‹</button>
            <button className="w-7 h-7 rounded-md bg-brand text-white text-[11px] flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-md border border-border bg-surface text-[11px] text-text-secondary flex items-center justify-center">2</button>
            <button className="w-7 h-7 rounded-md border border-border bg-surface text-[11px] text-text-secondary flex items-center justify-center">3</button>
            <button className="w-7 h-7 rounded-md border border-border bg-surface text-[11px] text-text-secondary flex items-center justify-center">›</button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
