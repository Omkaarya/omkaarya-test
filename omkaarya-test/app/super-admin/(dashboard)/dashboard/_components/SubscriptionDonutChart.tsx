export type PlanBreakdownItem = {
  plan: string;
  percent: number;
  count: number;
};

interface SubscriptionDonutChartProps {
  data: PlanBreakdownItem[];
  loading?: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  Sankalpa: "#6366f1",
  Aaaradhana: "#a855f7",
  Aaradhana: "#a855f7",
  Mandala: "#ec4899",
  Trial: "#22c55e",
  Suspended: "#ef4444",
  Free: "#94a3b8",
};

function colorForPlan(plan: string, index: number): string {
  return PLAN_COLORS[plan] ?? ["#6366f1", "#a855f7", "#22c55e", "#f59e0b", "#ef4444"][index % 5]!;
}

function buildConicGradient(data: PlanBreakdownItem[]): string {
  if (data.length === 0) return "conic-gradient(#e5e7eb 0% 100%)";
  let cursor = 0;
  const stops: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i]!;
    const color = colorForPlan(item.plan, i);
    const end = cursor + item.percent;
    stops.push(`${color} ${cursor}% ${end}%`);
    cursor = end;
  }
  if (cursor < 100) {
    stops.push(`#e5e7eb ${cursor}% 100%`);
  }
  return `conic-gradient(${stops.join(", ")})`;
}

export function SubscriptionDonutChart({ data, loading }: SubscriptionDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const gradient = buildConicGradient(data);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs lg:max-w-xl">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-text-primary">Subscription Plans</h3>
        <p className="text-xs text-text-tertiary">Distribution by plan type</p>
      </div>

      {loading ? (
        <div className="flex animate-pulse items-center gap-8">
          <div className="h-36 w-36 rounded-full bg-subtle" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-subtle" />
            ))}
          </div>
        </div>
      ) : total === 0 ? (
        <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-border text-xs font-medium text-text-disabled">
          No subscription plan data yet
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative h-36 w-36 shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: gradient }}
            />
            <div className="absolute inset-[28%] flex items-center justify-center rounded-full bg-surface">
              <span className="text-lg font-bold text-text-primary">{total}</span>
            </div>
          </div>
          <ul className="flex-1 space-y-3">
            {data.map((item, i) => (
              <li key={item.plan} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: colorForPlan(item.plan, i) }}
                  />
                  <span className="font-medium text-text-secondary">{item.plan}</span>
                </div>
                <span className="font-semibold text-text-primary">{item.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
