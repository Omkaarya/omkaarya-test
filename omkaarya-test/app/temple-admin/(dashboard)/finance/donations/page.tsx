"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, X, Plus, FileText, Search, CircleUser, Gift, Check, MoreHorizontal } from "lucide-react";
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

// ── Donation Data ─────────────────────────────────────────────────
const DONATIONS = [
  { date: "20 Apr 2026", name: "Rajan Kumar", email: "rajan@email.com", type: "Cash", desc: "Monthly donation — temple fund", amt: "LKR 120,000", giftAid: true },
  { date: "19 Apr 2026", name: "Priya Sharma", email: "priya@email.com", type: "Cash", desc: "Deity decoration fund", amt: "LKR 50,000", giftAid: true },
  { date: "18 Apr 2026", name: "Anonymous", email: "walk-in devotee", type: "Cash", desc: "Hundi collection", amt: "LKR 20,000", giftAid: false },
  { date: "17 Apr 2026", name: "Sri Murugan Trust", email: "trust@murugan.org", type: "In-kind", desc: "5kg Marigold flowers donated", amt: "~LKR 4,000 est.", giftAid: false },
];

export default function TempleDonationsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Donations</h1>
          <p className="mt-1 text-sm text-text-tertiary">Cash and in-kind donations from devotees · Generate tax receipts and Gift Aid claims</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => showToast("Generating annual report…")} className="gap-2">
            <FileText className="h-4 w-4" /> Annual report
          </Button>
          <Link href="/temple-admin/finance/transactions/add">
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add donation
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total donations (Apr)</p>
          <p className="text-2xl font-bold text-blue-600">LKR 234,000</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">34 donors</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Cash donations</p>
          <p className="text-2xl font-bold text-green-600">LKR 198,000</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">29 donors</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">In-kind donations</p>
          <p className="text-2xl font-bold text-[var(--brand-primary)]">LKR 36,000</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">5 donors · estimated value</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Gift Aid eligible</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">LKR 120,000</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">UK donors — 25% claimable</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            placeholder="Search donor name..."
            className="h-10 w-full rounded-xl border border-zinc-100 bg-zinc-50 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <select className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950">
          <option>All types</option><option>Cash</option><option>Cheque</option><option>Online</option><option>In-kind</option>
        </select>
        <select className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950">
          <option>This month</option><option>This year</option><option>Custom range</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["Date", "Donor", "Type", "Description", "Amount", "Gift Aid?", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {DONATIONS.map((d, i) => (
                <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{d.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                        <CircleUser className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">{d.name}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">{d.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full ${d.type === "Cash" ? "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20" : "bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/20"}`}>
                      {d.type === "In-kind" && <Gift className="h-3 w-3" />}
                      {d.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{d.desc}</td>
                  <td className={`px-6 py-4 ${d.type === "In-kind" ? "text-xs text-[var(--text-muted)]" : "text-sm font-bold text-green-600"}`}>{d.amt}</td>
                  <td className="px-6 py-4">
                    {d.giftAid
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600"><Check className="h-4 w-4" /> Eligible</span>
                      : <span className="text-[11px] text-[var(--text-muted)]">N/A</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {d.giftAid && (
                        <Link href="/temple-admin/finance/receipts/generate">
                          <button className="text-xs border border-zinc-200 rounded-lg px-3 py-1.5 font-semibold text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors dark:border-zinc-700">Receipt</button>
                        </Link>
                      )}
                      <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-50 bg-zinc-50/30 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/30 text-sm">
          <p className="text-[var(--text-muted)]">
            Showing Results: <span className="font-bold text-[var(--text-primary)]">4</span> of <span className="font-bold text-[var(--text-primary)]">34</span> this month
          </p>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 font-bold text-white dark:bg-zinc-800">1</button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">2</button>
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
