import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type TrendDirection = "up" | "down" | "neutral";

export interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  trendText: string;
  trendDirection?: TrendDirection;
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  trendText,
  trendDirection = "neutral",
}: DashboardStatCardProps) {
  const trendColor =
    trendDirection === "up"
      ? "text-status-success-text"
      : trendDirection === "down"
        ? "text-status-danger-text"
        : "text-text-tertiary";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-xs">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-xl p-3 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-text-secondary">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-text-primary">{value}</p>
      </div>
      <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
        {trendDirection === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
        {trendDirection === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
        <span>{trendText}</span>
      </div>
    </div>
  );
}
