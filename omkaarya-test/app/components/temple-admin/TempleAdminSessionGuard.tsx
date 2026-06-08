"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { useTempleAdminSessionGuard } from "@/lib/use-temple-admin-session-guard";

export function TempleAdminSessionGuard({ children }: { children: React.ReactNode }) {
  const { sessionReady, sessionError, retrySession } = useTempleAdminSessionGuard();

  if (sessionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--surface-page)] px-4 text-center">
        <p className="max-w-md text-sm text-[var(--text-muted)]">{sessionError}</p>
        <Button variant="primary" onClick={retrySession}>
          Try again
        </Button>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[var(--surface-page)]"
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
