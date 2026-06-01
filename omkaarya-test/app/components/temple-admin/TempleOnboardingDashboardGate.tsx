"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await fetchTempleOnboardingProgress();
      if (cancelled) return;
      if (!result.ok) {
        setAllowed(true);
        return;
      }
      if (shouldBlockTempleDashboard(result.progress)) {
        const target = resolveTempleOnboardingPath(result.progress, { continueProfileSteps: true });
        router.replace(target);
        return;
      }
      setAllowed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

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
