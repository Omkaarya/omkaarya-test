/** Selected plan during onboarding (session-only). */

import type { TemplePlanId } from "@/lib/temple-pricing-plans";

/** Shared across payment and completion copy (change in one place). */
export const TEMPLE_ONBOARDING_TRIAL_DAYS = 14;

export const TEMPLE_ONBOARDING_PLAN_DRAFT_KEY = "temple_onboarding_plan_draft";

export type TempleOnboardingPlanBilling = "monthly" | "annual";

export type TempleOnboardingPlanDraft = {
  planId: TemplePlanId | null;
  billing: TempleOnboardingPlanBilling;
  /** ISO string when user confirmed on choose-plan */
  confirmedAt?: string;
};

const defaultDraft: TempleOnboardingPlanDraft = {
  planId: null,
  billing: "annual",
};

export function loadTempleOnboardingPlanDraft(): TempleOnboardingPlanDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(TEMPLE_ONBOARDING_PLAN_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Partial<TempleOnboardingPlanDraft>;
    const billing = o.billing === "monthly" || o.billing === "annual" ? o.billing : "annual";
    const planId =
      o.planId === "basic" || o.planId === "business" || o.planId === "enterprise" ? o.planId : null;
    return {
      planId,
      billing,
      confirmedAt: typeof o.confirmedAt === "string" ? o.confirmedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function saveTempleOnboardingPlanDraft(next: Partial<TempleOnboardingPlanDraft>): void {
  if (typeof window === "undefined") return;
  const prev = loadTempleOnboardingPlanDraft() ?? { ...defaultDraft };
  const merged: TempleOnboardingPlanDraft = {
    ...prev,
    ...next,
    planId: next.planId !== undefined ? next.planId : prev.planId,
    billing: next.billing ?? prev.billing,
  };
  sessionStorage.setItem(TEMPLE_ONBOARDING_PLAN_DRAFT_KEY, JSON.stringify(merged));
}

export function clearTempleOnboardingPlanDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TEMPLE_ONBOARDING_PLAN_DRAFT_KEY);
}
