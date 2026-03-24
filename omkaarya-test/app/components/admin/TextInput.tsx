import type { InputHTMLAttributes, ReactNode } from "react";

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
  startIcon?: ReactNode;
};

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white py-2 text-sm text-zinc-900 outline-none ring-[var(--brand-primary)] placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export default function TextInput({ startIcon, className = "", id, ...props }: TextInputProps) {
  if (startIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          {startIcon}
        </span>
        <input id={id} className={`${inputClass} pl-10 pr-3 ${className}`.trim()} {...props} />
      </div>
    );
  }
  return <input id={id} className={`${inputClass} px-3 ${className}`.trim()} {...props} />;
}
