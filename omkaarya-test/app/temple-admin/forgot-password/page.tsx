"use client";

import { Suspense } from "react";
import ForgotPasswordFlow from "@/app/components/temple-admin/ForgotPasswordFlow";

function ForgotPasswordFallback() {
  return (
    <div
      className="flex w-full max-w-md min-h-[320px] items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-8 shadow-xl"
      aria-busy
    >
      <p className="text-sm text-[var(--text-muted)]">Loading…</p>
    </div>
  );
}

export default function TempleAdminForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordFlow />
    </Suspense>
  );
}
