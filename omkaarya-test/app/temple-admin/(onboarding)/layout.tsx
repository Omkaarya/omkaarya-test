"use client";

import { usePathname } from "next/navigation";
import { TempleOnboardingGuardedPage } from "@/app/components/temple-admin/TempleOnboardingGuardedPage";
import { pathnameToOnboardingStep } from "@/lib/temple-onboarding-routing";
import TempleOnboardingShell from "../TempleOnboardingShell";
import type { ComponentProps } from "react";

type StepKey = ComponentProps<typeof TempleOnboardingGuardedPage>["step"];

const GUARDED_STEPS = new Set([
  "setPassword",
  "adminProfile",
  "templeProfile",
  "deitySelection",
  "choosePlan",
  "payment",
  "complete",
]);

export default function TempleOnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const step = pathnameToOnboardingStep(pathname);

  const content =
    step && (GUARDED_STEPS as Set<string>).has(step) ? (
      <TempleOnboardingGuardedPage step={step as StepKey}>{children}</TempleOnboardingGuardedPage>
    ) : (
      children
    );

  return <TempleOnboardingShell>{content}</TempleOnboardingShell>;
}
