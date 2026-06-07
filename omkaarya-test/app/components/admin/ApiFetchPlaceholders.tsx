import { Skeleton } from "@/app/components/ds/atoms/Skeleton";

/** Matches finance KPI tiles: `bg-surface rounded-xl border border-border p-4`. */
export function KpiTileGridSkeleton({
  columns,
  count,
  gapClassName = "gap-3",
  className = "",
}: {
  columns: 3 | 4;
  count?: number;
  gapClassName?: string;
  className?: string;
}) {
  const n = count ?? columns;
  const colsClass = columns === 3 ? "grid-cols-3" : "grid-cols-4";
  return (
    <div className={`grid ${colsClass} ${gapClassName} ${className}`.trim()}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4">
          <Skeleton className="mb-3 h-2.5 w-28" height={10} />
          <Skeleton className="mb-2 h-8 w-24" height={32} />
          <Skeleton className="h-2 w-36" height={8} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for `HorizontalBarChart`-sized panels on the revenue dashboard. */
export function HorizontalBarChartSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 ${className}`.trim()}>
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-5 w-40" height={20} />
        <Skeleton className="h-3 w-16" height={12} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-[140px] shrink-0" height={16} />
            <Skeleton className="h-[22px] flex-1 rounded" height={22} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard stat cards with icon box (super-admin home). */
export function DashboardStatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-surface p-6 shadow-xs"
        >
          <Skeleton className="mb-4 h-11 w-11 rounded-xl" height={44} width={44} />
          <Skeleton className="mb-2 h-4 w-28" height={16} />
          <Skeleton className="mb-4 h-9 w-20" height={36} />
          <Skeleton className="h-3 w-36" height={12} />
        </div>
      ))}
    </div>
  );
}

/** Chart + list row on super-admin dashboard home. */
export function DashboardChartRowSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="min-h-[320px] animate-pulse rounded-2xl border border-border bg-surface p-6">
        <Skeleton className="mb-2 h-4 w-32" height={16} />
        <Skeleton className="mb-6 h-3 w-24" height={12} />
        <Skeleton className="h-[200px] w-full rounded-xl" height={200} />
      </div>
      <div className="min-h-[320px] animate-pulse rounded-2xl border border-border bg-surface p-6">
        <Skeleton className="mb-2 h-4 w-32" height={16} />
        <Skeleton className="mb-6 h-3 w-36" height={12} />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" height={56} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Matches super-admin analytics `MetricCard` shell (p-6 rounded-xl border). */
export function MetricCardGridSkeleton({
  count = 4,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`.trim()}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-xs"
        >
          <div className="mb-6 flex justify-between">
            <Skeleton className="h-4 w-28" height={16} />
            <Skeleton className="h-4 w-4 rounded" height={16} />
          </div>
          <Skeleton className="h-9 w-32" height={36} />
          <Skeleton className="mt-4 h-12 w-full rounded-md" height={48} />
        </div>
      ))}
    </div>
  );
}

/** Large payment / entity cards (e.g. confirm-payments). */
export function LargeDetailCardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-lg" height={44} width={44} />
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-4 w-48" height={16} />
                <Skeleton className="h-3 w-full max-w-md" height={12} />
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-2.5 w-full" height={10} />
                      <Skeleton className="h-4 w-20" height={16} />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-16 w-full rounded-lg" height={64} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Skeleton className="h-9 w-[140px] rounded-lg" height={36} width={140} />
              <Skeleton className="h-9 w-[140px] rounded-lg" height={36} width={140} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Pricing plan marketing cards (`rounded-3xl` grid). */
export function PricingPlanCardSkeletonGrid({ cards = 3 }: { cards?: number }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="flex min-h-[400px] flex-col rounded-3xl border-2 border-zinc-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-6 space-y-2">
            <Skeleton className="h-7 w-3/5 max-w-[200px]" height={28} />
            <Skeleton className="h-4 w-full" height={16} />
            <Skeleton className="h-4 w-4/5" height={16} />
          </div>
          <Skeleton className="mb-8 h-12 w-40" height={48} />
          <div className="mb-6 flex-1 space-y-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <Skeleton className="h-4 w-32" height={16} />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-full rounded-lg" height={32} />
              ))}
            </div>
            <Skeleton className="h-24 w-full rounded-lg" height={96} />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" height={48} />
        </div>
      ))}
    </div>
  );
}
