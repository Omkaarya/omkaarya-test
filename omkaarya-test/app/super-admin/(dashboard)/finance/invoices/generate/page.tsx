"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, Eye, Send, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";
import { jsonApiErrorMessage } from "@/lib/api-envelope";

// ── Temple Data ──────────────────────────────────────────────────

type TempleOption = { tenantId: string; name: string; portalUrl: string; adminEmail: string };

type PricingPlan = { id: string; name: string; priceMonthly: number; priceYearly: number };

type BillingProfile = {
  issuer: { name: string; address: string; email: string; website: string; brandLine: string };
  paymentMethodLabel: string;
  bank: { bankName: string; accountName: string; accountNumber: string; swift: string; notes: string };
  tax: { rateBps: number; label: string };
  money: { currency: string };
};

function formatMoney(currency: string, amountCents: number | null): string {
  if (amountCents === null) return "—";
  const c = (currency || "USD").toUpperCase();
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(amountCents / 100);
}

// ── Toast ──────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-success-500/20 bg-status-success-bg text-status-success-text px-5 py-4 shadow-xl">
      <CheckCircle2 className="h-5 w-5 shrink-0" /><p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────────

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary outline-none focus:border-brand transition-colors";
const readonlyClass = "w-full rounded-lg border border-border bg-subtle px-3 py-2 text-xs text-text-tertiary outline-none";

// ── Page ────────────────────────────────────────────────────────────

export default function GenerateInvoicePage() {
  const [templeId, setTempleId] = useState("");
  const [temples, setTemples] = useState<TempleOption[]>([]);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [planName, setPlanName] = useState<string>("");
  const [billingCycleRaw, setBillingCycleRaw] = useState<"Monthly" | "Annually">("Monthly");
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [invoiceNum, setInvoiceNum] = useState("—");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [description, setDescription] = useState("");
  const qty = 1;
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [bankName, setBankName] = useState("—");
  const [accountName, setAccountName] = useState("—");
  const [accountNumber, setAccountNumber] = useState("—");
  const [swift, setSwift] = useState("—");
  const [notes, setNotes] = useState("—");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  const selectedTemple = temples.find(t => t.tenantId === templeId);
  const paymentRef = templeId ? `${templeId}-INV` : "—";
  const periodFrom = invoiceDate;
  const periodTo = (() => {
    const d = new Date(invoiceDate);
    if (Number.isNaN(d.getTime())) return invoiceDate;
    if (billingCycleRaw === "Annually") d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  const currency = profile?.money?.currency || "USD";
  const amountFormatted = formatMoney(currency, amountCents);
  const taxRateBps = profile?.tax?.rateBps ?? 0;
  const taxCents = amountCents === null ? null : Math.max(0, Math.round((amountCents * taxRateBps) / 10_000));
  const taxFormatted = formatMoney(currency, taxCents);
  const totalDueFormatted = amountCents === null ? "—" : formatMoney(currency, amountCents + (taxCents ?? 0));

  // Load temple options once
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadErr(null);
      const profRes = await fetch("/api/billing/profile", { cache: "no-store" });
      const prof = (await profRes.json().catch(() => null)) as { success?: boolean; data?: BillingProfile } | null;
      if (!cancel && prof && prof.success === true && prof.data) {
        setProfile(prof.data);
        setBankName(prof.data.bank.bankName || "—");
        setAccountName(prof.data.bank.accountName || "—");
        setAccountNumber(prof.data.bank.accountNumber || "—");
        setSwift(prof.data.bank.swift || "—");
        setNotes(prof.data.bank.notes || "—");
      }

      const plansRes = await fetch("/api/pricing-plans", { cache: "no-store" });
      const plansBody = (await plansRes.json().catch(() => null)) as { success?: boolean; data?: PricingPlan[] } | null;
      if (!cancel && plansBody && plansBody.success === true && Array.isArray(plansBody.data)) {
        setPlans(plansBody.data);
        if (!planName && plansBody.data[0]?.name) setPlanName(plansBody.data[0].name);
      }

      const res = await fetch("/api/billing/temples/options", { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as { success?: boolean; data?: { data?: TempleOption[] } } | null;
      if (cancel) return;
      if (!d || d.success !== true || !d.data) {
        setLoadErr(jsonApiErrorMessage(d) || "Failed to load temples");
        return;
      }
      setTemples(d.data.data ?? []);
    })();
    return () => { cancel = true; };
  }, [planName]);

  useEffect(() => {
    const p = plans.find((x) => x.name === planName);
    if (!p) return;
    const cents = billingCycleRaw === "Annually" ? p.priceYearly : p.priceMonthly;
    setAmountCents(typeof cents === "number" ? Math.max(0, Math.trunc(cents)) : null);
  }, [plans, planName, billingCycleRaw]);

  const formatInvDate = (d: string) => {
    if (!d) return "—";
    const dt = new Date(d);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <Link href="/super-admin/finance/invoices" className="text-brand hover:underline">Invoices</Link>
        <span>›</span>
        <span>Generate invoice</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Generate invoice</h1>
          <p className="mt-1 text-sm text-text-tertiary">Create a subscription invoice for a temple — will be emailed automatically</p>
        </div>
        <Link href="/super-admin/finance/invoices">
          <Button variant="outline" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        </Link>
      </div>

      {/* Two Column Layout: Form + Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
        {/* LEFT: Form */}
        <div className="space-y-4">
          {loadErr && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
              {loadErr}
            </div>
          )}
          {/* Invoice Details */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4 pb-3 border-b border-border">Invoice details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Temple *">
                <select value={templeId} onChange={e => setTempleId(e.target.value)} className={inputClass + " cursor-pointer"}>
                  <option value="">Select temple...</option>
                  {temples.map(t => <option key={t.tenantId} value={t.tenantId}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="Invoice number (auto)">
                <input className={readonlyClass} value={invoiceNum} readOnly />
              </Field>
              <Field label="Invoice date">
                <input type="date" className={inputClass} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </Field>
              <Field label="Due date">
                <input type="date" className={inputClass} value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </Field>
              <Field label="Plan *">
                <select value={planName} onChange={(e) => setPlanName(e.target.value)} className={inputClass + " cursor-pointer"}>
                  <option value="">Select plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Billing cycle">
                <select value={billingCycleRaw} onChange={(e) => setBillingCycleRaw(e.target.value as "Monthly" | "Annually")} className={inputClass + " cursor-pointer"}>
                  <option value="Monthly">Monthly</option>
                  <option value="Annually">Annually</option>
                </select>
              </Field>
              <Field label="Billing period from">
                <input type="date" className={inputClass} value={periodFrom} readOnly />
              </Field>
              <Field label="Billing period to">
                <input type="date" className={inputClass} value={periodTo} readOnly />
              </Field>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4 pb-3 border-b border-border">Line items</h3>
            <table className="w-full mb-3">
              <thead>
                <tr className="border-b border-border bg-subtle">
                  <th className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-left px-3 py-2" style={{ width: "40%" }}>Description</th>
                  <th className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-left px-3 py-2" style={{ width: "12%" }}>Qty</th>
                  <th className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-left px-3 py-2" style={{ width: "18%" }}>Unit price</th>
                  <th className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-left px-3 py-2" style={{ width: "18%" }}>Amount</th>
                  <th className="px-3 py-2" style={{ width: "12%" }}></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2"><input className={inputClass} value={description} onChange={e => setDescription(e.target.value)} /></td>
                  <td className="px-3 py-2"><input className={inputClass + " text-center"} type="number" value={qty} readOnly /></td>
                  <td className="px-3 py-2"><input className={readonlyClass} value={amountFormatted} readOnly /></td>
                  <td className="px-3 py-2"><input className={readonlyClass} value={amountFormatted} readOnly /></td>
                  <td className="px-3 py-2"></td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="bg-subtle rounded-lg p-4 mt-4">
              <div className="flex justify-between text-xs text-text-secondary py-1"><span>Subtotal</span><span>{amountFormatted}</span></div>
              <div className="flex justify-between text-xs text-text-secondary py-1"><span>{profile?.tax?.label ?? "Tax"} ({(taxRateBps / 100).toFixed(2)}%)</span><span>{taxFormatted}</span></div>
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 mt-2 border-t border-border"><span>Total due</span><span className="text-brand">{totalDueFormatted}</span></div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4 pb-3 border-b border-border">Payment instructions (shown on invoice)</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bank name"><input className={inputClass} value={bankName} readOnly /></Field>
              <Field label="Account name"><input className={inputClass} value={accountName} readOnly /></Field>
              <Field label="Account number"><input className={inputClass} value={accountNumber} readOnly /></Field>
              <Field label="SWIFT / BIC"><input className={inputClass} value={swift} readOnly /></Field>
              <Field label="Payment reference (auto-generated)" className="col-span-2">
                <input className={readonlyClass} value={paymentRef} readOnly />
              </Field>
            </div>
            <Field label="Notes / payment terms" className="mt-4">
              <textarea className={inputClass + " min-h-[60px]"} rows={2} value={notes} readOnly />
            </Field>

            {/* Footer Buttons */}
            <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-border">
              <Link href="/super-admin/finance/invoices"><Button variant="outline">Cancel</Button></Link>
              <Button
                variant="outline"
                onClick={async () => {
                  const res = await fetch("/api/billing/invoices/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({
                      tenantId: templeId,
                      planName,
                      billingCycleRaw,
                      issueDate: invoiceDate,
                      dueDate,
                      description,
                      sendEmail: false,
                    }),
                  });
                  const d = await res.json().catch(() => null);
                  if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
                    showToast(jsonApiErrorMessage(d) || "Failed to save draft");
                    return;
                  }
                  const inv = (d as { data?: { invoiceNumber?: string; amountCents?: number; currency?: string } }).data;
                  if (inv?.invoiceNumber) setInvoiceNum(inv.invoiceNumber);
                  if (typeof inv?.amountCents === "number") setAmountCents(inv.amountCents);
                  showToast("Saved as draft (created invoice row)");
                }}
              >
                Save as draft
              </Button>
              <Button
                variant="primary"
                leadingIcon={<Send className="h-4 w-4" />}
                onClick={async () => {
                  const res = await fetch("/api/billing/invoices/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({
                      tenantId: templeId,
                      planName,
                      billingCycleRaw,
                      issueDate: invoiceDate,
                      dueDate,
                      description,
                      sendEmail: true,
                    }),
                  });
                  const d = await res.json().catch(() => null);
                  if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
                    showToast(jsonApiErrorMessage(d) || "Failed to send invoice");
                    return;
                  }
                  const inv = (d as { data?: { invoiceNumber?: string; amountCents?: number; currency?: string } }).data;
                  if (inv?.invoiceNumber) setInvoiceNum(inv.invoiceNumber);
                  if (typeof inv?.amountCents === "number") setAmountCents(inv.amountCents);
                  showToast("Invoice generated and emailed to temple!");
                }}
              >
                Send to temple
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-text-primary">🔍 Live preview</span>
            <span className="text-[10px] text-text-tertiary">updates as you type</span>
          </div>
          <div className="bg-surface rounded-xl border border-border p-7 sticky top-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-6 pb-5 border-b-2 border-brand">
              <div>
                <p className="text-lg font-extrabold text-brand tracking-tight">OMKAARYA</p>
                <p className="text-[11px] text-text-tertiary mt-0.5">{profile?.issuer?.name ?? "—"} · {profile?.issuer?.address ?? "—"}</p>
                <p className="text-[11px] text-text-tertiary">{profile?.issuer?.email ?? "—"} · {profile?.issuer?.website ?? "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-text-primary">INVOICE</p>
                <p className="text-xs font-mono text-text-tertiary mt-1">{invoiceNum}</p>
                <p className="text-[11px] text-text-tertiary mt-1">Issued: {formatInvDate(invoiceDate)}</p>
                <p className="text-[11px] text-text-tertiary">Due: {formatInvDate(dueDate)}</p>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">From</p>
                <p className="text-sm font-bold text-text-primary">{profile?.issuer?.name ?? "—"}</p>
                <p className="text-[11px] text-text-tertiary leading-relaxed">{profile?.issuer?.address ?? "—"}<br/>{profile?.issuer?.email ?? "—"}<br/>{profile?.issuer?.website ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Bill to</p>
                <p className="text-sm font-bold text-text-primary">{selectedTemple?.name || "Select a temple above"}</p>
                <p className="text-[11px] text-text-tertiary leading-relaxed">{selectedTemple ? `${selectedTemple.portalUrl}\n${selectedTemple.adminEmail}` : "temple portal · admin email"}</p>
              </div>
            </div>

            {/* Line Items Preview */}
            <table className="w-full mb-4">
              <thead>
                <tr className="border-b-2 border-border bg-subtle">
                  <th className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-left px-3 py-2">Description</th>
                  <th className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-left px-3 py-2">Qty</th>
                  <th className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-left px-3 py-2">Unit price</th>
                  <th className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-right px-3 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2.5 text-xs text-text-primary">
                    {description}
                    <br/><span className="text-[10px] text-text-tertiary">Billing period: {formatInvDate(periodFrom)} – {formatInvDate(periodTo)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-secondary">{qty}</td>
                  <td className="px-3 py-2.5 text-xs text-text-secondary">{amountFormatted}</td>
                  <td className="px-3 py-2.5 text-xs text-right font-semibold text-text-primary">{amountFormatted}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals Preview */}
            <div className="bg-subtle rounded-lg p-4 mb-4">
              <div className="flex justify-between text-xs text-text-secondary py-1"><span>Subtotal</span><span>{amountFormatted}</span></div>
              <div className="flex justify-between text-xs text-text-secondary py-1"><span>{profile?.tax?.label ?? "Tax"} ({(taxRateBps / 100).toFixed(2)}%)</span><span>{taxFormatted}</span></div>
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 mt-2 border-t border-border"><span>Total due</span><span className="text-brand">{totalDueFormatted}</span></div>
            </div>

            {/* Bank Details Preview */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">🏦 Bank transfer details</p>
              <div className="flex flex-wrap gap-4">
                <div><p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Bank</p><p className="text-xs font-semibold text-text-primary">{bankName}</p></div>
                <div><p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Account name</p><p className="text-xs font-semibold text-text-primary">{accountName}</p></div>
                <div><p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Account no.</p><p className="text-xs font-semibold text-text-primary">{accountNumber}</p></div>
                <div><p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">SWIFT</p><p className="text-xs font-semibold text-text-primary">{swift}</p></div>
              </div>
              {/* Payment Reference Box */}
              <div className="mt-3 rounded-lg border-[1.5px] border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3">
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">Payment reference (include in your transfer)</p>
                <p className="text-sm font-bold font-mono text-text-primary">{paymentRef}</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">Please include this reference so we can identify your payment</p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-[11px] text-text-tertiary leading-relaxed border-t border-border pt-3">
              {notes}
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
