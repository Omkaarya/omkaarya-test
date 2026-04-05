import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  topRight?: ReactNode;
  /** Default `vertical` — label above controls. `horizontal` — label left, controls right (sm+). */
  layout?: "vertical" | "horizontal";
};

export default function FormField({
  id,
  label,
  required,
  hint,
  children,
  topRight,
  layout = "vertical",
}: FormFieldProps) {
  if (layout === "horizontal") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] sm:items-start sm:gap-x-4">
        <div className="flex items-start justify-between gap-2">
          <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:pt-2.5">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
          {topRight}
        </div>
        <div className="min-w-0 space-y-1.5">
          {children}
          {hint ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {topRight}
      </div>
      {children}
      {hint ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
    </div>
  );
}
