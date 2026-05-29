import type { ReactNode } from "react";

type PlanFeatureRowProps = {
  title: string;
  description?: string;
  leading: ReactNode;
  trailing: ReactNode;
  muted?: boolean;
  className?: string;
  onClick?: () => void;
};

/** Aligned feature row for pricing tier pickers (create + configure). */
export default function PlanFeatureRow({
  title,
  description,
  leading,
  trailing,
  muted = false,
  className = "",
  onClick,
}: PlanFeatureRowProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={[
        "grid w-full min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
        muted
          ? "border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50"
          : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        onClick ? "cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex shrink-0 items-center pt-0.5">{leading}</div>
      <div className="min-w-0">
        <p
          className={`text-xs font-bold leading-snug line-clamp-2 sm:text-sm ${
            muted ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {title}
        </p>
        {description ? (
          <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-1 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 pt-0.5">{trailing}</div>
    </Wrapper>
  );
}
