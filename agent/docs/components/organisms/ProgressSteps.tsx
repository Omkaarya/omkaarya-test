"use client";
import React from "react";
import { Icon } from "@/components/atoms/Icon";
import { CheckIcon } from "@/icons/duotone";

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
  status: "complete" | "current" | "upcoming";
}

export interface ProgressStepsProps {
  steps: StepItem[];
  orientation?: "horizontal" | "vertical";
  variant?: "circles" | "checkmarks" | "minimal";
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  orientation = "horizontal",
  variant = "circles",
  className = "",
}) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className={`flex ${isHorizontal ? "flex-row w-full" : "flex-col"} gap-y-6`}>
        {steps.map((step, stepIdx) => {
          const isLast = stepIdx === steps.length - 1;
          const isComplete = step.status === "complete";
          const isCurrent = step.status === "current";
          
          return (
            <li key={step.id} className={`relative ${isHorizontal ? "flex-1" : ""}`}>
              
              {/* Connecting Line */}
              {!isLast && (
                <div 
                  className={`
                    absolute bg-border transition-colors duration-300
                    ${isComplete ? "bg-brand" : "bg-border"}
                    ${isHorizontal 
                      ? "top-4 left-1/2 w-full h-[2px] -mt-px -ml-4" 
                      : "left-4 top-8 w-[2px] h-[calc(100%-1rem)] ml-px"
                    }
                  `} 
                  aria-hidden="true" 
                />
              )}

              <div className={`group flex ${isHorizontal ? "flex-col items-center text-center" : "items-start relative"}`}>
                
                {/* Step Indicator */}
                <span className={`h-9 flex items-center ${isHorizontal ? "" : "min-w-9"}`}>
                  <span
                    className={`
                      relative z-10 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm transition-colors duration-300
                      ${variant === "minimal" ? "w-6 h-6 border-2" : "border-2 shadow-xs"}
                      ${isComplete ? "bg-status-success-text border-status-success-text text-white" : ""}
                      ${isCurrent ? "bg-brand border-brand text-white" : ""}
                      ${!isComplete && !isCurrent ? "bg-surface border-border text-text-tertiary" : ""}
                    `}
                  >
                    {isComplete && variant !== "circles" ? (
                      <Icon icon={CheckIcon} size="sm" className="text-white" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </span>
                </span>
                
                {/* Step Text Container */}
                <span className={`flex flex-col min-w-0 ${isHorizontal ? "mt-3" : "ml-4 pt-1.5"}`}>
                  <span 
                    className={`text-sm font-bold tracking-wide transition-colors
                      ${isComplete ? "text-text-primary" : ""}
                      ${isCurrent ? "text-brand" : ""}
                      ${!isComplete && !isCurrent ? "text-text-tertiary" : ""}
                    `}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-sm text-text-secondary mt-0.5 leading-relaxed max-w-[12rem] whitespace-normal">
                      {step.description}
                    </span>
                  )}
                </span>

              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
