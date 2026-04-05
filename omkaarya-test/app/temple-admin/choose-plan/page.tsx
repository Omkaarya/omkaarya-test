"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DM_Serif_Display } from "next/font/google";
import { ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";
import { getDeityById } from "@/lib/deity-catalog";
import {
  isDeitySelectionComplete,
  loadTempleOnboardingDeityDraft,
} from "@/lib/temple-onboarding-deity";
import {
  loadTempleOnboardingPlanDraft,
  saveTempleOnboardingPlanDraft,
  type TempleOnboardingPlanBilling,
} from "@/lib/temple-onboarding-plan";
import {
  getTemplePlanById,
  TEMPLE_PRICING_PLANS,
  type TemplePlanId,
} from "@/lib/temple-pricing-plans";
import { TEMPLE_ONBOARDING_EMAIL_KEY } from "@/lib/temple-onboarding-signin";
import {
  isTempleOnboardingTempleCreated,
  loadTempleOnboardingTempleProfileDraft,
} from "@/lib/temple-onboarding-temple-profile";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
});

export default function TempleAdminChoosePlanPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [draft, setDraft] = useState<ReturnType<typeof loadTempleOnboardingTempleProfileDraft> | null>(null);
  const [deityDraft, setDeityDraft] = useState<ReturnType<typeof loadTempleOnboardingDeityDraft> | null>(null);
  const [missing, setMissing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<TemplePlanId | null>("business");
  const [billing, setBilling] = useState<TempleOnboardingPlanBilling>("annual");
  const [setupOpen, setSetupOpen] = useState(false);

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
    if (planDraft) {
      if (planDraft.planId) setSelectedPlanId(planDraft.planId);
      setBilling(planDraft.billing);
    }

    setIsHydrated(true);
  }, [router]);

  useEffect(() => {
    if (!isHydrated) return;
    saveTempleOnboardingPlanDraft({
      planId: selectedPlanId,
      billing,
    });
  }, [isHydrated, selectedPlanId, billing]);

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

  const selectedPlan = selectedPlanId ? getTemplePlanById(selectedPlanId) : undefined;

  function handleConfirm() {
    if (!selectedPlanId) return;
    saveTempleOnboardingPlanDraft({
      planId: selectedPlanId,
      billing,
      confirmedAt: new Date().toISOString(),
    });
    router.push("/temple-admin/payment");
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
            Choose a plan that fits your temple
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            All plans include a 7-day free trial. No credit card needed to start.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
          </div>
        </div>

        <div className="relative z-[1] mx-auto mt-10 max-w-5xl">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {TEMPLE_PRICING_PLANS.map((plan) => {
              const selected = selectedPlanId === plan.id;
              const price =
                billing === "annual" ? plan.priceAnnualPerMonth : plan.priceMonthly;
              const Icon = plan.Icon;
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
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h2>
                  <div className="mt-2">
                    <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                      ${price}
                    </span>
                    <span className="text-lg font-medium text-zinc-600 dark:text-zinc-400">/mth</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {billing === "annual" ? "Billed annually." : "Billed monthly."}
                  </p>
                  <ul className="mt-5 flex flex-1 flex-col gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                          aria-hidden
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    disabled={selected}
                    className={[
                      "mt-6 w-full rounded-lg py-3 text-sm font-semibold transition-colors",
                      selected
                        ? "cursor-default bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        : "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]",
                    ].join(" ")}
                  >
                    {selected ? "Selected" : "Get started"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-[var(--surface-card)] sm:px-8">
        {selectedPlan ? (
          <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm text-emerald-700 dark:text-emerald-400">
            <Check className="h-5 w-5 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold">{selectedPlan.name} Plan</span> selected, Continue to add your
              payment details
            </span>
          </p>
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

        <TempleOnboardingStepActions
          className="mt-8"
          onBack={() => router.push("/temple-admin/deity-selection")}
          showBackIcon
          primary={
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedPlanId}
              className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
            >
              Yes, Confirmed
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          }
        />
      </div>
    </div>
  );
}
