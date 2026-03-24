import { Check } from "lucide-react";

const STEP_LABELS = [
  "Temple Info",
  "Admin Account",
  "Plan & Billing",
  "Review & Create",
  "Final Confirmation",
] as const;

type WizardStepperProps = {
  currentStep: number;
};

export default function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <ol className="flex w-full flex-wrap items-start gap-2 sm:flex-nowrap sm:items-center" aria-label="Progress">
      {STEP_LABELS.map((label, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;
        const lineActive = index < currentStep;

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center" aria-current={isCurrent ? "step" : undefined}>
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
                <span
                  className={[
                    "mx-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    isCurrent
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                      : isComplete
                        ? "border-[var(--brand-primary)] bg-white text-[var(--brand-primary)] dark:border-orange-400 dark:bg-zinc-900 dark:text-orange-400"
                        : "border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500",
                  ].join(" ")}
                >
                  {isComplete || isCurrent ? (
                    <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <span className="text-xs tabular-nums">{index + 1}</span>
                  )}
                </span>
                <div
                  className={[
                    "h-0.5 flex-1 rounded-full",
                    index < STEP_LABELS.length - 1
                      ? index < currentStep
                        ? "bg-[var(--brand-primary)]"
                        : "bg-zinc-200 dark:bg-zinc-700"
                      : "invisible",
                  ].join(" ")}
                  aria-hidden
                />
              </div>
              <span
                className={[
                  "max-w-[10rem] whitespace-nowrap text-center text-xs font-medium sm:text-sm",
                  isCurrent
                    ? "text-[var(--brand-primary)]"
                    : isUpcoming
                      ? "text-zinc-400 dark:text-zinc-500"
                      : "text-zinc-700 dark:text-zinc-300",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { STEP_LABELS };
