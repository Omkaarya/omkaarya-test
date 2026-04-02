import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export default function AdminButton({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}: AdminButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-zinc-900";
  const styles =
    variant === "primary"
      ? "bg-[var(--brand-primary)] text-white shadow-sm hover:bg-[var(--brand-primary-hover)]"
      : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";

  return (
    <button type={type} className={`${base} ${styles} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
