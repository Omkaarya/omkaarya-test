export type TempleGrowthPoint = {
  monthKey: string;
  monthLabel: string;
  count: number;
};

interface TempleGrowthChartProps {
  data: TempleGrowthPoint[];
  loading?: boolean;
}

const CHART_HEIGHT = 200;
const CHART_WIDTH = 400;
const PADDING = { top: 16, right: 16, bottom: 32, left: 40 };

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

export function TempleGrowthChart({ data, loading }: TempleGrowthChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const plotW = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const hasData = data.some((d) => d.count > 0);

  const points = data.map((d, i) => {
    const x = PADDING.left + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
    const y = PADDING.top + plotH - (d.count / maxCount) * plotH;
    return { x, y, ...d };
  });

  const linePath = buildPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1]!.x} ${PADDING.top + plotH} L ${points[0]!.x} ${PADDING.top + plotH} Z`
      : "";

  const yTicks = [0, Math.ceil(maxCount / 2), maxCount];

  return (
    <div className="flex min-h-[320px] flex-col rounded-2xl border border-border bg-surface p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-text-primary">New temples per month</h3>
        <p className="text-xs text-text-tertiary">Last 6 months</p>
      </div>

      {loading ? (
        <div className="flex flex-1 animate-pulse items-center justify-center rounded-xl bg-subtle" />
      ) : !hasData ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-xs font-medium text-text-disabled">
          No temple growth data yet
        </div>
      ) : (
        <div className="flex-1">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Temple growth over the last 6 months"
          >
            {yTicks.map((tick) => {
              const y = PADDING.top + plotH - (tick / maxCount) * plotH;
              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={CHART_WIDTH - PADDING.right}
                    y2={y}
                    className="stroke-border"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-text-tertiary text-[10px]"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {areaPath && (
              <path d={areaPath} className="fill-status-success-text/15" />
            )}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                className="stroke-status-success-text"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {points.map((p) => (
              <circle
                key={p.monthKey}
                cx={p.x}
                cy={p.y}
                r={4}
                className="fill-status-success-text stroke-surface"
                strokeWidth={2}
              />
            ))}

            {points.map((p) => (
              <text
                key={`label-${p.monthKey}`}
                x={p.x}
                y={CHART_HEIGHT - 8}
                textAnchor="middle"
                className="fill-text-tertiary text-[10px]"
              >
                {p.monthLabel}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
