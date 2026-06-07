"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { useSuperAdminSessionGuard } from "@/lib/use-super-admin-session-guard";

export function SuperAdminSessionGuard({ children }: { children: React.ReactNode }) {
  const { sessionReady, sessionError, retrySession } = useSuperAdminSessionGuard();

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-zinc-950">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Could not verify your session</p>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">{sessionError}</p>
          <Button variant="primary" size="sm" className="mt-4 gap-2" onClick={retrySession}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950"
        role="status"
        aria-live="polite"
        aria-label="Verifying session"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  return <>{children}</>;
}
