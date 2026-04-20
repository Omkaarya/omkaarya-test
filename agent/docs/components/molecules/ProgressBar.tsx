import React from "react";

// ─── ProgressBar ──────────────────────────────────────────────────
export type ProgressColor = "brand" | "success" | "warning" | "danger";
export type ProgressSize  = "xs" | "sm" | "md" | "lg";

export interface ProgressBarProps {
  value: number;          // 0–100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: ProgressColor;
  size?: ProgressSize;
  animated?: boolean;
  className?: string;
}

const colorMap: Record<ProgressColor, string> = {
  brand:   "bg-brand",
  success: "bg-status-success-text",
  warning: "bg-status-warning-text",
  danger:  "bg-status-danger-text",
};

const sizeMap: Record<ProgressSize, string> = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = false,
  color = "brand",
  size = "md",
  animated = false,
  className = "",
}) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-text-tertiary">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={`w-full rounded-full bg-subtle overflow-hidden ${sizeMap[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${colorMap[color]}
            ${animated ? "animate-pulse" : ""}
          `}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
