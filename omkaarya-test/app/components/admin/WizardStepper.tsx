import { Check } from "lucide-react";

const STEP_LABELS = [
  "Temple Info",
  "Admin Account",
  "Plan & Billing",
  "Review & Create",
  "Final Confirmation",
] as const;

type WizardStepperStep = {
  label: string;
  subtitle?: string;
};

type WizardStepperProps = {
  currentStep: number;
  /** Called when user clicks a step number. Parent decides if navigation is allowed. */
  onStepClick?: (stepIndex: number) => void;
  /** Whether each step is reachable (e.g. prior sections filled). If omitted, steps are not clickable. */
  isStepReachable?: (stepIndex: number) => boolean;
  /**
   * Optional custom steps so WizardStepper can be reused across onboarding flows.
   * If omitted, it falls back to the default `STEP_LABELS`.
   */
  steps?: readonly WizardStepperStep[];
  /**
   * Controls what completed steps display inside the circle.
   * - "number" (default): show `index + 1` (matches create-temple wizard)
   * - "check": show checkmark icon for completed steps (useful for onboarding flows)
   */
  completedIndicator?: "number" | "check";
  /**
   * When true, the *current* step uses the completed indicator too.
   * Useful for onboarding UIs where step labels indicate state and the circle shows a check.
   */
  completedIncludesCurrent?: boolean;
  /**
   * Controls what upcoming steps display inside the circle.
   * - "number" (default): show `index + 1`
   * - "dot": show a small dot (disabled / future step)
   */
  upcomingIndicator?: "number" | "dot";
};

export default function WizardStepper({
  currentStep,
  onStepClick,
  isStepReachable,
  steps,
  completedIndicator = "number",
  completedIncludesCurrent = false,
  upcomingIndicator = "number",
}: WizardStepperProps) {
  const clickable = Boolean(onStepClick && isStepReachable);
  const stepItems: readonly WizardStepperStep[] =
    steps ?? STEP_LABELS.map((label) => ({ label }));
  const stepCount = stepItems.length;

  return (
    <ol className="flex w-full flex-wrap items-start gap-2 sm:flex-nowrap sm:items-center" aria-label="Progress">
      {stepItems.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;
        const lineActive = index < currentStep;
        const reachable = !clickable || (isStepReachable ? isStepReachable(index) : true);
        const isInteractive = clickable && reachable;

        const showCompleteIndicator = isComplete || (completedIncludesCurrent && isCurrent);
        const circleContent = showCompleteIndicator ? (
          completedIndicator === "check" ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <span className="tabular-nums">{index + 1}</span>
          )
        ) : isUpcoming && upcomingIndicator === "dot" ? (
          <span className="h-2 w-2 rounded-full bg-current opacity-70" aria-hidden />
        ) : (
          <span className="tabular-nums">{index + 1}</span>
        );

        const circle = (
          <span
            className={[
              "mx-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
              isCurrent
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                : isComplete
                  ? "border-[var(--brand-primary)] bg-white text-[var(--brand-primary)] dark:border-orange-400 dark:bg-zinc-900 dark:text-orange-400"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
              isInteractive
                ? "cursor-pointer hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
                : clickable && !reachable
                  ? "cursor-not-allowed opacity-50"
                  : "",
            ].join(" ")}
          >
            {circleContent}
          </span>
        );

        return (
          <li
            key={step.label}
            className="flex min-w-0 flex-1 items-center"
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <div
                  className={[
                    "h-0.5 flex-1 rounded-full",
                    index > 0
                      ? lineActive
                        ? "bg-[var(--brand-primary)]"
                        : "bg-zinc-200 dark:bg-zinc-700"
                      : "invisible",
                  ].join(" ")}
                  aria-hidden
                />
                {isInteractive ? (
                  <button
                    type="button"
                    className="shrink-0 border-0 bg-transparent p-0"
                    aria-label={`Go to step ${index + 1}: ${step.label}`}
                    onClick={() => onStepClick?.(index)}
                  >
                    {circle}
                  </button>
                ) : clickable && !reachable ? (
                  <span className="shrink-0" title="Complete previous steps first">
                    {circle}
                  </span>
                ) : (
                  <span className="shrink-0">{circle}</span>
                )}
                <div
                  className={[
                    "h-0.5 flex-1 rounded-full",
                    index < stepCount - 1
                      ? index < currentStep
                        ? "bg-[var(--brand-primary)]"
                        : "bg-zinc-200 dark:bg-zinc-700"
                      : "invisible",
                  ].join(" ")}
                  aria-hidden
                />
              </div>
              {isInteractive ? (
                <button
                  type="button"
                  className={[
                    "max-w-[10rem] text-center text-xs font-medium sm:text-sm",
                  ].join(" ")}
                  onClick={() => onStepClick?.(index)}
                >
                  <div
                    className={[
                      isCurrent
                        ? "text-[var(--brand-primary)]"
                        : isUpcoming
                          ? "text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-700 dark:text-zinc-300",
                      "flex flex-col items-center gap-0.5",
                      "hover:underline focus:outline-none",
                    ].join(" ")}
                  >
                    <span className="whitespace-nowrap">{step.label}</span>
                    {step.subtitle ? (
                      <span className="whitespace-normal text-[10px] font-normal leading-tight text-[var(--text-muted)]">
                        {step.subtitle}
                      </span>
                    ) : null}
                  </div>
                </button>
              ) : (
                <span
                  className={[
                    "max-w-[10rem] text-center text-xs font-medium sm:text-sm",
                    clickable && !reachable ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      isCurrent
                        ? "text-[var(--brand-primary)]"
                        : isUpcoming
                          ? "text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-700 dark:text-zinc-300",
                      "flex flex-col items-center gap-0.5",
                    ].join(" ")}
                  >
                    <span className="whitespace-nowrap">{step.label}</span>
                    {step.subtitle ? (
                      <span className="whitespace-normal text-[10px] font-normal leading-tight text-[var(--text-muted)]">
                        {step.subtitle}
                      </span>
                    ) : null}
                  </div>
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { STEP_LABELS };
