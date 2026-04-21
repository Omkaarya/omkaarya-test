"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";
import {
  formatCardDigitsSpaced,
  formatExpiryInput,
  isCardholderNameValid,
  isExpiryNotPast,
  isValidCvv,
  luhnCheck,
  maskCardDisplay,
  normalizeCardDigits,
  normalizeCvv,
  parseExpiryDigits,
} from "@/lib/payment-card-validation";
import { submitTemplePaymentOnboarding } from "@/lib/temple-onboarding-payment-api";
import { saveTempleOnboardingPaymentComplete } from "@/lib/temple-onboarding-payment";
import {
  loadTempleOnboardingPlanDraft,
  TEMPLE_ONBOARDING_TRIAL_DAYS,
} from "@/lib/temple-onboarding-plan";
import { getTemplePlanById } from "@/lib/temple-pricing-plans";
import { TEMPLE_ONBOARDING_EMAIL_KEY } from "@/lib/temple-onboarding-signin";
import { isDeitySelectionComplete } from "@/lib/temple-onboarding-deity";
import {
  isTempleOnboardingTempleCreated,
  loadTempleOnboardingTempleCreatedResponse,
} from "@/lib/temple-onboarding-temple-profile";

function MastercardMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 24" width="40" height="24" aria-hidden>
      <circle cx="15" cy="12" r="10" fill="#EB001B" />
      <circle cx="25" cy="12" r="10" fill="#F79E1B" />
      <path
        d="M20 5.5a9.8 9.8 0 0 1 0 13 9.8 9.8 0 0 1 0-13z"
        fill="#FF5F00"
      />
    </svg>
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

  const [nameOnCard, setNameOnCard] = useState("");
  const [cardDigits, setCardDigits] = useState("");
  const [cardFocused, setCardFocused] = useState(false);
  const [expiryDigits, setExpiryDigits] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!draft?.planId) {
      router.replace("/temple-admin/choose-plan");
      return;
    }
    setPlanDraft(draft);
    setReady(true);
  }, [router]);

  const plan = planDraft?.planId ? getTemplePlanById(planDraft.planId) : undefined;
  const billingLabel = planDraft?.billing === "monthly" ? "Monthly" : "Annually";

  const trialEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + TEMPLE_ONBOARDING_TRIAL_DAYS);
    return d;
  }, []);

  const trialEndLabel = useMemo(() => {
    const y = trialEnd.getFullYear();
    const mon = trialEnd.toLocaleString("en", { month: "short" });
    const day = trialEnd.getDate();
    return `${y} ${mon} ${day}`;
  }, [trialEnd]);

  const afterTrialPrice = useMemo(() => {
    if (!plan || !planDraft) return "—";
    const n =
      planDraft.billing === "monthly" ? plan.priceMonthly : plan.priceAnnualPerMonth;
    return `$${n} / month`;
  }, [plan, planDraft]);

  const planDisplayName = plan ? `${plan.name} plan` : "—";

  const validation = useMemo(() => {
    const nameOk = isCardholderNameValid(nameOnCard);
    const cardOk = cardDigits.length >= 13 && cardDigits.length <= 19 && luhnCheck(cardDigits);
    const exp = parseExpiryDigits(expiryDigits);
    const expOk = Boolean(exp && isExpiryNotPast(exp));
    const cvvOk = isValidCvv(cvv, cardDigits.length);
    return { nameOk, cardOk, expOk, cvvOk, expParsed: exp };
  }, [nameOnCard, cardDigits, expiryDigits, cvv]);

  const formValid =
    validation.nameOk && validation.cardOk && validation.expOk && validation.cvvOk;

  const showErrors = (field: string) => Boolean(touched[field] || submitError);

  const cardDisplayValue = cardFocused
    ? formatCardDigitsSpaced(cardDigits)
    : cardDigits.length >= 13
      ? maskCardDisplay(cardDigits)
      : formatCardDigitsSpaced(cardDigits);

  const handleCardChange = (raw: string) => {
    setCardDigits(normalizeCardDigits(raw));
    setSubmitError(null);
  };

  const handleExpiryChange = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 6);
    setExpiryDigits(d);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setTouched({ name: true, card: true, expiry: true, cvv: true });
    if (!formValid) {
      const parts: string[] = [];
      if (!validation.nameOk) parts.push("Enter the name as it appears on the card.");
      if (!validation.cardOk) parts.push("Enter a valid card number.");
      if (!validation.expOk) parts.push("Enter a valid expiry date that is not in the past.");
      if (!validation.cvvOk) parts.push("Enter a valid security code.");
      setSubmitError(parts[0] ?? "Check your card details.");
      return;
    }

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
      const res = await submitTemplePaymentOnboarding({
        sessionEmail,
        templeId: created.templeId,
        saveCardPreferred: saveCard,
      });
      if (!res.ok) {
        setSubmitError(res.message);
        return;
      }
      saveTempleOnboardingPaymentComplete(saveCard);
      router.push("/temple-admin/onboarding-complete");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready || !planDraft?.planId || !plan) {
    return <PaymentPageSkeleton />;
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
            Add Payment Method
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] lg:mx-0">
            Your card is saved securely but will not be charged until your {TEMPLE_ONBOARDING_TRIAL_DAYS}-day free trial
            ends.
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

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <section className="order-2 space-y-6 lg:order-1" aria-labelledby="card-details-heading">
            <div>
              <h2 id="card-details-heading" className="text-lg font-semibold text-[var(--text-primary)]">
                Card Details
              </h2>
              <p className="text-sm text-[var(--text-muted)]">Enter card details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="payment-name" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Name on card
                </label>
                <input
                  id="payment-name"
                  name="nameOnCard"
                  type="text"
                  autoComplete="cc-name"
                  value={nameOnCard}
                  onChange={(e) => {
                    setNameOnCard(e.target.value);
                    setSubmitError(null);
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  aria-invalid={showErrors("name") && !validation.nameOk}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[var(--text-primary)] shadow-sm outline-none transition-[box-shadow,border-color] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="Rajan Pillai"
                />
                {showErrors("name") && !validation.nameOk ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">Enter the cardholder name.</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="payment-card" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Card number
                </label>
                <div
                  className={[
                    "flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm dark:bg-zinc-900",
                    showErrors("card") && !validation.cardOk
                      ? "border-red-400 focus-within:ring-2 focus-within:ring-red-200"
                      : "border-zinc-200 focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/20 dark:border-zinc-700",
                  ].join(" ")}
                >
                  <MastercardMark className="shrink-0 opacity-90" />
                  <input
                    id="payment-card"
                    name="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    readOnly={!cardFocused}
                    value={cardDisplayValue}
                    onFocus={() => setCardFocused(true)}
                    onBlur={() => {
                      setCardFocused(false);
                      setTouched((t) => ({ ...t, card: true }));
                    }}
                    onChange={(e) => handleCardChange(e.target.value)}
                    aria-invalid={showErrors("card") && !validation.cardOk}
                    className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-[var(--text-primary)] outline-none read-only:cursor-pointer"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                {showErrors("card") && !validation.cardOk ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">Enter a valid card number.</p>
                ) : (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Digits are validated in the browser only; your full number is not stored on our servers in this demo.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="payment-expiry" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    Expiry
                  </label>
                  <input
                    id="payment-expiry"
                    name="cc-exp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={formatExpiryInput(expiryDigits)}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, expiry: true }))}
                    placeholder="MM / YY"
                    aria-invalid={showErrors("expiry") && !validation.expOk}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[var(--text-primary)] shadow-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  {showErrors("expiry") && !validation.expOk ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">Valid future expiry required.</p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="payment-cvv" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    CVV
                  </label>
                  <input
                    id="payment-cvv"
                    name="cc-csc"
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cvv}
                    onChange={(e) => {
                      setCvv(normalizeCvv(e.target.value));
                      setSubmitError(null);
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, cvv: true }))}
                    maxLength={cardDigits.length === 15 ? 4 : 3}
                    placeholder="•••"
                    aria-invalid={showErrors("cvv") && !validation.cvvOk}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm tracking-widest text-[var(--text-primary)] shadow-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  {showErrors("cvv") && !validation.cvvOk ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      Enter the {cardDigits.length === 15 ? "4-digit" : "3-digit"} security code.
                    </p>
                  ) : null}
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <span>Save card details for future use</span>
              </label>

              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Your payment details are securely encrypted in transit when you use a real processor.</span>
              </div>
            </div>
          </section>

          <aside
            className="order-1 rounded-2xl bg-zinc-100/90 p-6 dark:bg-zinc-800/60 lg:order-2"
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
                <dt className="text-[var(--text-muted)]">Billing</dt>
                <dd className="font-medium text-[var(--text-primary)]">{billingLabel}</dd>
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
              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-600">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-muted)]">Due Today: (LKR)</dt>
                  <dd className="text-lg font-bold text-[var(--brand-primary)]">Rs. 0.00</dd>
                </div>
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
              onClick={handleSubmit}
              disabled={!formValid || isSubmitting}
              className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                "Processing…"
              ) : (
                <>
                  Confirm & Activate
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          }
        />
      </div>
    </div>
  );
}
