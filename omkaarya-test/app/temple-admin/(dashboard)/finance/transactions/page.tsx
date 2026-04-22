"use client";

import { useState, useMemo, useCallback } from "react";
import { CheckCircle2, X, Search, Info, Download, Plus, MoreHorizontal } from "lucide-react";
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
    Pooja: "bg-orange-50 text-[var(--brand-primary)] border border-orange-100",
    Donation: "bg-blue-50 text-blue-700 border border-blue-100",
    Sale: "bg-green-50 text-green-700 border border-green-100",
    Expense: "bg-red-50 text-red-700 border border-red-100",
    Ritual: "bg-purple-50 text-purple-700 border border-purple-100",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full ${styles[type] || "bg-zinc-50 text-zinc-600 border border-zinc-200"}`}>
      {type}
    </span>
  );
}

// ── Segment Toggle ────────────────────────────────────────────────
function Segment({ items, active, onChange }: { items: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 ml-auto">
      {items.map((s) => (
        <button key={s} onClick={() => onChange(s)} className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${active === s ? "bg-white dark:bg-zinc-800 text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>{s}</button>
      ))}
    </div>
  );
}

// ── Transaction Data ──────────────────────────────────────────────
const TXNS = [
  { date: "Today 09:14", desc: "Rudrabhishekam — Rajan Kumar", type: "Pooja", cat: "Pooja income", ref: "POOJA-0142", amt: "+LKR 7500.00", by: "Admin", pos: true },
  { date: "Today 08:30", desc: "Cash donation — Priya Sharma", type: "Donation", cat: "Cash donation", ref: "DON-0087", amt: "+LKR 12000.00", by: "Priest", pos: true },
  { date: "Today 08:00", desc: "Prasad Packet × 5 — counter sale", type: "Sale", cat: "Counter sales", ref: "POS-0221", amt: "+LKR 750.00", by: "Admin", pos: true },
  { date: "Yesterday 15:00", desc: "Camphor returned from Abhishekam", type: "Ritual", cat: "Inventory only", ref: "POOJA-0138", amt: "—", by: "Priest", pos: false },
  { date: "Yesterday 14:00", desc: "Rose garland × 12 — supplier", type: "Expense", cat: "Inventory purchase", ref: "PO-0034", amt: "−LKR 3600.00", by: "Admin", pos: false },
  { date: "Yesterday 10:00", desc: "Archana — 3 bookings", type: "Pooja", cat: "Pooja income", ref: "POOJA-0139", amt: "+LKR 900.00", by: "Admin", pos: true },
  { date: "2 days ago", desc: "Sesame oil returned from Homam", type: "Ritual", cat: "Inventory only", ref: "POOJA-0135", amt: "—", by: "Priest", pos: false },
  { date: "2 days ago", desc: "Homam — Sri Murugan Trust", type: "Pooja", cat: "Pooja income", ref: "POOJA-0135", amt: "+LKR 30000.00", by: "Admin", pos: true },
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
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => showToast("Exporting…")} className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Link href="/temple-admin/finance/transactions/add">
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Metrics */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total income</p>
          <p className="text-2xl font-bold text-green-600">LKR 482,000</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total expenses</p>
          <p className="text-2xl font-bold text-red-600">LKR 214,000</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Net surplus</p>
          <p className="text-2xl font-bold text-[var(--brand-primary)]">LKR 268,000</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Donations</p>
          <p className="text-2xl font-bold text-blue-600">LKR 234,000</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Ritual returns</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">12</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Inventory only</p>
        </div>
      </div>

      {/* Toolbar */}
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
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950">
          <option value="">All types</option>
          <option value="Pooja">Pooja</option>
          <option value="Donation">Donation</option>
          <option value="Sale">Counter Sale</option>
          <option value="Ritual">Ritual Return</option>
          <option value="Expense">Expense</option>
        </select>
        <select className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950">
          <option>This month</option><option>Today</option><option>This week</option><option>Custom range</option>
        </select>
        <select className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950">
          <option value="">All categories</option><option>Pooja income</option><option>Donations — cash</option><option>Donations — in-kind</option><option>Counter sales</option><option>Inventory purchase</option><option>Staff/priest</option><option>Maintenance</option>
        </select>
        <Segment items={["All", "Income", "Expense"]} active={segment} onChange={setSegment} />
      </div>

      {/* Info Alert */}
      <div className="rounded-2xl p-4 flex gap-3 items-start bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-700 dark:text-blue-500 mb-1">About Ritual Returns</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed max-w-4xl">Ritual Return entries show when a priest returns unused pooja items to stock. These are <strong>inventory-only</strong> entries — they do NOT affect income or expenses. The amount column shows "—" for these entries.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["Date & time", "Description", "Type", "Category", "Reference", "Amount", "By", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {filtered.map((t, i) => (
                <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{t.date}</td>
                  <td className="px-6 py-4"><span className="text-sm font-bold text-[var(--text-primary)]">{t.desc}</span></td>
                  <td className="px-6 py-4"><TypePill type={t.type} /></td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{t.cat}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">{t.ref}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${t.pos ? "text-green-600" : t.amt === "—" ? "text-zinc-400 text-sm font-normal" : "text-red-500"}`}>{t.amt}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{t.by}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => showToast(`Viewing ${t.ref}`)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-50 bg-zinc-50/30 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/30 text-sm">
          <p className="text-[var(--text-muted)]">
            Showing Results: <span className="font-bold text-[var(--text-primary)]">{filtered.length}</span> of <span className="font-bold text-[var(--text-primary)]">248</span> this month
          </p>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 font-bold text-white dark:bg-zinc-800">1</button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">2</button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">3</button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
