/** Copy for post-onboarding “next steps” (UI only; wire routes when features exist). */

export type OnboardingPendingNextStep = {
  stepNumber: 3 | 4 | 5;
  title: string;
  subtitle: string;
};

export const ONBOARDING_PENDING_NEXT_STEPS: OnboardingPendingNextStep[] = [
  {
    stepNumber: 3,
    title: "Set up your festival calendar",
    subtitle: "Add upcoming events and puja schedules",
  },
  {
    stepNumber: 4,
    title: "Invite your team members",
    subtitle: "Add priests, trustees, and volunteers",
  },
  {
    stepNumber: 5,
    title: "Configure donation collection",
    subtitle: "Set up online and in-person donation flows",
  },
];
