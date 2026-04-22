"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, X, Plus, PackageOpen, MoreHorizontal, Check } from "lucide-react";

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

// ── PO Data ───────────────────────────────────────────────────────
const POS = [
  { num: "PO-0034", supplier: "Sri Lakshmi Traders", date: "18 Apr", items: "Rose garland ×12, Marigold 2kg", amt: "LKR 3,600", status: "Received" },
  { num: "PO-0033", supplier: "Vedic Supplies Colombo", date: "15 Apr", items: "Camphor 200g, Ghee 2L, Incense ×10", amt: "LKR 6,800", status: "Received" },
  { num: "PO-0032", supplier: "Om Flowers Sri Lanka", date: "10 Apr", items: "Jasmine 500g, Lotus ×20", amt: "LKR 4,500", status: "In transit" },
];

export default function PurchaseOrdersPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Purchase orders</h1>
          <p className="mt-1 text-sm text-text-tertiary">Supplier purchases — mark as received to auto-update inventory</p>
        </div>
        <Button variant="primary" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> New PO
        </Button>
      </div>

      {/* 3 Metrics */}
      {/* 3 Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total POs this month</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">12</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Awaiting delivery</p>
          <p className="text-2xl font-bold text-amber-600">3</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-[var(--brand-primary)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total spent</p>
          <p className="text-2xl font-bold text-red-600">LKR 112,000</p>
        </div>
      </div>

      {/* Table */}
      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["PO number", "Supplier", "Date", "Items", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {POS.map((po, i) => (
                <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">{po.num}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">{po.supplier}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{po.date}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{po.items}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-500">{po.amt}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full ${po.status === "Received" ? "bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20" : "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20"}`}>
                      {po.status === "Received" ? <Check className="h-3 w-3" /> : <PackageOpen className="h-3 w-3" />}
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 items-center">
                      {po.status === "In transit" && (
                        <button onClick={() => showToast("Marked as received — inventory updated!")} className="text-xs border border-zinc-200 rounded-lg px-3 py-1.5 font-semibold text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors dark:border-zinc-700 whitespace-nowrap">Mark received</button>
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
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
