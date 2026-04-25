import React from "react";

// ─── Types ─────────────────────────────────────────────────────────
export type BadgeColor =
  | "gray" | "brand" | "error" | "warning" | "success"
  | "blue" | "indigo" | "purple" | "pink" | "orange";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  leadingIcon?: React.ReactNode;
  onDismiss?: () => void;
  onClick?: () => void;
  className?: string;
}

// ─── Color map (Figma-matched) ─────────────────────────────────────
const colorStyles: Record<BadgeColor, { bg: string; text: string; dot: string; border: string }> = {
  gray:    { bg: "bg-subtle",              text: "text-text-secondary",   dot: "bg-fg-quaternary",     border: "border-border" },
  brand:   { bg: "bg-bg-brand-secondary",  text: "text-text-brand",       dot: "bg-brand",             border: "border-border-brand" },
  error:   { bg: "bg-status-danger-bg",    text: "text-status-danger-text",dot: "bg-fg-error",         border: "border-border-error" },
  warning: { bg: "bg-status-warning-bg",   text: "text-status-warning-text",dot: "bg-fg-warning",      border: "" },
  success: { bg: "bg-status-success-bg",   text: "text-status-success-text",dot: "bg-fg-success",      border: "" },
  blue:    { bg: "bg-blue-50",             text: "text-blue-700",          dot: "bg-brand-primary",         border: "" },
  indigo:  { bg: "bg-indigo-50",           text: "text-indigo-700",        dot: "bg-indigo-500",       border: "" },
  purple:  { bg: "bg-purple-50",           text: "text-purple-700",        dot: "bg-purple-500",       border: "" },
  pink:    { bg: "bg-pink-50",             text: "text-pink-700",          dot: "bg-pink-500",         border: "" },
  orange:  { bg: "bg-orange-50",           text: "text-orange-700",        dot: "bg-orange-500",       border: "" },
};

const sizeStyles: Record<BadgeSize, { badge: string; text: string; dot: string }> = {
  sm: { badge: "px-2 py-0.5 gap-1",     text: "text-xs",  dot: "h-1.5 w-1.5" },
  md: { badge: "px-2.5 py-0.5 gap-1.5", text: "text-xs",  dot: "h-2 w-2" },
  lg: { badge: "px-3 py-1 gap-1.5",     text: "text-sm",  dot: "h-2 w-2" },
};

// ─── Badge ─────────────────────────────────────────────────────────
export const Badge: React.FC<BadgeProps> = ({
  children,
  color = "gray",
  size = "md",
  dot = false,
  leadingIcon,
  onDismiss,
  onClick,
  className = "",
}) => {
  const c = colorStyles[color];
  const s = sizeStyles[size];

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center rounded-full font-medium
        ${c.bg} ${c.text}
        ${s.badge} ${s.text}
        ${c.border ? `border ${c.border}` : ""}
        ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
        ${className}
      `}
    >
      {dot && !leadingIcon && (
        <span className={`rounded-full shrink-0 ${s.dot} ${c.dot}`} />
      )}
      {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
      {children}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`shrink-0 rounded-full hover:opacity-70 transition-opacity ml-0.5 ${c.text}`}
          aria-label="Dismiss"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// ─── BadgeGroup (inline notification text + badge) ─────────────────
export interface BadgeGroupProps {
  message: string;
  badgeLabel: string;
  color?: BadgeColor;
  trailingIcon?: React.ReactNode;
  onClick?: () => void;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  message,
  badgeLabel,
  color = "brand",
  trailingIcon,
  onClick,
}) => {
  const c = colorStyles[color];
  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border border-border
        bg-surface px-3 py-1 text-sm shadow-xs cursor-pointer
        hover:shadow-sm transition-shadow
      `}
      onClick={onClick}
    >
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}
      >
        {badgeLabel}
      </span>
      <span className="text-text-secondary font-medium">{message}</span>
      {trailingIcon && <span className="text-text-tertiary">{trailingIcon}</span>}
    </div>
  );
};
