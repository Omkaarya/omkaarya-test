"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getTempleSessionProfileAction } from "@/app/actions/onboarding";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { isDeitySelectionComplete, loadTempleOnboardingDeityDraft } from "@/lib/temple-onboarding-deity";
import { saveTempleOnboardingPaymentComplete } from "@/lib/temple-onboarding-payment";
import {
  isTempleOnboardingAdminProfileSeen,
  TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY,
} from "@/lib/temple-onboarding-signin";
import {
  isTempleOnboardingTempleCreated,
  loadTempleOnboardingTempleCreatedResponse,
} from "@/lib/temple-onboarding-temple-profile";

export type TempleOnboardingProgress = {
  needsPasswordChange: boolean;
  hasPlanSelected: boolean;
  hasPaymentCompleted: boolean;
  hasTempleProfileDetailsSaved: boolean;
  hasDeitySelectionComplete: boolean;
  hasOnboardingCompleted: boolean;
  templeId: string;
};

export type ResolveOnboardingPathOptions = {
  /** User still on temp password (login `firstLogin`). */
  firstLogin?: boolean;
  /** After sign-in for a returning user — skip profile steps when payment is done. */
  afterLogin?: boolean;
  /** Force profile funnel after payment in the same session (not returning login). */
  continueProfileSteps?: boolean;
};

function isReturningTempleLogin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY) === "1";
}

const ONBOARDING_PATHS = {
  signin: "/temple-admin/signin",
  setPassword: "/temple-admin/set-password",
  choosePlan: "/temple-admin/choose-plan",
  payment: "/temple-admin/payment",
  adminProfile: "/temple-admin/admin-profile",
  templeProfile: "/temple-admin/temple-profile",
  deitySelection: "/temple-admin/deity-selection",
  complete: "/temple-admin/onboarding-complete",
} as const;

export type TempleOnboardingRoutePath = (typeof ONBOARDING_PATHS)[keyof typeof ONBOARDING_PATHS];

export function pathnameToOnboardingStep(pathname: string | null): keyof typeof ONBOARDING_PATHS | null {
  if (!pathname) return null;
  if (pathname.includes("/signin")) return "signin";
  if (pathname.includes("/set-password")) return "setPassword";
  if (pathname.includes("/choose-plan")) return "choosePlan";
  if (pathname.includes("/payment")) return "payment";
  if (pathname.includes("/admin-profile")) return "adminProfile";
  if (pathname.includes("/temple-profile")) return "templeProfile";
  if (pathname.includes("/deity-selection")) return "deitySelection";
  if (pathname.includes("/onboarding-complete")) return "complete";
  return null;
}

export async function fetchTempleOnboardingProgress(): Promise<
  { ok: true; progress: TempleOnboardingProgress } | { ok: false; message: string }
> {
  try {
    const res = await fetch("/api/temple-admin/onboarding-progress", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      return { ok: false, message: jsonApiErrorMessage(data) || "Could not load onboarding progress." };
    }
    const envelope = data as { success?: boolean; data?: TempleOnboardingProgress };
    if (!envelope.success || !envelope.data?.templeId) {
      return { ok: false, message: "Invalid onboarding progress response." };
    }
    const p = envelope.data;
    if (p.hasPaymentCompleted) {
      saveTempleOnboardingPaymentComplete(false);
    }
    return { ok: true, progress: p };
  } catch {
    return { ok: false, message: "Network error while loading onboarding progress." };
  }
}

/** Resolves the next onboarding href the user should be on. */
export function resolveTempleOnboardingPath(
  progress: TempleOnboardingProgress,
  options?: ResolveOnboardingPathOptions,
): TempleOnboardingRoutePath {
  if (options?.firstLogin || progress.needsPasswordChange) {
    return ONBOARDING_PATHS.setPassword;
  }
  if (!progress.hasPlanSelected) {
    return ONBOARDING_PATHS.choosePlan;
  }
  if (!progress.hasPaymentCompleted) {
    return ONBOARDING_PATHS.payment;
  }

  if (options?.afterLogin && !options.continueProfileSteps) {
    return ONBOARDING_PATHS.complete;
  }

  if (progress.hasPaymentCompleted && isReturningTempleLogin()) {
    return ONBOARDING_PATHS.complete;
  }

  if (progress.hasOnboardingCompleted) {
    return ONBOARDING_PATHS.complete;
  }

  const deityDone =
    progress.hasDeitySelectionComplete ||
    isDeitySelectionComplete() ||
    Boolean(loadTempleOnboardingDeityDraft()?.completed);
  const templeProfileDone =
    progress.hasTempleProfileDetailsSaved || isTempleOnboardingTempleCreated();
  const adminProfileSeen = isTempleOnboardingAdminProfileSeen();

  if (deityDone && templeProfileDone) {
    return ONBOARDING_PATHS.complete;
  }
  if (templeProfileDone && !deityDone) {
    return ONBOARDING_PATHS.deitySelection;
  }
  if (adminProfileSeen && !templeProfileDone) {
    return ONBOARDING_PATHS.templeProfile;
  }

  return ONBOARDING_PATHS.adminProfile;
}

export function isOnboardingIncomplete(progress: TempleOnboardingProgress): boolean {
  const target = resolveTempleOnboardingPath(progress, { continueProfileSteps: true });
  return target !== ONBOARDING_PATHS.complete;
}

/** Whether the user should be redirected away from the operational dashboard. */
export function shouldBlockTempleDashboard(progress: TempleOnboardingProgress): boolean {
  return isOnboardingIncomplete(progress);
}

export async function resolveTempleTenantId(sessionEmail: string): Promise<string | null> {
  const created = loadTempleOnboardingTempleCreatedResponse();
  if (created?.templeId) return created.templeId;

  const res = await getTempleSessionProfileAction(sessionEmail);
  if (res.ok) return res.templeId;
  return null;
}

/**
 * Redirects when the user is on the wrong onboarding step (prevents URL skipping).
 */
export function useTempleOnboardingGuard(
  currentStep: keyof typeof ONBOARDING_PATHS,
  options?: { enabled?: boolean; afterLogin?: boolean; continueProfileSteps?: boolean },
): { ready: boolean } {
  const router = useRouter();
  const pathname = usePathname();
  const checkedRef = useRef(false);
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled || currentStep === "signin") return;
    if (checkedRef.current && currentStep !== "setPassword") return;

    let cancelled = false;

    void (async () => {
      const result = await fetchTempleOnboardingProgress();
      if (cancelled) return;
      if (!result.ok) {
        if (currentStep !== "setPassword") {
          router.replace(ONBOARDING_PATHS.signin);
        }
        return;
      }

      const target = resolveTempleOnboardingPath(result.progress, {
        afterLogin: options?.afterLogin,
        continueProfileSteps: options?.continueProfileSteps ?? currentStep !== "setPassword",
        firstLogin: currentStep === "setPassword" && result.progress.needsPasswordChange,
      });

      const here = pathnameToOnboardingStep(pathname);
      if (here && here !== currentStep) return;

      if (target !== ONBOARDING_PATHS[currentStep]) {
        router.replace(target);
        return;
      }

      checkedRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, currentStep, pathname, router, options?.afterLogin, options?.continueProfileSteps]);

  return { ready: true };
}

export { ONBOARDING_PATHS };
