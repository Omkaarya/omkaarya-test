"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

// ── Type Card ─────────────────────────────────────────────────────
type TxnType = "Income" | "Expense" | "Donation" | "Refund";
const TYPE_CARDS: { id: TxnType; icon: string; name: string; desc: string; selClass: string }[] = [
  { id: "Income", icon: "💰", name: "Income", desc: "Pooja, donations, counter sales", selClass: "border-green-500 bg-green-50" },
  { id: "Expense", icon: "💸", name: "Expense", desc: "Purchases, maintenance, staff", selClass: "border-red-500 bg-red-50" },
  { id: "Donation", icon: "💝", name: "Donation", desc: "Cash or in-kind donation received", selClass: "border-blue-500 bg-blue-50" },
  { id: "Refund", icon: "↩️", name: "Income reversal", desc: "Refund to devotee — income reduced", selClass: "border-red-500 bg-red-50" },
];

export default function AddTransactionPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);
  const [txnType, setTxnType] = useState<TxnType>("Income");

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Link href="/temple-admin/finance/transactions" className="text-brand hover:text-brand-600 font-medium transition-colors">Transactions</Link>
        <span className="text-text-quaternary">›</span>
        <span>Add transaction</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Add transaction</h1>
          <p className="mt-1 text-sm text-text-tertiary">Select the transaction type first — fields will adjust accordingly</p>
        </div>
        <Link href="/temple-admin/finance/transactions">
          <Button variant="outline" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        </Link>
      </div>

      {/* Transaction Type */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 pb-3 border-b border-border-secondary">Transaction type</h3>
        <div className="grid grid-cols-4 gap-2">
          {TYPE_CARDS.map((tc) => (
            <button
              key={tc.id}
              onClick={() => setTxnType(tc.id)}
              className={`p-3.5 rounded-xl border-2 text-center transition-all ${txnType === tc.id ? tc.selClass : "border-border bg-surface hover:border-text-quaternary"}`}
            >
              <div className="text-xl mb-1.5">{tc.icon}</div>
              <div className="text-[11px] font-bold text-text-primary">{tc.name}</div>
              <div className="text-[10px] text-text-tertiary mt-1 leading-snug">{tc.desc}</div>
            </button>
          ))}
        </div>

        {/* Refund Warning */}
        {txnType === "Refund" && (
          <div className="mt-4 rounded-xl p-3 flex gap-2 items-start bg-amber-50 border-[1.5px] border-amber-300">
            <span className="text-base shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">Income reversal — use only for actual refunds</p>
              <p className="text-[11px] text-text-secondary leading-relaxed">If a priest is returning unused pooja items, use <strong>Inventory → Return from Pooja</strong> instead. That does NOT affect income. This screen should only be used when money is actually returned to a devotee.</p>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 pb-3 border-b border-border-secondary">Transaction details</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Category *</label>
            <select className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors">
              <option value="">Select category</option>
              <optgroup label="Income"><option>Pooja income</option><option>Counter sales</option><option>Hall rental</option><option>Other income</option></optgroup>
              <optgroup label="Expense"><option>Inventory purchase</option><option>Staff / priest salary</option><option>Maintenance & repair</option><option>Utilities</option><option>Events & festivals</option></optgroup>
              <optgroup label="Donation"><option>Cash donation</option><option>Cheque donation</option><option>Online donation</option><option>In-kind donation</option></optgroup>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Amount (£) *</label>
            <input type="number" placeholder="0.00" step="0.01" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Date *</label>
            <input type="date" defaultValue="2026-04-20" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Payment method</label>
            <select className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors">
              <option>Cash</option><option>Bank transfer</option><option>Card</option><option>Cheque</option><option>Online</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Reference / link to</label>
            <select className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors">
              <option value="">None</option><option>Pooja booking</option><option>Purchase order</option><option>POS transaction</option><option>Devotee record</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Recorded by</label>
            <select className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors">
              <option>Temple Admin</option><option>Head Priest</option><option>Trustee</option>
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Description / notes *</label>
            <input placeholder="e.g. Rudrabhishekam — Rajan Kumar · Monday morning pooja" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        <div className="h-px bg-border-secondary my-4" />

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Devotee (optional)</label>
            <input placeholder="Search devotee name..." className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Receipt required?</label>
            <select className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors">
              <option>No receipt needed</option><option>Generate donation receipt</option><option>Generate Gift Aid receipt</option><option>Generate pooja receipt</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 mt-1 border-t border-border-secondary">
          <Link href="/temple-admin/finance/transactions">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="primary" onClick={() => { showToast("Transaction saved!"); }}>Save transaction</Button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
