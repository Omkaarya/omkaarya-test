"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, X, FileText, HeartHandshake, Flag, Sparkles, Eye, Send } from "lucide-react";
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

type ReceiptType = "general" | "donation" | "giftaid" | "pooja";
const RT_CARDS = [
  { id: "general", icon: FileText, name: "General receipt", desc: "Standard payment receipt" },
  { id: "donation", icon: HeartHandshake, name: "Donation receipt", desc: "Charitable donation" },
  { id: "giftaid", icon: Flag, name: "Gift Aid receipt", desc: "UK Gift Aid declaration" },
  { id: "pooja", icon: Sparkles, name: "Pooja receipt", desc: "Booking confirmation" },
];

export default function GenerateReceiptPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);
  const [receiptType, setReceiptType] = useState<ReceiptType>("general");

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Link href="/temple-admin/finance/donations" className="text-brand hover:text-brand-600 font-medium transition-colors">Donations</Link>
        <span className="text-text-quaternary">›</span>
        <span>Generate receipt</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Generate receipt</h1>
          <p className="mt-1 text-sm text-text-tertiary">Select the receipt type — fields will adjust for donation, Gift Aid or pooja receipt</p>
        </div>
        <Link href="/temple-admin/finance/donations">
          <Button variant="outline" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        </Link>
      </div>

      {/* Receipt Type */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">Receipt type</h3>
        <div className="grid grid-cols-4 gap-4">
          {RT_CARDS.map((rc) => (
            <button
              key={rc.id}
              onClick={() => setReceiptType(rc.id as ReceiptType)}
              className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${receiptType === rc.id ? "border-[var(--brand-primary)] bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20" : "border-zinc-100 bg-white text-[var(--text-primary)] hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"}`}
            >
              <rc.icon className="h-6 w-6 mb-1" />
              <div className="text-sm font-bold">{rc.name}</div>
              <div className="text-[10px] opacity-80 leading-snug">{rc.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Temple Details */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">Temple details (auto-filled from settings)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Temple name</label>
            <input readOnly value="Omkaarya Temple" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-muted)] bg-zinc-50 outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Charity registration number</label>
            <input defaultValue="1234567" placeholder="Required for donation receipts" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Temple address</label>
            <input readOnly value="12 Temple Road, Colombo" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-muted)] bg-zinc-50 outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Country</label>
            <input readOnly value="Sri Lanka" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-muted)] bg-zinc-50 outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        </div>
      </div>

      {/* Donor Details */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">Donor / devotee details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Donor name *</label>
            <input placeholder="Search devotee or enter name" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Email address</label>
            <input placeholder="For emailing receipt" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Address (required for Gift Aid)</label>
            <input placeholder="Full address including postcode" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950" />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">Donation / payment details</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount *</label>
            <input type="number" defaultValue="120000" placeholder="0.00" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Currency</label>
            <select className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950">
              <option>LKR — LKR</option><option>GBP — £</option><option>USD — $</option><option>EUR — €</option><option>CAD — $</option><option>SGD — $</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Date *</label>
            <input type="date" defaultValue="2026-04-22" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Payment method</label>
            <select className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950">
              <option>Cash</option><option>Bank transfer</option><option>Card</option><option>Cheque</option><option>Online</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Receipt number (auto)</label>
            <input readOnly value="OMK-DON-2026-0087" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-muted)] bg-zinc-50 outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Purpose / description</label>
            <input defaultValue="Monthly donation — temple fund" className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950" />
          </div>
        </div>

        {/* Gift Aid declaration */}
        {receiptType === "giftaid" && (
          <div className="mt-5 rounded-2xl p-4 flex gap-3 items-start bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30">
            <Flag className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-500 mb-1">Gift Aid declaration (auto-included on receipt)</p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed max-w-4xl">&ldquo;I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all my donations, it is my responsibility to pay any difference.&rdquo;</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-6 mt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Link href="/temple-admin/finance/donations">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="outline" onClick={() => showToast("Preview opened…")} className="gap-2">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button variant="primary" onClick={() => showToast("Receipt generated & emailed!")} className="gap-2">
            <Send className="h-4 w-4" /> Generate & email receipt
          </Button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
