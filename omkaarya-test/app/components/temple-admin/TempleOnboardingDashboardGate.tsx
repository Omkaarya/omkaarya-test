"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ds/atoms/Button";
import {
  fetchTempleOnboardingProgress,
  resolveTempleOnboardingPath,
  shouldBlockTempleDashboard,
} from "@/lib/temple-onboarding-routing";

/**
 * Redirects temple admins to the correct onboarding step when they open the dashboard
 * before finishing onboarding.
 */
export function TempleOnboardingDashboardGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    setGateError(null);
    setAllowed(false);

    const result = await fetchTempleOnboardingProgress();
    if (result.ok === false) {
      setGateError(result.message);
      return;
    }
    if (shouldBlockTempleDashboard(result.progress)) {
      const target = resolveTempleOnboardingPath(result.progress, { continueProfileSteps: true });
      router.replace(target);
      return;
    }
    setAllowed(true);
  }, [router]);

  useEffect(() => {
    void checkAccess();
  }, [checkAccess]);

  if (gateError) {
    return (
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm text-[var(--text-muted)]">{gateError}</p>
        <Button variant="primary" onClick={() => void checkAccess()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div
        className="flex min-h-[50vh] flex-1 items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Checking onboarding status"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  return <>{children}</>;
}
