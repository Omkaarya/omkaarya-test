"use client";

import { useState, useCallback } from "react";
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

// ── Donation Data ─────────────────────────────────────────────────
const DONATIONS = [
  { date: "20 Apr 2026", name: "Rajan Kumar", email: "rajan@email.com", type: "Cash", desc: "Monthly donation — temple fund", amt: "£120.00", giftAid: true },
  { date: "19 Apr 2026", name: "Priya Sharma", email: "priya@email.com", type: "Cash", desc: "Deity decoration fund", amt: "£50.00", giftAid: true },
  { date: "18 Apr 2026", name: "Anonymous", email: "walk-in devotee", type: "Cash", desc: "Hundi collection", amt: "£20.00", giftAid: false },
  { date: "17 Apr 2026", name: "Sri Murugan Trust", email: "trust@murugan.org", type: "In-kind", desc: "5kg Marigold flowers donated", amt: "~£40 est.", giftAid: false },
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => showToast("Generating annual report…")}>📄 Annual report</Button>
          <Link href="/temple-admin/finance/transactions/add">
            <Button variant="primary" size="sm">+ Add donation</Button>
          </Link>
        </div>
      </div>

      {/* 4 Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Total donations (Apr)</p>
          <p className="text-2xl font-bold text-blue-600">£2,340</p>
          <p className="text-[10px] text-text-quaternary mt-1">34 donors</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Cash donations</p>
          <p className="text-2xl font-bold text-green-600">£1,980</p>
          <p className="text-[10px] text-text-quaternary mt-1">29 donors</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">In-kind donations</p>
          <p className="text-2xl font-bold text-brand">£360</p>
          <p className="text-[10px] text-text-quaternary mt-1">5 donors · estimated value</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Gift Aid eligible</p>
          <p className="text-xl font-bold text-text-primary">£1,200</p>
          <p className="text-[10px] text-text-quaternary mt-1">UK donors — 25% claimable</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 min-w-[220px]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
          <input placeholder="Search donor name..." className="bg-transparent border-none outline-none text-xs text-text-primary w-full" />
        </div>
        <select className="border border-border rounded-lg px-2 py-2 text-[11px] text-text-secondary bg-surface outline-none">
          <option>All types</option><option>Cash</option><option>Cheque</option><option>Online</option><option>In-kind</option>
        </select>
        <select className="border border-border rounded-lg px-2 py-2 text-[11px] text-text-secondary bg-surface outline-none">
          <option>This month</option><option>This year</option><option>Custom range</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-subtle">
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "14%" }}>Date</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "22%" }}>Donor</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "11%" }}>Type</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "18%" }}>Description</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "10%" }}>Amount</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "10%" }}>Gift Aid?</th>
              <th className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border" style={{ width: "15%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {DONATIONS.map((d, i) => (
              <tr key={i} className="border-b border-border-secondary last:border-b-0 hover:bg-subtle transition-colors">
                <td className="px-4 py-3 text-[11px] text-text-tertiary">{d.date}</td>
                <td className="px-4 py-3">
                  <div className="text-xs font-semibold text-text-primary">{d.name}</div>
                  <div className="text-[10px] text-text-quaternary mt-0.5">{d.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg before:w-[5px] before:h-[5px] before:rounded-full before:shrink-0 ${d.type === "Cash" ? "bg-blue-50 text-blue-700 before:bg-blue-500" : "bg-purple-50 text-purple-700 before:bg-purple-500"}`}>
                    {d.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] text-text-secondary">{d.desc}</td>
                <td className={`px-4 py-3 ${d.type === "In-kind" ? "text-[11px] text-text-secondary" : "text-[13px] font-bold text-green-600"}`}>{d.amt}</td>
                <td className="px-4 py-3">
                  {d.giftAid
                    ? <span className="text-[10px] font-bold text-green-600">✓ Eligible</span>
                    : <span className="text-[10px] text-text-tertiary">N/A</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {d.giftAid && (
                      <Link href="/temple-admin/finance/receipts/generate">
                        <button className="text-[11px] border border-border rounded-md px-2 py-1 text-text-secondary hover:border-brand hover:text-brand transition-colors">Receipt</button>
                      </Link>
                    )}
                    <button className="text-[11px] border border-border rounded-md px-2 py-1 text-text-secondary hover:border-brand hover:text-brand transition-colors">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-secondary">
          <span className="text-[11px] text-text-tertiary">Showing 4 of 34 donations this month</span>
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
