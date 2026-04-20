import React from "react";
import { ButtonSize } from "./Button";

// ─── Types ────────────────────────────────────────────────────────
export type IconButtonVariant =
  | "primary" | "secondary" | "tertiary" | "outline" | "ghost"
  | "destructive" | "destructive-outline" | "destructive-ghost";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  "aria-label": string;
}

// ─── Size map ─────────────────────────────────────────────────────
const sizeMap: Record<ButtonSize, { btn: string; icon: string }> = {
  sm:   { btn: "h-9 w-9",   icon: "h-4 w-4" },
  md:   { btn: "h-10 w-10", icon: "h-4 w-4" },
  lg:   { btn: "h-11 w-11", icon: "h-5 w-5" },
  xl:   { btn: "h-12 w-12", icon: "h-5 w-5" },
  "2xl":{ btn: "h-14 w-14", icon: "h-6 w-6" },
};

// ─── Variant map ──────────────────────────────────────────────────
const variantMap: Record<IconButtonVariant, string> = {
  primary:
    "bg-brand text-brand-on hover:bg-brand-hover shadow-xs",
  secondary:
    "bg-bg-brand-secondary text-text-brand hover:bg-brand-muted",
  tertiary:
    "bg-transparent text-text-brand hover:bg-bg-brand-secondary",
  outline:
    "bg-surface border border-border text-fg-secondary hover:bg-subtle shadow-xs",
  ghost:
    "bg-transparent text-fg-secondary hover:bg-subtle hover:text-fg-primary",
  destructive:
    "bg-status-danger-bg text-status-danger-text border border-border-error hover:bg-red-100 shadow-xs",
  "destructive-outline":
    "bg-surface border border-border-error text-status-danger-text hover:bg-status-danger-bg shadow-xs",
  "destructive-ghost":
    "bg-transparent text-status-danger-text hover:bg-status-danger-bg",
};

// ─── Mini spinner ─────────────────────────────────────────────────
const MiniSpinner = ({ size }: { size: ButtonSize }) => (
  <svg
    className={`animate-spin ${sizeMap[size].icon}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─── IconButton ──────────────────────────────────────────────────
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      variant = "outline",
      size = "md",
      loading = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const { btn, icon } = sizeMap[size];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center rounded-lg
          transition-colors duration-150 cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${btn} ${variantMap[variant]} ${className}
        `}
        {...props}
      >
        {loading ? (
          <MiniSpinner size={size} />
        ) : (
          <span className={`${icon} flex items-center justify-center`}>{children}</span>
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
