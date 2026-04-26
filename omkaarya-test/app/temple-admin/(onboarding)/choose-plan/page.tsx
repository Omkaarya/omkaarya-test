"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DM_Serif_Display } from "next/font/google";
import { ArrowRight, Check, ChevronDown, ChevronUp, Layers2, Minus } from "lucide-react";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";
import { getDeityById } from "@/lib/deity-catalog";
import { isDeitySelectionComplete, loadTempleOnboardingDeityDraft } from "@/lib/temple-onboarding-deity";
import {
  loadTempleOnboardingPlanDraft,
  saveTempleOnboardingPlanDraft,
  TEMPLE_ONBOARDING_TRIAL_DAYS,
  type TempleOnboardingPlanBilling,
} from "@/lib/temple-onboarding-plan";
import {
  type ApiPricingPlan,
  formatUsdFromCents,
  effectiveMonthlyFromYearlyCents,
  isPricingPlanId,
} from "@/lib/temple-pricing-plans";
import { submitTemplePlanSelection } from "@/lib/temple-onboarding-plan-api";
import { getTempleSessionProfileAction } from "@/app/actions/onboarding";
import { TEMPLE_ONBOARDING_EMAIL_KEY } from "@/lib/temple-onboarding-signin";
import {
  isTempleOnboardingTempleCreated,
  loadTempleOnboardingTempleCreatedResponse,
  loadTempleOnboardingTempleProfileDraft,
} from "@/lib/temple-onboarding-temple-profile";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
});

type ComparisonPayload = {
  success?: boolean;
  data?: {
    plans: { id: string; name: string }[];
    features: {
      featureId: number;
      name: string;
      key: string;
      moduleKey: string;
      hasLimit: boolean;
      values: Record<string, { enabled: boolean; limit: number | null }>;
    }[];
  };
};

export default function TempleAdminChoosePlanPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [draft, setDraft] = useState<ReturnType<typeof loadTempleOnboardingTempleProfileDraft> | null>(null);
  const [deityDraft, setDeityDraft] = useState<ReturnType<typeof loadTempleOnboardingDeityDraft> | null>(null);
  const [missing, setMissing] = useState(false);
  const [plans, setPlans] = useState<ApiPricingPlan[]>([]);
  const [comparison, setComparison] = useState<ComparisonPayload["data"] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billing, setBilling] = useState<TempleOnboardingPlanBilling>("annual");
  const [setupOpen, setSetupOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  /** false until local plan draft (if any) is read, or server provisioning plan is fetched — avoids defaulting to “popular” before we know the temple’s plan. */
  const [planSelectionSourceReady, setPlanSelectionSourceReady] = useState(false);

  const loadCatalog = useCallback(async () => {
    setLoadError(null);
    try {
      const [prRes, cmpRes] = await Promise.all([
        fetch("/api/pricing-plans", { cache: "no-store" }),
        fetch("/api/pricing-plans/comparison", { cache: "no-store" }),
      ]);
      const prJson = (await prRes.json().catch(() => null)) as { success?: boolean; data?: ApiPricingPlan[] };
      if (!prRes.ok || !prJson.success || !Array.isArray(prJson.data)) {
        setLoadError("Could not load pricing plans.");
        return;
      }
      setPlans(prJson.data);
      const cmpJson = (await cmpRes.json().catch(() => null)) as ComparisonPayload;
      if (cmpRes.ok && cmpJson.success && cmpJson.data) {
        setComparison(cmpJson.data);
      }
    } catch {
      setLoadError("Network error while loading plans.");
    }
  }, []);

  useEffect(() => {
    const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!email) {
      router.replace("/temple-admin/signin");
      return;
    }

    if (isTempleOnboardingTempleCreated() && !isDeitySelectionComplete()) {
      router.replace("/temple-admin/deity-selection");
      return;
    }

    const loaded = loadTempleOnboardingTempleProfileDraft();
    if (!loaded) setMissing(true);
    setDraft(loaded);
    setDeityDraft(loadTempleOnboardingDeityDraft());

    const planDraft = loadTempleOnboardingPlanDraft();
    if (planDraft && (planDraft.billing === "monthly" || planDraft.billing === "annual")) {
      setBilling(planDraft.billing);
    }
    if (planDraft?.pricingPlanId && isPricingPlanId(planDraft.pricingPlanId)) {
      setSelectedPlanId(planDraft.pricingPlanId);
      setPlanSelectionSourceReady(true);
      setIsHydrated(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      const res = await getTempleSessionProfileAction(email);
      if (cancelled) return;
      if (
        res.ok &&
        res.provisioningPlan.pricingPlanId &&
        isPricingPlanId(res.provisioningPlan.pricingPlanId)
      ) {
        setSelectedPlanId(res.provisioningPlan.pricingPlanId);
        setBilling(res.provisioningPlan.billing);
      }
      setPlanSelectionSourceReady(true);
    })();

    setIsHydrated(true);
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!isHydrated) return;
    void loadCatalog();
  }, [isHydrated, loadCatalog]);

  useEffect(() => {
    if (!planSelectionSourceReady) return;
    if (plans.length > 0 && !selectedPlanId) {
      const def = plans.find((p) => p.popular)?.id ?? plans[0]!.id;
      setSelectedPlanId(def);
    }
  }, [planSelectionSourceReady, plans, selectedPlanId]);

  const selectedPlan = useMemo(
    () => (selectedPlanId ? plans.find((p) => p.id === selectedPlanId) : undefined),
    [plans, selectedPlanId]
  );

  useEffect(() => {
    if (!isHydrated) return;
    saveTempleOnboardingPlanDraft({
      pricingPlanId: selectedPlanId,
      planName: selectedPlan?.name ?? null,
      billing,
    });
  }, [isHydrated, selectedPlanId, selectedPlan, billing]);

  const slugPreview = useMemo(() => {
    const s = draft?.domainSubdomain?.trim?.() ?? "";
    return s || "temple_name";
  }, [draft]);

  const primaryDeityLabel = useMemo(() => {
    const id = deityDraft?.primaryDeityId;
    if (!id) return "—";
    const d = getDeityById(id);
    return d ? `${d.name}${d.secondaryLabel ? ` ${d.secondaryLabel}` : ""}` : id;
  }, [deityDraft]);

  const subDeityLabels = useMemo(() => {
    const ids = deityDraft?.subDeityIds ?? [];
    if (ids.length === 0) return "—";
    return ids.map((id) => getDeityById(id)?.name ?? id).join(", ");
  }, [deityDraft]);

  async function handleConfirm() {
    setConfirmError(null);
    if (!selectedPlanId) return;

    const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY)?.trim();
    if (!sessionEmail) {
      router.replace("/temple-admin/signin");
      return;
    }

    const created = loadTempleOnboardingTempleCreatedResponse();
    if (!created?.templeId) {
      setConfirmError("Temple setup is incomplete. Please finish the previous steps first.");
      return;
    }

    const confirmedAt = new Date().toISOString();
    setIsConfirming(true);
    try {
      const res = await submitTemplePlanSelection({
        sessionEmail,
        templeId: created.templeId,
        pricingPlanId: selectedPlanId,
        billing,
        confirmedAt,
      });
      if (!res.ok) {
        setConfirmError(res.message);
        return;
      }
      saveTempleOnboardingPlanDraft({
        pricingPlanId: selectedPlanId,
        planName: selectedPlan?.name ?? null,
        billing,
        confirmedAt,
      });
      router.push("/temple-admin/payment");
    } catch {
      setConfirmError("Network error. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  }

  if (!isHydrated) {
    return (
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-xl">
        <div className="animate-pulse bg-orange-50/50 p-8 dark:bg-orange-950/20" aria-busy="true">
          <div className="mx-auto h-6 w-32 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80" />
          <div className="mx-auto mt-6 h-10 w-[min(100%,28rem)] rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="mx-auto mt-4 h-4 w-[min(100%,20rem)] rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white/80 dark:bg-zinc-800/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-xl">
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-50/90 via-rose-50/40 to-white px-4 pb-12 pt-10 dark:from-orange-950/30 dark:via-rose-950/20 dark:to-[var(--surface-card)] sm:px-8 lg:px-10">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-[min(420px,70vw)] w-[min(520px,90vw)] -skew-x-12 rounded-[40%] bg-gradient-to-br from-[var(--brand-primary)]/25 via-orange-300/20 to-transparent dark:from-[var(--brand-primary)]/15"
          aria-hidden
        />
        <div className="relative z-[1] mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-orange-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)] dark:border-orange-800/50 dark:bg-zinc-900/60">
            Pricing plans
          </p>
          <h1
            className={`mt-4 text-3xl font-normal leading-tight text-[var(--brand-primary)] sm:text-4xl lg:text-[2.75rem] ${dmSerif.className}`}
          >
            Confirm your plan
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            Pick the tier that fits your temple. All plans include a {TEMPLE_ONBOARDING_TRIAL_DAYS}-day free trial.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300" id="billing-toggle-label">
              Annual pricing (save 20%)
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={billing === "annual"}
              aria-labelledby="billing-toggle-label"
              onClick={() => setBilling((b) => (b === "annual" ? "monthly" : "annual"))}
              className={[
                "relative h-8 w-14 shrink-0 rounded-full border-2 transition-colors",
                billing === "annual"
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]"
                  : "border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  billing === "annual" ? "left-0.5 translate-x-6" : "left-0.5",
                ].join(" ")}
                aria-hidden
              />
            </button>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">Currency:</span> USD
            </div>
          </div>
        </div>

        {loadError ? (
          <p
            className="relative z-[1] mx-auto mt-8 max-w-lg rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
            role="alert"
          >
            {loadError}
          </p>
        ) : null}

        <div className="relative z-[1] mx-auto mt-10 max-w-5xl">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {plans.map((plan) => {
              const selected = selectedPlanId === plan.id;
              const priceCents = billing === "annual" ? plan.priceYearly : plan.priceMonthly;
              const priceLabel =
                billing === "annual"
                  ? `${formatUsdFromCents(plan.priceYearly)} / yearly`
                  : `${formatUsdFromCents(plan.priceMonthly)} / monthly`;
              const perMo =
                billing === "annual" ? effectiveMonthlyFromYearlyCents(plan.priceYearly) : plan.priceMonthly;
              return (
                <div
                  key={plan.id}
                  className={[
                    "flex flex-col rounded-2xl border-2 bg-white p-6 shadow-lg dark:bg-zinc-900/80",
                    selected
                      ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20"
                      : "border-zinc-100 dark:border-zinc-800",
                  ].join(" ")}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/50">
                    <Layers2 className="h-6 w-6" aria-hidden />
                  </div>
                  {plan.popular ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                      Premium
                    </p>
                  ) : null}
                  <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h2>
                  <p className="min-h-10 text-xs text-zinc-500 dark:text-zinc-400">
                    {plan.description ?? " "}
                  </p>
                  <div className="mt-2">
                    <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {formatUsdFromCents(priceCents)}
                    </span>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {billing === "annual" ? " / yearly" : " / month"}
                    </span>
                  </div>
                  {billing === "annual" ? (
                    <p className="text-xs text-zinc-500">
                      {formatUsdFromCents(Math.round(perMo))} / month billed annually
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500">Billed monthly.</p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">{priceLabel}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {TEMPLE_ONBOARDING_TRIAL_DAYS}-Day Free Trial
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Onboarding &amp; setup: contact sales if needed</p>
                  <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {Array.isArray(plan.features) && plan.features.length > 0
                      ? plan.features.map((f) => (
                          <li key={f} className="flex gap-2">
                            <Check
                              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                              aria-hidden
                            />
                            <span>{f}</span>
                          </li>
                        ))
                      : null}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={[
                      "mt-6 w-full rounded-lg py-3 text-sm font-semibold transition-colors",
                      selected
                        ? "border-2 border-[var(--brand-primary)] bg-white text-[var(--brand-primary)] dark:bg-zinc-900"
                        : "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]",
                    ].join(" ")}
                  >
                    {selected ? "Selected" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {comparison && comparison.features.length > 0 && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-6 dark:border-zinc-800 dark:bg-zinc-900/20 sm:px-8">
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            className="mx-auto flex w-full max-w-4xl items-center justify-center gap-2 text-sm font-semibold text-[var(--brand-primary)]"
            aria-expanded={detailsOpen}
          >
            View full details
            {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {detailsOpen ? (
            <div className="mx-auto mt-4 max-w-5xl overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-2 pr-4 font-semibold">Feature</th>
                    {comparison.plans.map((p) => (
                      <th key={p.id} className="px-2 py-2 text-center font-semibold">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.features.map((row) => (
                    <tr
                      key={row.featureId}
                      className="border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{row.name}</td>
                      {comparison.plans.map((p) => {
                        const v = row.values[p.id];
                        const on = v?.enabled === true;
                        return (
                          <td key={p.id} className="px-2 py-2 text-center">
                            {on ? (
                              row.hasLimit && v?.limit != null ? (
                                <span className="tabular-nums text-zinc-800 dark:text-zinc-200">{v.limit}</span>
                              ) : (
                                <Check className="mx-auto h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                              )
                            ) : (
                              <Minus className="mx-auto h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      <div className="border-t border-zinc-100 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-[var(--surface-card)] sm:px-8">
        {selectedPlan ? (
          <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm text-emerald-700 dark:text-emerald-400">
            <Check className="h-5 w-5 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold">{selectedPlan.name}</span> selected — continue to add your
              payment details
            </span>
          </p>
        ) : loadError || plans.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)]">Unable to show plans. Try again later.</p>
        ) : (
          <p className="text-center text-sm text-[var(--text-muted)]">Select a plan to continue.</p>
        )}

        <div className="mx-auto mt-6 max-w-2xl">
          <button
            type="button"
            onClick={() => setSetupOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] dark:border-zinc-700 dark:bg-zinc-800/40"
            aria-expanded={setupOpen}
          >
            Your setup summary
            {setupOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
          </button>
          {setupOpen ? (
            <div className="mt-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700">
              {missing ? (
                <p className="text-[var(--text-muted)]">
                  Temple details were not found in the current session. You can go back and complete setup.
                </p>
              ) : (
                <dl className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--text-muted)]">Temple</dt>
                    <dd className="font-semibold text-[var(--text-primary)]">{draft?.templeName || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--text-muted)]">Microsite</dt>
                    <dd className="font-semibold text-[var(--brand-primary)]">{slugPreview}.omkaarya.com</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--text-muted)]">Primary deity</dt>
                    <dd className="text-right font-semibold text-[var(--text-primary)]">{primaryDeityLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--text-muted)]">Sub-deities</dt>
                    <dd className="max-w-[60%] text-right font-medium text-[var(--text-primary)]">
                      {subDeityLabels}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          ) : null}
        </div>

        {confirmError ? (
          <p
            role="alert"
            className="mx-auto mt-4 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
          >
            {confirmError}
          </p>
        ) : null}

        <TempleOnboardingStepActions
          className="mt-8"
          onBack={() => router.push("/temple-admin/deity-selection")}
          showBackIcon
          primary={
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={!selectedPlanId || isConfirming || !selectedPlan}
              className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
            >
              {isConfirming ? "Saving…" : "Confirm plan & proceed to payment"}
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
      </div>
    </div>
  );
}
