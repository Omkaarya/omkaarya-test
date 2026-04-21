"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
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
const RT_CARDS: { id: ReceiptType; icon: string; name: string; desc: string }[] = [
  { id: "general", icon: "🧾", name: "General receipt", desc: "Standard payment receipt" },
  { id: "donation", icon: "💝", name: "Donation receipt", desc: "Charitable donation — with charity reg number" },
  { id: "giftaid", icon: "🇬🇧", name: "Gift Aid receipt", desc: "UK Gift Aid — includes declaration text" },
  { id: "pooja", icon: "🙏", name: "Pooja receipt", desc: "Pooja booking confirmation & receipt" },
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
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 pb-3 border-b border-border-secondary">Receipt type</h3>
        <div className="grid grid-cols-4 gap-2">
          {RT_CARDS.map((rc) => (
            <button
              key={rc.id}
              onClick={() => setReceiptType(rc.id)}
              className={`p-3.5 rounded-xl border-2 text-center transition-all ${receiptType === rc.id ? "border-brand bg-orange-50" : "border-border bg-surface hover:border-text-quaternary"}`}
            >
              <div className="text-xl mb-1.5">{rc.icon}</div>
              <div className="text-[11px] font-bold text-text-primary">{rc.name}</div>
              <div className="text-[10px] text-text-tertiary mt-1 leading-snug">{rc.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Temple Details */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 pb-3 border-b border-border-secondary">Temple details (auto-filled from settings)</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Temple name</label>
            <input readOnly value="Shiva Temple London" className="border border-border rounded-lg px-3 py-2 text-xs text-text-tertiary bg-subtle outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Charity registration number</label>
            <input defaultValue="1234567" placeholder="Required for donation receipts" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Temple address</label>
            <input readOnly value="12 Temple Road, London E1 6RF" className="border border-border rounded-lg px-3 py-2 text-xs text-text-tertiary bg-subtle outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Country</label>
            <input readOnly value="United Kingdom" className="border border-border rounded-lg px-3 py-2 text-xs text-text-tertiary bg-subtle outline-none" />
          </div>
        </div>
      </div>

      {/* Donor Details */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 pb-3 border-b border-border-secondary">Donor / devotee details</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Donor name *</label>
            <input placeholder="Search devotee or enter name" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Email address</label>
            <input placeholder="For emailing receipt" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Address (required for Gift Aid)</label>
            <input placeholder="Full address including postcode" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 pb-3 border-b border-border-secondary">Donation / payment details</h3>
        <div className="grid grid-cols-3 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Amount *</label>
            <input type="number" defaultValue="120.00" placeholder="0.00" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Currency</label>
            <select className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors">
              <option>GBP — £</option><option>USD — $</option><option>EUR — €</option><option>CAD — $</option><option>SGD — $</option>
            </select>
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
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Receipt number (auto)</label>
            <input readOnly value="OMK-DON-2026-0087" className="border border-border rounded-lg px-3 py-2 text-xs text-text-tertiary bg-subtle outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Purpose / description</label>
            <input defaultValue="Monthly donation — temple fund" className="border border-border rounded-lg px-3 py-2 text-xs text-text-primary bg-surface outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        {/* Gift Aid declaration */}
        {receiptType === "giftaid" && (
          <div className="mt-3 rounded-xl p-3 flex gap-2 items-start bg-blue-50 border-[1.5px] border-blue-200">
            <span className="text-base shrink-0 mt-0.5">🇬🇧</span>
            <div>
              <p className="text-xs font-bold text-blue-700 mb-0.5">Gift Aid declaration (auto-included on receipt)</p>
              <p className="text-[11px] text-text-secondary leading-relaxed">&ldquo;I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all my donations, it is my responsibility to pay any difference.&rdquo;</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4 mt-1 border-t border-border-secondary">
          <Link href="/temple-admin/finance/donations">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="outline" onClick={() => showToast("Preview opened…")}>👁 Preview</Button>
          <Button variant="primary" onClick={() => showToast("Receipt generated & emailed!")}>Generate & email receipt</Button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
