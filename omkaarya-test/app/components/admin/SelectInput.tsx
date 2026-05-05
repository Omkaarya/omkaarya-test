"use client";

import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

/**
 * Styling matches Subdomains (AdminFiltersBar): zinc borders, light/dark surfaces,
 * brand focus ring, and an inset custom chevron (not the OS arrow).
 * Use everywhere you need a native select that should look like the country/sort controls.
 */
export const selectInputSelectClassName =
  "w-full min-w-0 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-sm text-zinc-900 outline-none ring-[var(--brand-primary)] focus:ring-2 focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-zinc-600";

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
  /** Class on the outer wrapper (e.g. min-width) */
  wrapperClassName?: string;
};

export default function SelectInput({
  className = "",
  wrapperClassName = "",
  id,
  children,
  ...props
}: SelectInputProps) {
  return (
    <div
      className={["relative w-full min-w-0", wrapperClassName].filter(Boolean).join(" ")}
    >
      <select
        id={id}
        className={`${selectInputSelectClassName} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        aria-hidden
      />
    </div>
  );
}
