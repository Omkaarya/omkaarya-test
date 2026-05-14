import type { ReactNode } from "react";

type SelectionCardProps = {
  title: string;
  bullets: string[];
  icon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export default function SelectionCard({
  title,
  bullets,
  icon,
  selected = false,
  onClick,
  disabled = false,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex w-full flex-col rounded-xl border-2 p-4 text-left transition-colors",
        disabled
          ? "cursor-not-allowed border-zinc-200 bg-zinc-100/80 opacity-60 dark:border-zinc-700 dark:bg-zinc-900/50"
          : selected
            ? "border-[var(--brand-primary)] bg-orange-50/50 ring-2 ring-[var(--brand-primary)]/20 dark:bg-orange-950/20"
            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600",
      ].join(" ")}
    >
      {icon && <span className="mb-2 text-zinc-600 dark:text-zinc-400">{icon}</span>}
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
      <ul className="mt-2 list-inside list-disc text-xs text-zinc-500 dark:text-zinc-400">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </button>
  );
}
