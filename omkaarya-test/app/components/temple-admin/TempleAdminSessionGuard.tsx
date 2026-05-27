"use client";

import { Loader2 } from "lucide-react";
import { useTempleAdminSessionGuard } from "@/lib/use-temple-admin-session-guard";

export function TempleAdminSessionGuard({ children }: { children: React.ReactNode }) {
  const { sessionReady } = useTempleAdminSessionGuard();

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
