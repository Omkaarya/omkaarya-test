"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, Download, Mail, X } from "lucide-react";
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

// ── Receipt Detail Row ────────────────────────────────────────────
function DetailRow({ label, value, bold, mono, color }: { label: string; value: string; bold?: boolean; mono?: boolean; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border-secondary last:border-b-0">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className={`text-xs text-right ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono text-[11px]' : ''} ${color || 'text-text-primary'}`}>
        {value}
      </span>
    </div>
  );
}

export default function ReceiptViewPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  // Mock receipt data (matches HTML reference)
  const receipt = {
    num: "RCPT-2026-0018",
    invoiceRef: "INV-2026-0022",
    temple: "Shiva Temple — London",
    portal: "shiva-london.omkaarya.com",
    email: "admin@shivatemple.com",
    plan: "Aaradhana (Yearly)",
    amount: "USD 1,099.00",
    amountFormatted: "$1,099.00",
    paymentDate: "18 Apr 2026",
    paymentRef: "SHIVA-TEMPLE-INV-0022",
    method: "Bank transfer",
    periodFrom: "21 Apr 2026",
    periodTo: "20 Apr 2027",
    nextRenewal: "20 Apr 2027",
    description: "Aaradhana Plan — Annual subscription",
    generatedAt: "18 Apr 2026 at 14:32 UTC",
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Link href="/super-admin/finance/receipts" className="text-brand hover:text-brand-600 font-medium transition-colors">
          Receipts
        </Link>
        <span className="text-text-quaternary">›</span>
        <span>{receipt.num}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Payment receipt</h1>
          <p className="mt-1 text-sm text-text-tertiary">{receipt.temple} · {receipt.invoiceRef} · Paid {receipt.paymentDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/super-admin/finance/receipts">
            <Button variant="outline" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
          </Link>
          <Button variant="outline" size="sm" leadingIcon={<Download className="h-4 w-4" />} onClick={() => showToast("Downloading PDF…")}>Download PDF</Button>
          <Button variant="primary" size="sm" leadingIcon={<Mail className="h-4 w-4" />} onClick={() => showToast("Receipt emailed to temple!")}>Email to temple</Button>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="max-w-[660px] mx-auto">
        <div className="bg-surface border border-border rounded-xl p-7 shadow-xs">

          {/* Header — green checkmark + title */}
          <div className="text-center pb-5 border-b-2 border-green-500 mb-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[22px] mb-3">
              ✓
            </div>
            <h2 className="text-xl font-bold text-green-600">PAYMENT RECEIPT</h2>
            <p className="text-xs text-text-tertiary mt-1">OMKAARYA by Pepulux Pvt Ltd</p>
            <p className="text-[11px] text-text-tertiary mt-1 font-mono">{receipt.num} · Linked to {receipt.invoiceRef}</p>
          </div>

          {/* Amount Box */}
          <div className="bg-green-600 rounded-xl p-5 text-center mb-5">
            <p className="text-[11px] text-white/80 mb-1.5">Total amount received</p>
            <p className="text-[28px] font-extrabold text-white leading-tight">{receipt.amount}</p>
            <p className="text-[11px] text-white/80 mt-1">{receipt.description} · {receipt.paymentDate}</p>
          </div>

          {/* Confirmation Stamp */}
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-green-500 rounded-lg mb-5">
            <span className="text-xl">✅</span>
            <span className="text-[13px] font-bold text-green-600">PAYMENT CONFIRMED & PORTAL ACTIVATED</span>
          </div>

          {/* 4 Detail Sections */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Temple details */}
            <div className="bg-subtle rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Temple details</p>
              <DetailRow label="Temple" value={receipt.temple} />
              <DetailRow label="Portal" value={receipt.portal} />
              <DetailRow label="Admin email" value={receipt.email} />
            </div>

            {/* Subscription details */}
            <div className="bg-subtle rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Subscription details</p>
              <DetailRow label="Plan" value={receipt.plan} />
              <DetailRow label="Period from" value={receipt.periodFrom} />
              <DetailRow label="Period to" value={receipt.periodTo} />
              <DetailRow label="Next renewal" value={receipt.nextRenewal} />
            </div>

            {/* Payment details */}
            <div className="bg-subtle rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Payment details</p>
              <DetailRow label="Invoice ref" value={receipt.invoiceRef} />
              <DetailRow label="Payment ref" value={receipt.paymentRef} mono />
              <DetailRow label="Method" value={receipt.method} />
              <DetailRow label="Payment date" value={receipt.paymentDate} />
            </div>

            {/* Amount breakdown */}
            <div className="bg-subtle rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Amount breakdown</p>
              <DetailRow label="Subscription fee" value={receipt.amountFormatted} />
              <DetailRow label="Tax" value="$0.00" />
              <DetailRow label="Total paid" value={receipt.amountFormatted} bold color="text-green-600" />
            </div>
          </div>

          {/* Footer */}
          <div className="text-[10px] text-text-tertiary text-center leading-relaxed border-t border-border pt-4">
            This receipt was automatically generated by Omkaarya on {receipt.generatedAt}.<br />
            Issued by Pepulux Pvt Ltd, Colombo, Sri Lanka · billing@omkaarya.com · omkaarya.com<br />
            Receipt number: {receipt.num} · This is an official payment acknowledgement.
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
