"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/app/components/ds/atoms/Button";
import { useTempleOnboardingGuard } from "@/lib/temple-onboarding-routing";

type StepKey =
  | "setPassword"
  | "adminProfile"
  | "templeProfile"
  | "deitySelection"
  | "choosePlan"
  | "payment"
  | "complete";

type TempleOnboardingGuardedPageProps = {
  step: StepKey;
  children: ReactNode;
  afterLogin?: boolean;
  continueProfileSteps?: boolean;
};

export function TempleOnboardingGuardedPage({
  step,
  children,
  afterLogin,
  continueProfileSteps,
}: TempleOnboardingGuardedPageProps) {
  const { ready, guardError, retryGuard } = useTempleOnboardingGuard(step, {
    afterLogin,
    continueProfileSteps,
  });

  if (guardError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm text-[var(--text-muted)]">{guardError}</p>
        <Button variant="primary" onClick={retryGuard}>
          Try again
        </Button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading onboarding step"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  return <>{children}</>;
}
