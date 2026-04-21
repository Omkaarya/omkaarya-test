import React from "react";

// ─── Divider ──────────────────────────────────────────────────────
export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  label,
  className = "",
}) => {
  if (orientation === "vertical") {
    return (
      <div className={`self-stretch w-px bg-border ${className}`} aria-hidden />
    );
  }

  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-text-tertiary whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <div className={`h-px w-full bg-border ${className}`} aria-hidden />;
};

// ─── Dot / Status indicator ───────────────────────────────────────
export type DotColor = "success" | "warning" | "danger" | "info" | "gray" | "brand";
export type DotSize  = "xs" | "sm" | "md" | "lg";

export interface DotProps {
  color?: DotColor;
  size?: DotSize;
  pulse?: boolean;
  className?: string;
}

const dotColors: Record<DotColor, string> = {
  success: "bg-status-success-text",
  warning: "bg-status-warning-text",
  danger:  "bg-status-danger-text",
  info:    "bg-brand-primary",
  gray:    "bg-fg-quaternary",
  brand:   "bg-brand",
};

const dotSizes: Record<DotSize, string> = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export const Dot: React.FC<DotProps> = ({
  color = "success",
  size = "sm",
  pulse = false,
  className = "",
}) => (
  <span className={`relative inline-flex ${dotSizes[size]} ${className}`}>
    {pulse && (
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColors[color]}`}
      />
    )}
    <span className={`relative inline-flex rounded-full ${dotSizes[size]} ${dotColors[color]}`} />
  </span>
);
