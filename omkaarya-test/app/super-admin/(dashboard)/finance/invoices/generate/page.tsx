"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import GuardedBackLink from "@/app/components/admin/GuardedBackLink";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";

import FormField from "@/app/components/admin/FormField";
import { adminInputReadonlyClassName } from "@/app/components/admin/inputStyles";
import SelectInput from "@/app/components/admin/SelectInput";
import TextareaInput from "@/app/components/admin/TextareaInput";
import TextInput from "@/app/components/admin/TextInput";
import { Button } from "@/app/components/ds/atoms/Button";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { formSnapshot } from "@/lib/form-snapshot";
import {
  flatPlatformBankDetails,
  OMKAARYA_PLATFORM_BANK_DETAILS,
} from "@/lib/omkaarya-platform-bank-details";
import {
  billToPreviewLines,
  buildInvoiceDescription,
  invoiceBillToFromTempleDetail,
  mergeTempleOptionFromDetail,
  normalizeInvoiceBillingCycle,
  type InvoiceBillTo,
} from "@/lib/invoice-temple-prefill";
import { buildTempleInvoicePaymentReference } from "@/lib/payment-reference";
import type { SuperAdminTempleDetail } from "@/lib/super-admin-temple-detail";
import { usePostSaveSuccess } from "@/lib/use-post-save-success";
import { useUnsavedFormGuard } from "@/lib/use-unsaved-form-guard";

const LIST_PATH = "/super-admin/finance/invoices";

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

// ── Page ────────────────────────────────────────────────────────────

export default function GenerateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTenantId = searchParams.get("tenantId")?.trim() ?? "";
  const urlPlan = searchParams.get("plan")?.trim() ?? "";
  const urlBillingCycle = searchParams.get("billingCycle")?.trim() ?? "";

  const [templeId, setTempleId] = useState("");
  const [temples, setTemples] = useState<TempleOption[]>([]);
  const [billTo, setBillTo] = useState<InvoiceBillTo | null>(null);
  const [templeDetailLoading, setTempleDetailLoading] = useState(false);
  const prefillTempleRef = useRef<string | null>(null);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [planName, setPlanName] = useState<string>("");
  const [billingCycleRaw, setBillingCycleRaw] = useState<"Monthly" | "Annually">("Monthly");
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [invoiceNum, setInvoiceNum] = useState("");
  const [invoiceNumLoading, setInvoiceNumLoading] = useState(true);
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [description, setDescription] = useState("");
  const qty = 1;
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const platformBank = flatPlatformBankDetails();
  const [bankName] = useState(platformBank.bankName);
  const [branchName] = useState(platformBank.branchName);
  const [accountName] = useState(platformBank.accountName);
  const [accountNumber] = useState(platformBank.accountNumber);
  const [swift] = useState(platformBank.swift);
  const [notes] = useState(platformBank.notes);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const baselineRef = useRef<string | null>(null);

  const currentSnapshot = useMemo(
    () => formSnapshot({ templeId, planName, billingCycleRaw, invoiceDate, dueDate, description }),
    [templeId, planName, billingCycleRaw, invoiceDate, dueDate, description]
  );

  useEffect(() => {
    if (baselineRef.current === null) {
      baselineRef.current = currentSnapshot;
    }
  }, [currentSnapshot]);

  const isDirty = baselineRef.current !== null && currentSnapshot !== baselineRef.current;
  const postSave = usePostSaveSuccess({ router });
  const formGuard = useUnsavedFormGuard({ isDirty, enabled: !postSave.isLocked });

  const selectedTemple = temples.find((t) => t.tenantId === templeId);
  const billToDisplayName = billTo?.templeName || selectedTemple?.name || "Select a temple above";
  const paymentRef = selectedTemple
    ? buildTempleInvoicePaymentReference(selectedTemple.name, selectedTemple.tenantId)
    : "—";
  const invoiceNumDisplay = invoiceNumLoading ? "Generating…" : invoiceNum || "—";
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
      }

      const numRes = await fetch("/api/billing/invoices/next-number", { cache: "no-store" });
      const numBody = (await numRes.json().catch(() => null)) as {
        success?: boolean;
        data?: { invoiceNumber?: string };
      } | null;
      if (!cancel) {
        if (numBody?.success === true && numBody.data?.invoiceNumber) {
          setInvoiceNum(numBody.data.invoiceNumber);
        } else {
          const d = new Date();
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const seq = String(d.getTime()).slice(-6);
          setInvoiceNum(`OMK-INV-${y}${m}-${seq}`);
        }
        setInvoiceNumLoading(false);
      }

      const plansRes = await fetch("/api/pricing-plans", { cache: "no-store" });
      const plansBody = (await plansRes.json().catch(() => null)) as { success?: boolean; data?: PricingPlan[] } | null;
      if (!cancel && plansBody && plansBody.success === true && Array.isArray(plansBody.data)) {
        setPlans(plansBody.data);
        setPlanName((prev) => prev || plansBody.data?.[0]?.name || "");
      }

      const res = await fetch("/api/billing/temples/options", { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as { success?: boolean; data?: { data?: TempleOption[] } } | null;
      if (cancel) return;
      if (!d || d.success !== true || !d.data) {
        setLoadErr(jsonApiErrorMessage(d) || "Failed to load temples");
        return;
      }
      const list = d.data.data ?? [];
      setTemples(list);
      if (urlTenantId && list.some((t) => t.tenantId === urlTenantId)) {
        setTempleId(urlTenantId);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [urlTenantId]);

  useEffect(() => {
    if (!urlPlan) return;
    setPlanName(urlPlan);
  }, [urlPlan]);

  useEffect(() => {
    if (!urlBillingCycle) return;
    setBillingCycleRaw(normalizeInvoiceBillingCycle(urlBillingCycle));
  }, [urlBillingCycle]);

  useEffect(() => {
    if (!templeId) {
      setBillTo(null);
      prefillTempleRef.current = null;
      return;
    }

    let cancel = false;
    (async () => {
      setTempleDetailLoading(true);
      try {
        const res = await fetch(`/api/temples/${encodeURIComponent(templeId)}`, { cache: "no-store" });
        const body = (await res.json().catch(() => null)) as {
          success?: boolean;
          data?: SuperAdminTempleDetail;
        } | null;
        if (cancel || !body?.success || !body.data) return;

        const detail = body.data;
        const subdomain = detail.temple.subdomain?.trim();
        let portalUrl = subdomain ? `https://${subdomain}.omkaarya.com` : "";

        setTemples((prev) => {
          const option = prev.find((t) => t.tenantId === templeId);
          portalUrl = option?.portalUrl?.trim() || portalUrl;
          return prev.map((t) =>
            t.tenantId === templeId ? mergeTempleOptionFromDetail(t, detail, portalUrl) : t
          );
        });
        setBillTo(invoiceBillToFromTempleDetail(detail, portalUrl));

        const shouldApplyPlanFields = prefillTempleRef.current !== templeId;
        if (shouldApplyPlanFields) {
          prefillTempleRef.current = templeId;
          const planFromDetail = detail.planBilling.selectedPlan?.trim();
          const cycleFromDetail = normalizeInvoiceBillingCycle(detail.planBilling.billingCycle);
          const resolvedPlan = urlPlan || planFromDetail;
          const resolvedCycle = urlBillingCycle
            ? normalizeInvoiceBillingCycle(urlBillingCycle)
            : cycleFromDetail;

          if (resolvedPlan) setPlanName(resolvedPlan);
          setBillingCycleRaw(resolvedCycle);

          const templeName = detail.temple.name?.trim();
          if (resolvedPlan) {
            setDescription(buildInvoiceDescription(resolvedPlan, resolvedCycle, templeName));
          }
        }
      } finally {
        if (!cancel) setTempleDetailLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [templeId, urlPlan, urlBillingCycle]);

  useEffect(() => {
    const p = plans.find((x) => x.name === planName);
    if (!p) return;
    const cents = billingCycleRaw === "Annually" ? p.priceYearly : p.priceMonthly;
    setAmountCents(typeof cents === "number" ? Math.max(0, Math.trunc(cents)) : null);
  }, [plans, planName, billingCycleRaw]);

  const submitInvoice = async (sendEmail: boolean, successMessage: string) => {
    setSubmitError(null);
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
        sendEmail,
      }),
    });
    const d = await res.json().catch(() => null);
    if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
      setSubmitError(jsonApiErrorMessage(d) || (sendEmail ? "Failed to send invoice" : "Failed to save draft"));
      return;
    }
    const inv = (d as { data?: { invoiceNumber?: string; amountCents?: number } }).data;
    if (inv?.invoiceNumber) setInvoiceNum(inv.invoiceNumber);
    if (typeof inv?.amountCents === "number") setAmountCents(inv.amountCents);
    baselineRef.current = currentSnapshot;
    formGuard.markClean();
    postSave.triggerSuccess({ message: successMessage, redirectTo: LIST_PATH });
  };

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
        <GuardedBackLink href={LIST_PATH} onNavigate={formGuard.requestNavigate} className="text-brand hover:underline">
          Invoices
        </GuardedBackLink>
        <span>›</span>
        <span>Generate invoice</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Generate invoice</h1>
          <p className="mt-1 text-sm text-text-tertiary">Create a subscription invoice for a temple — will be emailed automatically</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leadingIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => formGuard.requestNavigate(LIST_PATH)}
          disabled={postSave.isLocked}
        >
          Back
        </Button>
      </div>

      <PostSaveSuccessBanner text={postSave.bannerText} />
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {submitError}
        </div>
      )}

      <fieldset disabled={postSave.isLocked} className="contents min-w-0 border-0 p-0 m-0">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id="invoice-temple" label="Temple" required>
                <SelectInput
                  id="invoice-temple"
                  value={templeId}
                  onChange={(e) => {
                    prefillTempleRef.current = null;
                    setTempleId(e.target.value);
                  }}
                  className="text-xs"
                >
                  <option value="">Select temple...</option>
                  {temples.map((t) => (
                    <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField id="invoice-number" label="Invoice number (auto)">
                <TextInput id="invoice-number" className={`text-xs ${adminInputReadonlyClassName}`} value={invoiceNumDisplay} readOnly />
              </FormField>
              <FormField id="invoice-date" label="Invoice date">
                <TextInput id="invoice-date" type="date" className="text-xs" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </FormField>
              <FormField id="invoice-due-date" label="Due date">
                <TextInput id="invoice-due-date" type="date" className="text-xs" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </FormField>
              <FormField id="invoice-plan" label="Plan" required>
                <SelectInput id="invoice-plan" value={planName} onChange={(e) => setPlanName(e.target.value)} className="text-xs">
                  <option value="">Select plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField id="invoice-billing-cycle" label="Billing cycle">
                <SelectInput
                  id="invoice-billing-cycle"
                  value={billingCycleRaw}
                  onChange={(e) => setBillingCycleRaw(e.target.value as "Monthly" | "Annually")}
                  className="text-xs"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annually">Annually</option>
                </SelectInput>
              </FormField>
              <FormField id="invoice-period-from" label="Billing period from">
                <TextInput id="invoice-period-from" type="date" className={`text-xs ${adminInputReadonlyClassName}`} value={periodFrom} readOnly />
              </FormField>
              <FormField id="invoice-period-to" label="Billing period to">
                <TextInput id="invoice-period-to" type="date" className={`text-xs ${adminInputReadonlyClassName}`} value={periodTo} readOnly />
              </FormField>
            </div>
          </div>

          {/* Bill to (from temple profile) */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4 pb-3 border-b border-border">Bill to</h3>
            {templeDetailLoading ? (
              <p className="text-xs text-text-tertiary">Loading temple admin details…</p>
            ) : !templeId ? (
              <p className="text-xs text-text-tertiary">Select a temple to load admin and billing contact.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="invoice-bill-to-name" label="Temple">
                  <TextInput
                    id="invoice-bill-to-name"
                    className={`text-xs ${adminInputReadonlyClassName}`}
                    value={billToDisplayName}
                    readOnly
                  />
                </FormField>
                <FormField id="invoice-bill-to-admin" label="Temple admin">
                  <TextInput
                    id="invoice-bill-to-admin"
                    className={`text-xs ${adminInputReadonlyClassName}`}
                    value={billTo?.adminName || "—"}
                    readOnly
                  />
                </FormField>
                <FormField id="invoice-bill-to-email" label="Admin email">
                  <TextInput
                    id="invoice-bill-to-email"
                    className={`text-xs ${adminInputReadonlyClassName}`}
                    value={billTo?.adminEmail || selectedTemple?.adminEmail || "—"}
                    readOnly
                  />
                </FormField>
                <FormField id="invoice-bill-to-portal" label="Portal URL">
                  <TextInput
                    id="invoice-bill-to-portal"
                    className={`text-xs ${adminInputReadonlyClassName}`}
                    value={billTo?.portalUrl || selectedTemple?.portalUrl || "—"}
                    readOnly
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField id="invoice-bill-to-address" label="Address">
                    <TextareaInput
                      id="invoice-bill-to-address"
                      className={`min-h-[52px] text-xs ${adminInputReadonlyClassName}`}
                      rows={2}
                      value={billTo?.addressLine || "—"}
                      readOnly
                    />
                  </FormField>
                </div>
              </div>
            )}
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
                  <td className="px-3 py-2">
                    <TextInput className="text-xs" value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Line item description" />
                  </td>
                  <td className="px-3 py-2">
                    <TextInput className="text-center text-xs" type="number" value={qty} readOnly aria-label="Quantity" />
                  </td>
                  <td className="px-3 py-2">
                    <TextInput className={`text-xs ${adminInputReadonlyClassName}`} value={amountFormatted} readOnly aria-label="Unit price" />
                  </td>
                  <td className="px-3 py-2">
                    <TextInput className={`text-xs ${adminInputReadonlyClassName}`} value={amountFormatted} readOnly aria-label="Amount" />
                  </td>
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
            <p className="mb-4 text-xs font-semibold text-text-secondary">{OMKAARYA_PLATFORM_BANK_DETAILS.header}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id="invoice-bank-name" label="Bank name">
                <TextInput id="invoice-bank-name" className={`text-xs ${adminInputReadonlyClassName}`} value={bankName} readOnly />
              </FormField>
              <FormField id="invoice-branch-name" label="Branch name">
                <TextInput id="invoice-branch-name" className={`text-xs ${adminInputReadonlyClassName}`} value={branchName} readOnly />
              </FormField>
              <FormField id="invoice-account-name" label="Account name">
                <TextInput id="invoice-account-name" className={`text-xs ${adminInputReadonlyClassName}`} value={accountName} readOnly />
              </FormField>
              <FormField id="invoice-account-number" label="Account number">
                <TextInput id="invoice-account-number" className={`text-xs ${adminInputReadonlyClassName}`} value={accountNumber} readOnly />
              </FormField>
              <FormField id="invoice-swift" label="SWIFT / BIC">
                <TextInput id="invoice-swift" className={`text-xs ${adminInputReadonlyClassName}`} value={swift} readOnly />
              </FormField>
              <div className="sm:col-span-2">
                <FormField id="invoice-payment-ref" label="Payment reference (auto-generated)">
                  <TextInput id="invoice-payment-ref" className={`text-xs ${adminInputReadonlyClassName}`} value={paymentRef} readOnly />
                </FormField>
              </div>
            </div>
            <FormField id="invoice-notes" label="Notes / payment terms">
              <TextareaInput id="invoice-notes" className={`min-h-[60px] text-xs ${adminInputReadonlyClassName}`} rows={2} value={notes} readOnly />
            </FormField>

            {/* Footer Buttons */}
            <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => formGuard.requestNavigate(LIST_PATH)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void submitInvoice(false, "Invoice saved as draft.")}
              >
                Save as draft
              </Button>
              <Button
                type="button"
                variant="primary"
                leadingIcon={<Send className="h-4 w-4" />}
                onClick={() => void submitInvoice(true, "Invoice generated and emailed to temple.")}
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
                <p className="text-xs font-mono text-text-tertiary mt-1">{invoiceNumDisplay}</p>
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
                <p className="text-sm font-bold text-text-primary">{billToDisplayName}</p>
                <p className="text-[11px] text-text-tertiary leading-relaxed whitespace-pre-line">{billToPreviewLines(billTo)}</p>
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
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">Bank transfer details</p>
              <p className="text-[11px] font-semibold text-text-primary mb-3">{OMKAARYA_PLATFORM_BANK_DETAILS.header}</p>
              <div className="flex flex-wrap gap-4">
                <div><p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Bank</p><p className="text-xs font-semibold text-text-primary">{bankName}</p></div>
                <div><p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Branch</p><p className="text-xs font-semibold text-text-primary">{branchName}</p></div>
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
      </fieldset>

      <UnsavedChangesDialog
        dialogRef={formGuard.dialogRef}
        onStay={formGuard.closeDialog}
        onLeave={formGuard.confirmLeave}
      />
    </div>
  );
}
