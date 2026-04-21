import React from "react";

// ─── Spinner atom (used inside Button loading state) ───────────────
const ButtonSpinner = ({ size }: { size: "sm" | "md" | "lg" | "xl" | "2xl" }) => {
  const dim: Record<string, string> = {
    sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-4 w-4", xl: "h-5 w-5", "2xl": "h-5 w-5",
  };
  return (
    <svg
      className={`animate-spin ${dim[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

// ─── Types ────────────────────────────────────────────────────────
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "destructive"
  | "destructive-secondary"
  | "destructive-outline"
  | "destructive-ghost"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  iconOnly?: boolean;
}

// ─── Button ───────────────────────────────────────────────────────
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      leadingIcon,
      trailingIcon,
      iconOnly = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Base styles
    const base = [
      "inline-flex items-center justify-center gap-1.5",
      "font-semibold rounded-lg transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand",
      "disabled:cursor-not-allowed",
    ].join(" ");

    // Variant styles
    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-brand text-brand-on hover:bg-brand-hover disabled:bg-bg-disabled disabled:text-text-disabled shadow-xs",
      secondary:
        "bg-bg-brand-secondary text-text-brand hover:bg-brand-muted disabled:bg-bg-disabled disabled:text-text-disabled",
      tertiary:
        "bg-transparent text-text-brand hover:bg-bg-brand-secondary disabled:text-text-disabled",
      outline:
        "bg-surface border border-border text-text-primary hover:bg-subtle disabled:bg-bg-disabled disabled:text-text-disabled shadow-xs",
      ghost:
        "bg-transparent text-text-secondary hover:bg-subtle hover:text-text-primary disabled:text-text-disabled",
      link:
        "bg-transparent text-text-brand hover:underline disabled:text-text-disabled p-0 h-auto",
      destructive:
        "bg-status-danger-bg text-status-danger-text border border-border-error hover:bg-error disabled:bg-bg-disabled disabled:text-text-disabled shadow-xs",
      "destructive-secondary":
        "bg-status-danger-bg text-status-danger-text hover:bg-error disabled:bg-bg-disabled disabled:text-text-disabled",
      "destructive-outline":
        "bg-surface border border-border-error text-status-danger-text hover:bg-status-danger-bg disabled:bg-bg-disabled disabled:text-text-disabled shadow-xs",
      "destructive-ghost":
        "bg-transparent text-status-danger-text hover:bg-status-danger-bg disabled:text-text-disabled",
    };

    // Size styles
    const sizes: Record<ButtonSize, string> = {
      sm:  iconOnly ? "h-9 w-9 text-sm"          : "h-9 px-3.5 text-sm",
      md:  iconOnly ? "h-10 w-10 text-sm"         : "h-10 px-4 text-sm",
      lg:  iconOnly ? "h-11 w-11 text-base"       : "h-11 px-4.5 text-base",
      xl:  iconOnly ? "h-12 w-12 text-base"       : "h-12 px-5 text-base",
      "2xl": iconOnly ? "h-14 w-14 text-lg"       : "h-14 px-6 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <ButtonSpinner size={size} />
        ) : (
          leadingIcon && <span className="shrink-0">{leadingIcon}</span>
        )}
        {!iconOnly && children}
        {!loading && trailingIcon && (
          <span className="shrink-0">{trailingIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
