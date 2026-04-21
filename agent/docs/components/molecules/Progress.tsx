import React from "react";
import { ProgressColor, ProgressSize, ProgressBar } from "./ProgressBar"; // Keep our existing ProgressBar

export interface ProgressCircleProps {
  value: number; // 0-100
  size?: number; // pixel width/height (e.g. 64)
  strokeWidth?: number;
  color?: ProgressColor;
  labelTop?: string;
  labelBottom?: string;
  showPercent?: boolean;
}

const colorStrokeMap: Record<ProgressColor, string> = {
  brand:   "stroke-brand text-brand",
  success: "stroke-status-success-text text-status-success-text",
  warning: "stroke-status-warning-text text-status-warning-text",
  danger:  "stroke-status-danger-text text-status-danger-text",
};

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  color = "brand",
  labelTop,
  labelBottom,
  showPercent = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const pct = Math.min(Math.max((value / 100), 0), 1);
  const strokeDashoffset = circumference - pct * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="relative flex items-center justify-center font-semibold"
        style={{ width: size, height: size }}
      >
        <svg
          className="absolute transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-subtle fill-none"
          />
          {/* Progress Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorStrokeMap[color]} fill-none transition-all duration-500 ease-out`}
          />
        </svg>

        {/* Center Text */}
        <div className="flex flex-col items-center justify-center text-center absolute">
          {labelTop && <span className="text-[10px] text-text-tertiary leading-none mb-0.5">{labelTop}</span>}
          {showPercent && (
            <span className="text-xl font-bold text-text-primary leading-none">
              {Math.round(value)}%
            </span>
          )}
          {labelBottom && <span className="text-[10px] text-text-tertiary leading-none mt-0.5">{labelBottom}</span>}
        </div>
      </div>
    </div>
  );
};

export { ProgressBar };
