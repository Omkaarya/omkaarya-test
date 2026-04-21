import React from "react";
import { CheckIcon } from "@/icons/duotone";

// ─── Types ────────────────────────────────────────────────────────
export interface Step {
  label: string;
  description?: string;
  optional?: boolean;
}

export type StepStatus = "complete" | "current" | "upcoming";

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;   // 0-indexed
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function getStatus(index: number, current: number): StepStatus {
  if (index < current) return "complete";
  if (index === current) return "current";
  return "upcoming";
}

// ─── StepIndicator ────────────────────────────────────────────────
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  orientation = "horizontal",
  className = "",
}) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <nav aria-label="Steps" className={className}>
      <ol className={`flex ${isHorizontal ? "flex-row items-start" : "flex-col gap-0"}`}>
        {steps.map((step, index) => {
          const status = getStatus(index, currentStep);
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={`flex ${isHorizontal ? "flex-col items-center flex-1" : "flex-row gap-4"}`}
            >
              <div className={`flex ${isHorizontal ? "flex-col items-center w-full" : "flex-row items-start gap-4"}`}>
                {/* Circle + connector */}
                <div className={`flex ${isHorizontal ? "flex-row items-center w-full" : "flex-col items-center"}`}>
                  {/* Step circle */}
                  <div
                    className={`
                      flex items-center justify-center rounded-full shrink-0
                      h-9 w-9 text-sm font-semibold border-2 transition-colors
                      ${status === "complete"
                        ? "bg-brand border-brand text-brand-on"
                        : status === "current"
                        ? "bg-bg-active border-brand text-text-brand"
                        : "bg-surface border-border text-text-tertiary"
                      }
                    `}
                  >
                    {status === "complete" ? (
                      <CheckIcon className="h-4 w-4 text-white" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className={`
                        ${isHorizontal ? "flex-1 h-0.5 mx-2" : "w-0.5 flex-1 my-2 min-h-6 mx-auto"}
                        ${status === "complete" ? "bg-brand" : "bg-border"}
                      `}
                    />
                  )}
                </div>

                {/* Label */}
                <div className={`${isHorizontal ? "mt-2 text-center px-1" : ""}`}>
                  <p
                    className={`text-sm font-semibold ${
                      status === "current" ? "text-text-brand" :
                      status === "complete" ? "text-text-primary" :
                      "text-text-tertiary"
                    }`}
                  >
                    {step.label}
                    {step.optional && (
                      <span className="ml-1 text-xs font-normal text-text-tertiary">(optional)</span>
                    )}
                  </p>
                  {step.description && (
                    <p className="text-xs text-text-tertiary mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
