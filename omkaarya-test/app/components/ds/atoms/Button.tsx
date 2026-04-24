import React from "react";

// ─── Spinner atom ──────────────────────────────────────────────────
const ButtonSpinner = ({ size }: { size: ButtonSize }) => {
  const dim: Record<string, string> = {
    sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-4 w-4", xl: "h-5 w-5", "2xl": "h-6 w-6",
  };
  return (
    <svg className={`animate-spin ${dim[size]}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

export type ButtonVariant =
  | "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  iconOnly?: boolean;
}

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

    const base = [
      "inline-flex items-center justify-center gap-2",
      "font-bold rounded-[18px] transition-all duration-200 active:scale-95",
      "focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary)]/10",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    ].join(" ");

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-[var(--brand-primary)] text-white hover:brightness-110 shadow-lg shadow-orange-500/10",
      secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
      outline: "bg-transparent border-2 border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-300",
      ghost: "bg-transparent text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800",
      link: "bg-transparent text-[var(--brand-primary)] hover:underline p-0 h-auto",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/10",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: iconOnly ? "w-9 h-9" : "h-9 px-4 text-xs",
      md: iconOnly ? "w-11 h-11" : "h-11 px-6 text-sm",
      lg: iconOnly ? "w-12 h-12" : "h-12 px-7 text-base",
      xl: iconOnly ? "w-14 h-14" : "h-14 px-8 text-base",
      "2xl": iconOnly ? "w-16 h-16" : "h-16 px-10 text-lg",
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
        {!iconOnly && <span>{children}</span>}
        {!loading && trailingIcon && (
          <span className="shrink-0">{trailingIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
