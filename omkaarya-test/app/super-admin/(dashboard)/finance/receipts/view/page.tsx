"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
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

type ReceiptD = {
  num: string;
  invoiceRef: string;
  temple: string;
  templeLine: string;
  portal: string;
  email: string;
  plan: string;
  amountCents: number;
  currency: string;
  paymentRef: string;
  method: string;
  periodFrom: string;
  periodTo: string;
  nextRenewal: string;
  description: string;
  paymentDate: string;
  generatedAt: string;
};

type BillingProfile = {
  issuer: { name: string; address: string; email: string; website: string; brandLine: string };
  paymentMethodLabel: string;
  bank: { bankName: string; accountName: string; accountNumber: string; swift: string; notes: string };
  tax: { rateBps: number; label: string };
  money: { currency: string };
};

function formatMoney(currency: string, amountCents: number): string {
  const c = (currency || "USD").toUpperCase();
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format((amountCents ?? 0) / 100);
}

function ReceiptViewContent() {
  const [toast, setToast] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptD | null>(null);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);
  const searchParams = useSearchParams();
  const id = searchParams.get("id")?.trim() ?? "";

  useEffect(() => {
    if (!id) {
      setLoadErr("Missing receipt id");
      return;
    }
    let cancel = false;
    (async () => {
      setLoadErr(null);
      const profRes = await fetch("/api/billing/profile", { cache: "no-store" });
      const prof = (await profRes.json().catch(() => null)) as { success?: boolean; data?: BillingProfile } | null;
      if (!cancel && prof && prof.success === true && prof.data) setProfile(prof.data);

      const res = await fetch(`/api/billing/receipts/${encodeURIComponent(id)}`, { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: Record<string, unknown> }
        | null;
      if (cancel) return;
      if (!d || d.success !== true || !d.data) {
        setLoadErr(jsonApiErrorMessage(d) || "Failed to load receipt");
        return;
      }
      setReceipt(d.data as unknown as ReceiptD);
    })();
    return () => { cancel = true; };
  }, [id]);

  if (loadErr && !receipt) {
    return (
      <div className="p-6 text-sm text-text-tertiary">
        {loadErr}
        <Link href="/super-admin/finance/receipts" className="ml-2 text-brand">Back</Link>
      </div>
    );
  }
  if (!receipt) {
    return <div className="p-6 text-sm text-text-tertiary">Loading…</div>;
  }

  const subtotalCents = receipt.amountCents ?? 0;
  const taxRateBps = profile?.tax?.rateBps ?? 0;
  const taxCents = Math.max(0, Math.round((subtotalCents * taxRateBps) / 10_000));
  const totalCents = subtotalCents + taxCents;
  const currency = receipt.currency || profile?.money?.currency || "USD";

  const amountFormatted = formatMoney(currency, subtotalCents);
  const taxFormatted = formatMoney(currency, taxCents);
  const totalFormatted = formatMoney(currency, totalCents);

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
          <p className="mt-1 text-sm text-text-tertiary">{receipt.templeLine} · {receipt.invoiceRef} · Paid {receipt.paymentDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/super-admin/finance/receipts">
            <Button variant="outline" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<Download className="h-4 w-4" />}
            onClick={() => {
              window.open(`/api/billing/receipts/${encodeURIComponent(id)}/print`, "_blank", "noopener,noreferrer");
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Mail className="h-4 w-4" />}
            onClick={async () => {
              const res = await fetch(`/api/billing/receipts/${encodeURIComponent(id)}/email`, {
                method: "POST",
                headers: { Accept: "application/json" },
              });
              const d = await res.json().catch(() => null);
              if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
                showToast(jsonApiErrorMessage(d) || "Failed to send receipt email");
                return;
              }
              showToast("Receipt emailed to temple!");
            }}
          >
            Email to temple
          </Button>
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
            <p className="text-xs text-text-tertiary mt-1">{profile?.issuer?.brandLine ?? "—"}</p>
            <p className="text-[11px] text-text-tertiary mt-1 font-mono">{receipt.num} · Linked to {receipt.invoiceRef}</p>
          </div>

          {/* Amount Box */}
          <div className="bg-green-600 rounded-xl p-5 text-center mb-5">
            <p className="text-[11px] text-white/80 mb-1.5">Total amount received</p>
            <p className="text-[28px] font-extrabold text-white leading-tight">{totalFormatted}</p>
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
              <DetailRow label="Temple" value={receipt.templeLine} />
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
              <DetailRow label="Subscription fee" value={amountFormatted} />
              <DetailRow label={profile?.tax?.label ?? "Tax"} value={taxFormatted} />
              <DetailRow label="Total paid" value={totalFormatted} bold color="text-green-600" />
            </div>
          </div>

          {/* Footer */}
          <div className="text-[10px] text-text-tertiary text-center leading-relaxed border-t border-border pt-4">
            This receipt was automatically generated by Omkaarya on {receipt.generatedAt}.<br />
            Issued by {profile?.issuer?.name ?? "—"}
            {profile?.issuer?.address ? `, ${profile.issuer.address}` : ""} · {profile?.issuer?.email ?? "—"} · {profile?.issuer?.website ?? "—"}
            <br />
            Receipt number: {receipt.num} · This is an official payment acknowledgement.
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function ReceiptViewPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-text-tertiary">Loading…</div>}
    >
      <ReceiptViewContent />
    </Suspense>
  );
}
