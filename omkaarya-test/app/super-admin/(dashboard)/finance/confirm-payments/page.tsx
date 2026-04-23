"use client";

import { useState, useCallback, useEffect } from "react";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { CheckCircle2, X, XCircle } from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";

// ── Types ──────────────────────────────────────────────────────────

type PendingPayment = {
  id: string;
  temple: string;
  location: string;
  plan: string;
  amount: string;
  invoiceId: string | null;
  paymentRef: string;
  submitted: string;
  note: string;
  slipUrl: string;
  slipUploaded: boolean;
};

// ── Toast ──────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border px-5 py-4 shadow-xl ${type === "success" ? "border-success-500/20 bg-status-success-bg text-status-success-text" : "border-error-500/20 bg-status-danger-bg text-status-danger-text"}`}>
      {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
      <p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

type ApiP = {
  id: string;
  temple: string;
  location: string;
  plan: string;
  amountCents: number;
  currency: string;
  invoiceId: string | null;
  invoiceRef: string | null;
  paymentRef: string;
  submitted: string;
  note: string;
  slipUrl: string;
};

function toUi(r: ApiP): PendingPayment {
  return {
    id: r.id,
    temple: r.temple,
    location: r.location,
    plan: r.plan,
    amount: formatUsdFromCents(r.amountCents),
    invoiceId: r.invoiceRef,
    paymentRef: r.paymentRef,
    submitted: r.submitted,
    note: r.note,
    slipUrl: r.slipUrl,
    slipUploaded: Boolean((r.slipUrl ?? "").trim()),
  };
}

export default function ConfirmPaymentsPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const load = useCallback(async () => {
    setLoadErr(null);
    const res = await fetch("/api/billing/payment-submissions/pending", { cache: "no-store" });
    const d = (await res.json().catch(() => null)) as
      | { success?: boolean; data?: { data: ApiP[] } }
      | null;
    if (!d || d.success !== true || !d.data) {
      setLoadErr(jsonApiErrorMessage(d) || "Failed to load pending payments");
      setPayments([]);
      return;
    }
    setPayments((d.data.data ?? []).map(toUi));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConfirm = useCallback(
    async (payment: PendingPayment) => {
      const res = await fetch(`/api/billing/payment-submissions/${encodeURIComponent(payment.id)}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ verifiedBy: "Super Admin" }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || (d && typeof d === "object" && "success" in d && d.success === false)) {
        showToast(jsonApiErrorMessage(d) || "Confirm failed", "error");
        return;
      }
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
      showToast(`Payment confirmed! Receipt generated and emailed to ${payment.temple}.`, "success");
    },
    [showToast]
  );

  const handleReject = useCallback(
    async (payment: PendingPayment) => {
      const res = await fetch(`/api/billing/payment-submissions/${encodeURIComponent(payment.id)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({}),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || (d && typeof d === "object" && "success" in d && d.success === false)) {
        showToast(jsonApiErrorMessage(d) || "Reject failed", "error");
        return;
      }
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
      showToast(`Submission rejected for ${payment.temple}.`, "error");
    },
    [showToast]
  );

  return (
    <div className="space-y-5">
      {loadErr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {loadErr}
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Confirm payment</h1>
        <p className="mt-1 text-sm text-text-tertiary">Temples that have submitted bank transfer notifications — verify and activate</p>
      </div>

      {/* Alert Banner */}
      <div className="rounded-xl border-[1.5px] border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 flex gap-3 items-start">
        <span className="text-lg shrink-0 mt-0.5">⏳</span>
        <div>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">{payments.length} temples awaiting payment verification</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            When a temple clicks &quot;I&apos;ve completed the transfer&quot;, you receive a notification here. Verify the bank transfer, then click Confirm to activate their portal and auto-generate a receipt.
          </p>
        </div>
      </div>

      {/* Payment Cards */}
      <div className="space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Payment Details */}
              <div className="flex gap-3 items-start flex-1">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-xl">🛕</div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-text-primary mb-0.5">{payment.temple}</h3>
                  <p className="text-xs text-text-tertiary mb-3">{payment.location} · {payment.invoiceId ?? "—"} · {payment.plan} plan</p>

                  {/* Detail Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Amount</p>
                      <p className="text-base font-bold text-green-600">{payment.amount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Payment ref</p>
                      <p className="text-xs font-mono font-bold text-text-primary">{payment.paymentRef}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Submitted</p>
                      <p className="text-xs text-text-secondary">{payment.submitted}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Slip uploaded</p>
                      <p className={`text-xs font-semibold ${payment.slipUploaded ? "text-green-600" : "text-red-600"}`}>
                        {payment.slipUploaded ? "✓ Yes" : "✗ No"}
                      </p>
                    </div>
                  </div>

                  {/* Note from temple */}
                  <div className="rounded-lg bg-subtle p-3 mb-3">
                    <p className="text-xs text-text-secondary">📝 Note from temple: &quot;{payment.note}&quot;</p>
                  </div>

                  {/* Payment slip link */}
                  {payment.slipUploaded && payment.slipUrl ? (
                    <Button variant="outline" size="sm" onClick={() => window.open(payment.slipUrl, "_blank", "noopener,noreferrer")}>📎 View payment slip</Button>
                  ) : (
                    <p className="text-xs text-amber-600">⚠️ Temple did not upload a payment slip — verify bank statement directly</p>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="primary" size="sm" onClick={() => void handleConfirm(payment)}>✓ Confirm &amp; activate</Button>
                <Button variant="outline" size="sm" onClick={() => showToast("Requesting more info from temple…", "success")}>Ask for info</Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:border-red-400 hover:text-red-700" onClick={() => void handleReject(payment)}>Reject</Button>
              </div>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-sm font-bold text-text-primary mb-1">All payments confirmed</h3>
            <p className="text-xs text-text-tertiary">No pending payment verifications at this time.</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
