"use client";

import { Loader2 } from "lucide-react";
import { useSuperAdminSessionGuard } from "@/lib/use-super-admin-session-guard";

export function SuperAdminSessionGuard({ children }: { children: React.ReactNode }) {
  const { sessionReady } = useSuperAdminSessionGuard();

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
