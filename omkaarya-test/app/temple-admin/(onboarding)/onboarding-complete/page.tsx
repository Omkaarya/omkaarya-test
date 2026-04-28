"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, FileText, MessageCircle, PlayCircle } from "lucide-react";
import { ONBOARDING_PENDING_NEXT_STEPS } from "@/lib/onboarding-complete-tasks";
import { loadTempleOnboardingPaymentStatus } from "@/lib/temple-onboarding-payment";
import {
  loadTempleOnboardingPlanDraft,
  TEMPLE_ONBOARDING_TRIAL_DAYS,
} from "@/lib/temple-onboarding-plan";
import {
  loadTempleAdminProfileDraft,
  TEMPLE_ONBOARDING_EMAIL_KEY,
  TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY,
} from "@/lib/temple-onboarding-signin";
import { submitTempleOnboardingComplete } from "@/lib/temple-onboarding-complete-api";
import {
  isTempleOnboardingTempleCreated,
  loadTempleOnboardingTempleCreatedResponse,
  loadTempleOnboardingTempleProfileDraft,
} from "@/lib/temple-onboarding-temple-profile";

function firstNameFromFullName(fullName: string | undefined): string {
  const t = fullName?.trim();
  if (!t) return "there";
  return t.split(/\s+/)[0] ?? "there";
}

function OnboardingCompleteSkeleton() {
  return (
    <div
      className="relative w-full max-w-4xl rounded-3xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-10"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="pointer-events-none absolute left-6 top-6 h-24 w-24 rounded-full border border-zinc-200/80 dark:border-zinc-600/50" />
      <div className="pointer-events-none absolute left-10 top-10 h-16 w-16 rounded-full border border-zinc-200/60 dark:border-zinc-600/40" />
      <div className="relative z-10 space-y-3 pt-4">
        <div className="h-9 w-4/5 max-w-md animate-pulse rounded-lg bg-[var(--surface-elevated)]" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-[var(--surface-elevated)]" />
      </div>
      <div className="relative z-10 mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-[var(--surface-elevated)]" />
        ))}
      </div>
      <div className="relative z-10 mt-10 h-12 w-full max-w-xs animate-pulse self-end rounded-xl bg-[var(--surface-elevated)] sm:ml-auto" />
    </div>
  );
}

export default function TempleAdminOnboardingCompletePage() {
  const router = useRouter();
  const wasReturningLoginUser = useRef(false);
  const [ready, setReady] = useState(false);
  const [firstName, setFirstName] = useState("there");
  const [templeName, setTempleName] = useState("Your temple");
  const [planLine, setPlanLine] = useState("Your plan · No charge until trial ends");

  useEffect(() => {
    const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!email) {
      router.replace("/temple-admin/signin");
      return;
    }

    const returningLogin = sessionStorage.getItem(TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY) === "1";
    wasReturningLoginUser.current = returningLogin;
    if (!returningLogin) {
      if (!isTempleOnboardingTempleCreated()) {
        router.replace("/temple-admin/temple-profile");
        return;
      }
      if (!loadTempleOnboardingPaymentStatus()) {
        router.replace("/temple-admin/payment");
        return;
      }
    } else {
      sessionStorage.removeItem(TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY);
    }

    const admin = loadTempleAdminProfileDraft();
    setFirstName(firstNameFromFullName(admin?.fullName));

    const temple = loadTempleOnboardingTempleProfileDraft();
    const tn = temple?.templeName?.trim();
    if (tn) setTempleName(tn);

    const planDraft = loadTempleOnboardingPlanDraft();
    setReady(true);

    const billingLabel = planDraft?.billing === "monthly" ? "Monthly" : "Annual";
    void (async () => {
      let label = planDraft?.planName?.trim() || "";
      if (planDraft?.pricingPlanId) {
        try {
          const res = await fetch("/api/pricing-plans", { cache: "no-store" });
          const json = (await res.json().catch(() => null)) as {
            success?: boolean;
            data?: { id: string; name: string }[];
          };
          if (res.ok && json.success && Array.isArray(json.data)) {
            const p = json.data.find((x) => x.id === planDraft.pricingPlanId);
            if (p?.name) label = p.name;
          } else {
            const one = await fetch(`/api/pricing-plans/${encodeURIComponent(planDraft.pricingPlanId)}`, {
              cache: "no-store",
            });
            const j2 = (await one.json().catch(() => null)) as { success?: boolean; data?: { name?: string } };
            if (one.ok && j2.success && j2.data?.name) label = j2.data.name;
          }
        } catch {
          /* use planName */
        }
      }
      if (label) {
        setPlanLine(`${label} plan · ${billingLabel} · No charge until trial ends`);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!ready || wasReturningLoginUser.current) return;

    const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY)?.trim();
    const created = loadTempleOnboardingTempleCreatedResponse();
    if (!sessionEmail || !created?.templeId) return;

    let cancelled = false;
    void (async () => {
      const res = await submitTempleOnboardingComplete({
        sessionEmail,
        templeId: created.templeId,
      });
      if (!cancelled && !res.ok) {
        console.warn("Onboarding completion API:", "message" in res ? res.message : "Unknown error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready) {
    return <OnboardingCompleteSkeleton />;
  }

  return (
    <div className="relative w-full max-w-4xl">
      <div className="relative z-10 overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-10">
        <div className="pointer-events-none absolute left-4 top-4 h-28 w-28 rounded-full border border-zinc-200/70 dark:border-zinc-600/40 sm:left-6 sm:top-6" />
        <div className="pointer-events-none absolute left-8 top-8 h-[4.5rem] w-[4.5rem] rounded-full border border-zinc-200/50 dark:border-zinc-600/30 sm:left-10 sm:top-10" />

        <header className="relative z-10 pt-2 text-center sm:pt-4 sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            You&apos;re all set, {firstName}!
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:mx-0">
            {templeName} is now live on OmKaarya. Complete these steps to make the most of your first week.
          </p>
        </header>

        <ul className="relative z-10 mt-8 list-none space-y-3 p-0" aria-label="Setup progress">
          <li className="flex flex-col gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">Temple profile complete</p>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">Name, deity, address and logo saved</p>
              </div>
            </div>
            <span className="shrink-0 self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100 sm:self-center">
              Completed
            </span>
          </li>

          <li className="flex flex-col gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">
                  Plan activated — {TEMPLE_ONBOARDING_TRIAL_DAYS}-day trial started
                </p>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">{planLine}</p>
              </div>
            </div>
            <span className="shrink-0 self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100 sm:self-center">
              Completed
            </span>
          </li>

          {ONBOARDING_PENDING_NEXT_STEPS.map((step) => (
            <li
              key={step.stepNumber}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-zinc-50/90 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-50 text-sm font-bold text-[var(--brand-primary)] dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300">
                  {step.stepNumber}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{step.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">{step.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 self-start rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] transition-colors hover:bg-orange-200/80 dark:bg-orange-950/60 dark:text-orange-300 dark:hover:bg-orange-900/50 sm:self-center"
                title="Coming soon"
                aria-describedby={`pending-hint-${step.stepNumber}`}
              >
                Go -&gt;
              </button>
              <span id={`pending-hint-${step.stepNumber}`} className="sr-only">
                This step is coming soon.
              </span>
            </li>
          ))}
        </ul>

        <div className="relative z-10 mt-10 border-t border-[var(--border-default)] pt-8">
          <div className="flex flex-col gap-6">
            {/* Primary: no dedicated temple dashboard route yet — home is the app entry */}
            <div className="flex w-full justify-end">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] sm:w-auto sm:min-w-[14rem]"
              >
                Go to my dashboard
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <p className="w-full text-center text-sm text-[var(--text-muted)]">Need help getting started?</p>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                title="Coming soon"
              >
                <FileText className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
                View Documentation
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                title="Coming soon"
              >
                <PlayCircle className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
                Watch Tutorials
              </button>
              <a
                href="mailto:support@omkaarya.com?subject=Getting%20started%20help"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
