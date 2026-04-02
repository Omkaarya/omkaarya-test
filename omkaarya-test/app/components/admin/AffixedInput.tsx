import type { InputHTMLAttributes, ReactNode } from "react";

const innerInputClass =
  "min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500";

type AffixedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  suffixAction?: ReactNode;
};

export default function AffixedInput({
  prefix,
  suffix,
  suffixAction,
  className = "",
  id,
  ...props
}: AffixedInputProps) {
  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-lg border border-zinc-200 bg-white ring-[var(--brand-primary)] focus-within:ring-2 dark:border-zinc-700 dark:bg-zinc-800/50 ${className}`.trim()}
    >
      {prefix != null && (
        <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          {prefix}
        </span>
      )}
      <input id={id} className={`${innerInputClass} ${prefix ? "pl-2 pr-3" : "px-3"}`} {...props} />
      {suffix != null && (
        <span className="flex items-center border-l border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          {suffix}
        </span>
      )}
      {suffixAction != null && <div className="flex shrink-0 items-center border-l border-zinc-200 px-2 dark:border-zinc-700">{suffixAction}</div>}
    </div>
  );
}
