import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  topRight?: ReactNode;
};

export default function FormField({
  id,
  label,
  required,
  hint,
  children,
  topRight,
}: FormFieldProps) {
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
      {hint && <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  );
}
