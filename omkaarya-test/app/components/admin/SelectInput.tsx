import type { SelectHTMLAttributes } from "react";

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

const selectClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100";

export default function SelectInput({ className = "", id, children, ...props }: SelectInputProps) {
  return (
    <select id={id} className={`${selectClass} ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}
