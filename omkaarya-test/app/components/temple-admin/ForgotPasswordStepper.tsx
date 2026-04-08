"use client";

import WizardStepper from "@/app/components/admin/WizardStepper";

const STEPS = [
  { label: "Email", subtitle: "Enter your email" },
  { label: "OTP Verification", subtitle: "Required verification code" },
  { label: "Verified", subtitle: "Email verified" },
  { label: "Reset Password", subtitle: "Choose a new password" },
] as const;

export type ForgotPasswordWizardStep = 0 | 1 | 2 | 3 | 4;

/** Maps `?step=` on `/temple-admin/forgot-password` to stepper index (4 = all complete). */
export function forgotPasswordStepFromQuery(step: string | null): ForgotPasswordWizardStep {
  switch (step) {
    case "otp":
      return 1;
    case "verified":
      return 2;
    case "reset":
      return 3;
    case "done":
      return 4;
    default:
      return 0;
  }
}

type ForgotPasswordStepperProps = {
  currentStep: ForgotPasswordWizardStep;
};

export function ForgotPasswordStepper({ currentStep }: ForgotPasswordStepperProps) {
  return (
    <WizardStepper
      currentStep={currentStep}
      steps={STEPS}
      completedIndicator="check"
      completedIncludesCurrent={false}
      upcomingIndicator="dot"
    />
  );
}
