"use client";

import WizardStepper from "@/app/components/admin/WizardStepper";

const STEPS = [
  { label: "Sign In", subtitle: "Access your account" },
  { label: "Set password", subtitle: "Secure your account" },
  { label: "Build your team", subtitle: "Invite your team members" },
  { label: "Temple Profile", subtitle: "Temple details" },
] as const;

/** Step 7 = post-payment success (all onboarding steps shown complete). */
export type TempleOnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type TempleOnboardingStepperProps = {
  currentStep: TempleOnboardingStepIndex;
};

export function TempleOnboardingStepper({ currentStep }: TempleOnboardingStepperProps) {
  return (
    <WizardStepper
      currentStep={currentStep}
      steps={STEPS}
      completedIndicator="check"
      completedIncludesCurrent
      upcomingIndicator="dot"
    />
  );
}

export function templeOnboardingStepFromPathname(pathname: string | null): TempleOnboardingStepIndex {
  if (!pathname) return 0;
  if (pathname.includes("/set-password")) return 1;
  if (pathname.includes("/admin-profile")) return 2;
  if (pathname.includes("/temple-profile")) return 3;
  if (pathname.includes("/deity-selection")) return 4;
  if (pathname.includes("/choose-plan")) return 5;
  if (pathname.includes("/payment")) return 6;
  if (pathname.includes("/onboarding-complete")) return 7;
  return 0;
}
