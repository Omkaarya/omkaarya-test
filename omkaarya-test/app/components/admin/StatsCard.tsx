import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  suffix?: string;
  prefix?: string;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  suffix,
  prefix,
}: StatsCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[var(--brand-primary)] dark:bg-red-950/20">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
          </h3>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend.isUp ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.isUp ? "↑" : "↓"} {trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
