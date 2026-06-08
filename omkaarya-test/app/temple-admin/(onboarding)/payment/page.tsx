"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Building2, Calendar, Copy, UploadCloud, X } from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";
import { submitTempleBankTransferNotification } from "@/lib/templePaymentSubmissionApi";
import { submitTemplePaymentOnboarding } from "@/lib/temple-onboarding-payment-api";
import {
  fetchTempleOnboardingProgress,
  type TempleOnboardingProgress,
} from "@/lib/temple-onboarding-routing";
import { saveTempleOnboardingPaymentComplete } from "@/lib/temple-onboarding-payment";
import { clearTempleOnboardingDeityDraft, isDeitySelectionComplete } from "@/lib/temple-onboarding-deity";
import {
  clearTempleOnboardingPlanDraft,
  loadTempleOnboardingPlanDraft,
  TEMPLE_ONBOARDING_TRIAL_DAYS,
} from "@/lib/temple-onboarding-plan";
import { clearTempleOnboardingPaymentStatus } from "@/lib/temple-onboarding-payment";
import {
  getPlanByIdFromList,
  type ApiPricingPlan,
  formatUsdFromCents,
  effectiveMonthlyFromYearlyCents,
} from "@/lib/temple-pricing-plans";
import {
  TEMPLE_ONBOARDING_EMAIL_KEY,
  TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY,
  TEMPLE_ONBOARDING_TEMP_PASSWORD_KEY,
} from "@/lib/temple-onboarding-signin";
import {
  isTempleOnboardingTempleCreated,
  loadTempleOnboardingTempleCreatedResponse,
  loadTempleOnboardingTempleProfileDraft,
  TEMPLE_ONBOARDING_TEMPLE_CREATED_KEY,
  TEMPLE_ONBOARDING_TEMPLE_CREATED_RESPONSE_KEY,
  clearTempleOnboardingTempleProfileDraft,
} from "@/lib/temple-onboarding-temple-profile";

import { OMKAARYA_PLATFORM_BANK_DETAILS as BANK_DETAILS } from "@/lib/omkaarya-platform-bank-details";
import { normalizePaymentReference } from "@/lib/payment-reference";

const ALLOWED_UPLOAD_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/svg+xml",
]);

function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}


function CopyButton({ value, ariaLabel }: { value: string; ariaLabel: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      // noop: clipboard may be unavailable in some browsers/contexts
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
    >
      <Copy className="h-3.5 w-3.5" aria-hidden />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function PaymentPageSkeleton() {
  return (
    <div
      className="w-full max-w-5xl rounded-3xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-10"
      aria-busy="true"
      aria-label="Loading payment"
    >
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="h-8 w-3/4 max-w-md animate-pulse rounded-lg bg-[var(--surface-elevated)]" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-[var(--surface-elevated)]" />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-elevated)]" />
          <div className="h-11 animate-pulse rounded-lg bg-[var(--surface-elevated)]" />
          <div className="h-11 animate-pulse rounded-lg bg-[var(--surface-elevated)]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 animate-pulse rounded-lg bg-[var(--surface-elevated)]" />
            <div className="h-11 animate-pulse rounded-lg bg-[var(--surface-elevated)]" />
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--surface-elevated)] lg:h-auto" />
      </div>
    </div>
  );
}

export default function TempleAdminPaymentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [planDraft, setPlanDraft] = useState<ReturnType<typeof loadTempleOnboardingPlanDraft>>(null);
  const [catalogPlans, setCatalogPlans] = useState<ApiPricingPlan[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<TempleOnboardingProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [transferredDate, setTransferredDate] = useState(todayIsoDate());
  const [currency, setCurrency] = useState("USD");
  const [amountDollars, setAmountDollars] = useState<string>("");
  const [slipFile, setSlipFile] = useState<File | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!email) {
      router.replace("/temple-admin/signin");
      return;
    }
    if (!isTempleOnboardingTempleCreated()) {
      router.replace("/temple-admin/temple-profile");
      return;
    }
    if (!isDeitySelectionComplete()) {
      router.replace("/temple-admin/deity-selection");
      return;
    }
    const draft = loadTempleOnboardingPlanDraft();
    if (!draft?.pricingPlanId) {
      router.replace("/temple-admin/choose-plan");
      return;
    }
    setPlanDraft(draft);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      setProgressLoading(true);
      const out = await fetchTempleOnboardingProgress();
      if (cancelled) return;
      if (out.ok) {
        setOnboardingProgress(out.progress);
      }
      setProgressLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || !planDraft?.pricingPlanId) return;
    const id = planDraft.pricingPlanId;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/pricing-plans", { cache: "no-store" });
        const json = (await res.json().catch(() => null)) as { success?: boolean; data?: ApiPricingPlan[] };
        if (cancelled) return;
        if (res.ok && json.success && Array.isArray(json.data)) {
          setCatalogPlans(json.data);
          return;
        }
        const one = await fetch(`/api/pricing-plans/${encodeURIComponent(id)}`, { cache: "no-store" });
        const j2 = (await one.json().catch(() => null)) as { success?: boolean; data?: ApiPricingPlan };
        if (cancelled || !one.ok || !j2.success || !j2.data) return;
        setCatalogPlans([j2.data]);
      } catch {
        /* summary uses planName from session draft */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, planDraft?.pricingPlanId]);

  useEffect(() => {
    if (!modalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [modalOpen]);

  const plan = planDraft?.pricingPlanId
    ? getPlanByIdFromList(catalogPlans, planDraft.pricingPlanId)
    : undefined;
  const billingLabel = planDraft?.billing === "monthly" ? "Monthly" : "Annually";
  const billingPeriodLabel = useMemo(() => {
    if (!planDraft) return "—";
    const start = new Date();
    const end = new Date(start);
    if (planDraft.billing === "monthly") {
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
    }
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    return `${fmt(start)} - ${fmt(end)}`;
  }, [planDraft]);

  const trialEnd = useMemo(() => {
    const iso = onboardingProgress?.trialEndsAt?.trim();
    if (iso) {
      const parsed = new Date(iso);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const d = new Date();
    d.setDate(d.getDate() + TEMPLE_ONBOARDING_TRIAL_DAYS);
    return d;
  }, [onboardingProgress?.trialEndsAt]);

  const trialEndLabel = useMemo(() => {
    return trialEnd.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [trialEnd]);

  const showTrialAcknowledge =
    Boolean(onboardingProgress?.isInTrial) && !onboardingProgress?.hasPayableInvoice;

  const afterTrialPrice = useMemo(() => {
    if (!plan || !planDraft) return "—";
    const perMoCents =
      planDraft.billing === "monthly"
        ? plan.priceMonthly
        : effectiveMonthlyFromYearlyCents(plan.priceYearly);
    return `${formatUsdFromCents(perMoCents)} / month`;
  }, [plan, planDraft]);

  const planDisplayName = plan
    ? `${plan.name} plan`
    : planDraft?.planName
      ? `${planDraft.planName} plan`
      : "—";

  const amountDueLabel = useMemo(() => {
    if (!plan || !planDraft) return "—";
    const cents = planDraft.billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
    return formatUsdFromCents(cents);
  }, [plan, planDraft]);

  const amountDueCents = useMemo(() => {
    if (!plan || !planDraft) return 0;
    return planDraft.billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
  }, [plan, planDraft]);

  const savingsPerMonthLabel = useMemo(() => {
    if (!plan || !planDraft) return null;
    if (planDraft.billing !== "annual") return null;
    const perMoFromAnnual = effectiveMonthlyFromYearlyCents(plan.priceYearly);
    const savingsCents = Math.max(0, plan.priceMonthly - perMoFromAnnual);
    if (savingsCents <= 0) return null;
    return `You save ${formatUsdFromCents(savingsCents)} monthly`;
  }, [plan, planDraft]);

  const paymentReference = useMemo(() => {
    const created = loadTempleOnboardingTempleCreatedResponse();
    const draft = loadTempleOnboardingTempleProfileDraft();
    const name = (draft?.templeName ?? "").trim() || "TEMPLE";
    const id = created?.templeId ? String(created.templeId) : "0000";
    return normalizePaymentReference(`${name}-INV-${id}`);
  }, []);

  const openModal = () => {
    if (!amountDollars) {
      setAmountDollars((amountDueCents / 100).toFixed(2));
    }
    setTransferredDate(todayIsoDate());
    setCurrency("USD");
    setNotes("");
    setSlipFile(null);
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
  };

  const onPickSlip = (file: File | null) => {
    setModalError(null);
    if (!file) {
      setSlipFile(null);
      return;
    }
    if (!ALLOWED_UPLOAD_MIME.has(file.type)) {
      setModalError("Unsupported file type. Please upload PDF, PNG, JPG, SVG, or GIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setModalError("File is too large. Max size is 10 MB.");
      return;
    }
    setSlipFile(file);
  };

  const handleTrialAcknowledge = async () => {
    const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY)?.trim();
    if (!sessionEmail) {
      router.replace("/temple-admin/signin");
      return;
    }
    const created = loadTempleOnboardingTempleCreatedResponse();
    if (!created?.templeId) {
      setSubmitError("Temple setup is incomplete. Please finish the previous steps first.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const out = await submitTemplePaymentOnboarding({
        sessionEmail,
        templeId: created.templeId,
        saveCardPreferred: false,
      });
      if (out.ok === false) {
        setSubmitError(out.message);
        return;
      }
      saveTempleOnboardingPaymentComplete(false);
      router.push("/temple-admin/onboarding-complete");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSubmit = async () => {
    const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY)?.trim();
    if (!sessionEmail) {
      router.replace("/temple-admin/signin");
      return;
    }
    const created = loadTempleOnboardingTempleCreatedResponse();
    if (!created?.templeId) {
      setModalError("Temple setup is incomplete. Please finish the previous steps first.");
      return;
    }

    const amt = Number(amountDollars);
    if (!Number.isFinite(amt) || amt <= 0) {
      setModalError("Enter a valid amount transferred.");
      return;
    }
    if (!transferredDate.trim()) {
      setModalError("Transferred date is required.");
      return;
    }
    if (!slipFile) {
      setModalError("Please upload the bank transfer slip.");
      return;
    }

    setModalError(null);
    setIsSubmitting(true);
    try {
      const out = await submitTempleBankTransferNotification({
        sessionEmail,
        templeId: created.templeId,
        paymentRef: paymentReference,
        amountCents: Math.round(amt * 100),
        currency,
        transferredDate,
        notes: notes.trim() || undefined,
        slipFile,
      });
      if (!out.ok) {
        setModalError("Failed to submit payment. Please try again.");
        return;
      }
      setModalOpen(false);
      saveTempleOnboardingPaymentComplete(false);
      router.push("/temple-admin/onboarding-complete");
    } catch {
      setModalError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready || !planDraft?.pricingPlanId || progressLoading) {
    return <PaymentPageSkeleton />;
  }

  if (showTrialAcknowledge) {
    const invNum = onboardingProgress?.trialProformaInvoiceNumber?.trim();
    return (
      <div className="relative w-full max-w-3xl">
        <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-10">
          <header className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Your trial is active
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
              No payment is due during your {TEMPLE_ONBOARDING_TRIAL_DAYS}-day trial. A $0.00 pro-forma invoice was sent
              to your email{invNum ? ` (${invNum})` : ""}. You do not need to upload a bank transfer slip now.
            </p>
          </header>

          <dl className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-5 text-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-muted)]">Amount due today</dt>
              <dd className="font-bold text-emerald-700 dark:text-emerald-300">$0.00</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-muted)]">Trial ends</dt>
              <dd className="font-medium text-[var(--text-primary)]">{trialEndLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--text-muted)]">After trial</dt>
              <dd className="font-medium text-[var(--text-primary)]">{afterTrialPrice}</dd>
            </div>
          </dl>

          {submitError ? (
            <div
              role="alert"
              className="mx-auto mt-6 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            >
              {submitError}
            </div>
          ) : null}

          <TempleOnboardingStepActions
            className="mt-10"
            onBack={() => router.push("/temple-admin/choose-plan")}
            showBackIcon
            primary={
              <button
                type="button"
                onClick={() => void handleTrialAcknowledge()}
                disabled={isSubmitting}
                className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? "Continuing…" : "Continue"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl">
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-32 w-32 overflow-hidden rounded-tl-3xl">
        <div className="absolute -left-8 -top-12 h-40 w-40 rounded-full border-2 border-[var(--brand-primary)]/25" />
        <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full border border-[var(--brand-primary)]/20" />
      </div>

      <div className="relative z-10 rounded-3xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-10">
        <header className="text-center lg:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Complete your payment
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] lg:mx-0">
            Transfer the amount below to activate your temple portal. We’ll confirm within 1–2 business days.
          </p>
        </header>

        {submitError ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          >
            {submitError}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-orange-200/70 bg-orange-50/50 px-5 py-4 text-sm dark:border-orange-900/40 dark:bg-orange-950/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                {plan ? plan.name : planDraft?.planName ?? "—"} Plan
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {billingLabel} Subscription • Billed {planDraft?.billing === "monthly" ? "Monthly" : "Yearly"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[var(--text-primary)]">{amountDueLabel}{planDraft?.billing === "monthly" ? "/month" : "/year"}</p>
              {savingsPerMonthLabel ? (
                <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">• {savingsPerMonthLabel}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section aria-labelledby="bank-details-heading">
            <div className="overflow-hidden rounded-2xl border border-blue-200/60 bg-blue-50/40 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/15">
              <div className="border-b border-blue-200/60 bg-blue-50/70 px-5 py-4 dark:border-blue-900/40 dark:bg-blue-950/25">
                <h2 id="bank-details-heading" className="text-base font-semibold text-[var(--text-primary)]">
                  Bank Transfer Details
                </h2>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">Transfer the exact amount to the account below</p>
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-300" aria-hidden />
                  <span>{BANK_DETAILS.header}</span>
                </div>
              </div>

              <dl className="divide-y divide-blue-100/60 text-sm dark:divide-blue-900/30">
                {BANK_DETAILS.fields.map((f) => (
                  <div
                    key={f.label}
                    className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[180px_1fr_auto] sm:items-center"
                  >
                    <dt className="text-[var(--text-muted)]">{f.label}</dt>
                    <dd className="font-medium text-[var(--text-primary)]">{f.value}</dd>
                    <div className="sm:justify-self-end">
                      <CopyButton value={f.value} ariaLabel={`Copy ${f.label}`} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[180px_1fr_auto] sm:items-center">
                  <dt className="text-[var(--text-muted)]">Amount to Transfer</dt>
                  <dd className="font-semibold text-[var(--brand-primary)]">{amountDueLabel}</dd>
                  <div className="sm:justify-self-end">
                    <CopyButton value={amountDueLabel} ariaLabel="Copy amount to transfer" />
                  </div>
                </div>
              </dl>

              <div className="p-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">Payment reference:</p>
                      <p className="mt-1 font-mono text-[13px]">{paymentReference}</p>
                      <p className="mt-2 text-xs opacity-80">
                        Include this reference in your transfer so we can identify your payment.
                      </p>
                    </div>
                    <CopyButton value={paymentReference} ariaLabel="Copy payment reference" />
                  </div>
                </div>

                <ol className="mt-4 space-y-2 rounded-2xl border border-blue-200/60 bg-white/60 px-5 py-4 text-sm text-[var(--text-primary)] dark:border-blue-900/40 dark:bg-zinc-900/40">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-xs font-semibold text-[var(--brand-primary)]">
                      1
                    </span>
                    <span>Log in to your bank and initiate a transfer to the account above.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-xs font-semibold text-[var(--brand-primary)]">
                      2
                    </span>
                    <span>
                      Enter <span className="font-mono">{paymentReference}</span> as the payment reference / remarks.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-xs font-semibold text-[var(--brand-primary)]">
                      3
                    </span>
                    <span>
                      Transfer exactly{" "}
                      <span className="font-semibold text-[var(--brand-primary)]">{amountDueLabel}</span> — other amounts
                      may be rejected.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-xs font-semibold text-[var(--brand-primary)]">
                      4
                    </span>
                    <span>Click “I’ve Completed the Transfer” below and upload your payment slip.</span>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <aside
            className="rounded-2xl bg-zinc-100/90 p-6 dark:bg-zinc-800/60"
            aria-labelledby="order-summary-heading"
          >
            <h2 id="order-summary-heading" className="text-lg font-semibold text-[var(--text-primary)]">
              Order Summary
            </h2>
            <p className="text-sm text-[var(--text-muted)]">Review your order detail before start</p>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Plan</dt>
                <dd className="font-medium text-[var(--text-primary)]">{planDisplayName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Billing period</dt>
                <dd className="font-medium text-[var(--text-primary)]">{billingPeriodLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Subtotal</dt>
                <dd className="font-medium text-[var(--text-primary)]">{amountDueLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Tax</dt>
                <dd className="font-medium text-[var(--text-primary)]">{formatUsdFromCents(0)}</dd>
              </div>
              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-600">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-muted)]">Total Due</dt>
                  <dd className="text-lg font-bold text-[var(--brand-primary)]">{amountDueLabel}</dd>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Trial Ends</dt>
                <dd className="text-right font-medium text-[var(--text-primary)]">
                  {trialEndLabel}{" "}
                  <span className="whitespace-nowrap text-[var(--text-muted)]">
                    ({TEMPLE_ONBOARDING_TRIAL_DAYS} days)
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">After Trial:</dt>
                <dd className="text-lg font-bold text-blue-600 dark:text-blue-400">{afterTrialPrice}</dd>
              </div>
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-[var(--text-muted)]">
              Cancel before your trial ends and you will not be charged anything.
            </p>
          </aside>
        </div>

        <TempleOnboardingStepActions
          className="mt-10"
          onBack={() => router.push("/temple-admin/choose-plan")}
          showBackIcon
          primary={
            <button
              type="button"
              onClick={openModal}
              disabled={isSubmitting}
              className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                "Processing…"
              ) : (
                <>
                  I’ve Completed the Transfer
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          }
        />

        {modalOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            tabIndex={-1}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeModal();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Confirm Payment Submission"
              className="flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Confirm Payment Submission</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Upload your bank transfer slip so we can verify faster. The reference number below is pre-filled from
                    your invoice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  disabled={isSubmitting}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {modalError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                    {modalError}
                  </div>
                ) : null}

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Payment Ref No <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={paymentReference}
                    readOnly
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Auto-filled from invoice.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Amount Transferred <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                      <span className="text-sm text-zinc-500">$</span>
                      <input
                        inputMode="decimal"
                        value={amountDollars}
                        onChange={(e) => setAmountDollars(e.target.value)}
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
                        placeholder={(amountDueCents / 100).toFixed(2)}
                      />
                      <SelectInput
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        wrapperClassName="!w-auto shrink-0"
                        className="!h-8 !min-w-[3.5rem] !rounded-lg !border-zinc-200 !bg-zinc-50 !py-0 !pl-2 !pr-10 !text-xs !font-semibold !text-zinc-700 dark:!border-zinc-700 dark:!bg-zinc-800 dark:!text-zinc-200"
                      >
                        <option value="USD">USD</option>
                      </SelectInput>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Auto-filled from invoices.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Transferred Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <input
                      type="date"
                      value={transferredDate}
                      onChange={(e) => setTransferredDate(e.target.value)}
                      className="min-w-0 flex-1 border-0 bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
                    />
                    <Calendar className="h-4 w-4 text-zinc-400" aria-hidden />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Upload Bank Transfer Slip <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) onPickSlip(f);
                    }}
                    className="mt-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center dark:border-zinc-700 dark:bg-zinc-800/40"
                  >
                    <UploadCloud className="h-5 w-5 text-zinc-500" aria-hidden />
                    <div className="text-xs">
                      <label className="cursor-pointer font-semibold text-[var(--brand-primary)] hover:underline">
                        Click to upload
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.gif,.svg"
                          onChange={(e) => onPickSlip(e.target.files?.[0] ?? null)}
                          disabled={isSubmitting}
                        />
                      </label>{" "}
                      <span className="text-zinc-500 dark:text-zinc-400">or drag and drop</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">SVG, PNG, JPG, GIF or PDF (max. 10MB)</p>
                    {slipFile ? (
                      <div className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-xs dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate font-medium">{slipFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setSlipFile(null)}
                            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            aria-label="Remove file"
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Additional Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. transferred from trustee account, bank reference#112345."
                    className="mt-1 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleModalSubmit}
                  className="w-1/2 rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting…" : "Submit & Notify Omkaarya Team"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
