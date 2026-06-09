"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  isInTrial: boolean;
  hasPayableInvoice: boolean;
  trialEndsAt: string | null;
  trialProformaInvoiceNumber: string | null;
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

function profileStepsDone(progress: TempleOnboardingProgress): {
  adminProfileSeen: boolean;
  templeProfileDone: boolean;
  deityDone: boolean;
} {
  const deityDone =
    progress.hasDeitySelectionComplete ||
    isDeitySelectionComplete() ||
    Boolean(loadTempleOnboardingDeityDraft()?.completed);
  const templeProfileDone =
    progress.hasTempleProfileDetailsSaved || isTempleOnboardingTempleCreated();
  const adminProfileSeen = isTempleOnboardingAdminProfileSeen();
  return { adminProfileSeen, templeProfileDone, deityDone };
}

/** Resolves the next onboarding href the user should be on. */
export function resolveTempleOnboardingPath(
  progress: TempleOnboardingProgress,
  options?: ResolveOnboardingPathOptions,
): TempleOnboardingRoutePath {
  if (options?.firstLogin || progress.needsPasswordChange) {
    return ONBOARDING_PATHS.setPassword;
  }

  if (progress.hasOnboardingCompleted) {
    return ONBOARDING_PATHS.complete;
  }

  if (options?.afterLogin && !options.continueProfileSteps && progress.hasPaymentCompleted) {
    return ONBOARDING_PATHS.complete;
  }

  if (progress.hasPaymentCompleted && isReturningTempleLogin()) {
    return ONBOARDING_PATHS.complete;
  }

  const { adminProfileSeen, templeProfileDone, deityDone } = profileStepsDone(progress);

  if (!adminProfileSeen) {
    return ONBOARDING_PATHS.adminProfile;
  }
  if (!templeProfileDone) {
    return ONBOARDING_PATHS.templeProfile;
  }
  if (!deityDone) {
    return ONBOARDING_PATHS.deitySelection;
  }

  return ONBOARDING_PATHS.complete;
}

export function isOnboardingIncomplete(progress: TempleOnboardingProgress): boolean {
  if (progress.hasOnboardingCompleted) return false;
  return true;
}

/** Whether the user should be redirected away from the operational dashboard. */
export function shouldBlockTempleDashboard(progress: TempleOnboardingProgress): boolean {
  return !progress.hasOnboardingCompleted;
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
): { ready: boolean; guardError: string | null; retryGuard: () => void } {
  const router = useRouter();
  const pathname = usePathname();
  const checkedRef = useRef(false);
  const lastStepRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [guardError, setGuardError] = useState<string | null>(null);
  const enabled = options?.enabled ?? true;

  const runGuard = useCallback(async () => {
    if (!enabled || currentStep === "signin") {
      setReady(true);
      setGuardError(null);
      return;
    }

    setGuardError(null);
    setReady(false);

    const result = await fetchTempleOnboardingProgress();
    if (result.ok === false) {
      if (currentStep === "setPassword") {
        setReady(true);
        return;
      }
      setGuardError(result.message);
      return;
    }

    const target = resolveTempleOnboardingPath(result.progress, {
      afterLogin: options?.afterLogin,
      continueProfileSteps: options?.continueProfileSteps ?? currentStep !== "setPassword",
      firstLogin: currentStep === "setPassword" && result.progress.needsPasswordChange,
    });

    const here = pathnameToOnboardingStep(pathname);
    if (here && here !== currentStep) {
      setReady(true);
      return;
    }

    if (target !== ONBOARDING_PATHS[currentStep]) {
      router.replace(target);
      return;
    }

    checkedRef.current = true;
    setReady(true);
  }, [
    enabled,
    currentStep,
    pathname,
    router,
    options?.afterLogin,
    options?.continueProfileSteps,
  ]);

  useEffect(() => {
    if (lastStepRef.current !== currentStep) {
      checkedRef.current = false;
      lastStepRef.current = currentStep;
    }
    if (checkedRef.current) return;
    void runGuard();
  }, [runGuard, currentStep]);

  const retryGuard = useCallback(() => {
    checkedRef.current = false;
    void runGuard();
  }, [runGuard]);

  return { ready, guardError, retryGuard };
}

export { ONBOARDING_PATHS };
