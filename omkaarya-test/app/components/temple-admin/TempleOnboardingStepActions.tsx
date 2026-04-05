"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type TempleOnboardingStepActionsProps = {
  onBack: () => void;
  backLabel?: string;
  /** When true, shows a leading arrow on Back (e.g. choose-plan). */
  showBackIcon?: boolean;
  /** Primary action — typically a `<button type="submit">` or CTA with `className` including `flex flex-[1.25] ...`. */
  primary: ReactNode;
  className?: string;
};

/**
 * Shared footer for temple onboarding steps: equal-weight Back + wider primary CTA.
 */
export default function TempleOnboardingStepActions({
  onBack,
  backLabel = "Back",
  showBackIcon = false,
  primary,
  className,
}: TempleOnboardingStepActionsProps) {
  return (
    <div className={["flex items-center gap-3", className ?? "mt-2"].join(" ")}>
      <button
        type="button"
        onClick={onBack}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] py-3 text-sm font-semibold text-[var(--text-primary)] shadow-sm hover:bg-black/5 dark:hover:bg-white/5"
      >
        {showBackIcon ? <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden /> : null}
        {backLabel}
      </button>
      {primary}
    </div>
  );
}
