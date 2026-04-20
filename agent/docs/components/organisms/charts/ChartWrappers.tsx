"use client";
import React from "react";
import { Badge } from "@/components/atoms/Badge";
import { ProgressCircle } from "@/components/molecules/Progress"; // We can reuse our precise SVG circle

export interface ChartWrapperProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  children: React.ReactNode;
}

const BaseChartContainer: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  badge,
  className = "",
  children
}) => (
  <div className={`p-6 rounded-xl border border-border bg-surface shadow-xs flex flex-col ${className}`}>
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          {title && <h3 className="text-base font-semibold text-text-primary leading-tight">{title}</h3>}
          {badge && <Badge color="gray" size="sm">{badge}</Badge>}
        </div>
        {subtitle && <p className="text-sm text-text-tertiary">{subtitle}</p>}
      </div>
      {/* Legend placeholder */}
      <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand"></span> Current</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-text-tertiary"></span> Previous</div>
      </div>
    </div>
    
    {/* Body for canvas/svg injection */}
    <div className="flex-1 w-full min-h-[200px] relative">
      {children}
    </div>
  </div>
);

// ─── Line & Bar Mocks ─────────────────────────────────────────────
// Note: In production, wrap a true <LineChart> or <BarChart> from Recharts here.
// We provide the structural Tailwind container and standard Grid/Axis mock colors.

export const LineChartWrapper: React.FC<ChartWrapperProps> = (props) => (
  <BaseChartContainer {...props}>
    {/* Mock internal layout demonstrating the axes lines the exact color of Figma border tokens */}
    <div className="absolute inset-0 border-l border-b border-border flex items-end">
      {/* Horizontal grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pt-4">
         {[1,2,3,4,5].map(i => <div key={i} className="w-full border-t border-border border-dashed opacity-50" />)}
      </div>
      {/* Mock wave or bars goes here */}
      <div className="relative w-full h-full flex items-end justify-around pb-0.5 z-10 px-4">
        <div className="text-text-tertiary text-xs opacity-50 text-center uppercase tracking-widest pt-2">X-Axis Data</div>
      </div>
    </div>
  </BaseChartContainer>
);

// ─── Activity Gauge ───────────────────────────────────────────────
export const ActivityGauge: React.FC<{ value: number; size?: number; label?: string; className?: string }> = ({
  value, 
  size = 140,
  label,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Reusing our SVG ProgressCircle as an Activity Gauge */}
      <ProgressCircle 
        value={value} 
        size={size} 
        strokeWidth={14} 
        color="brand" 
        labelTop="Avg" 
        labelBottom={label}
      />
    </div>
  );
};

// ─── Pie Chart ────────────────────────────────────────────────────
export const PieChartMock: React.FC<{ percentages: number[]; size?: number; className?: string }> = ({
  percentages,
  size = 120,
  className = ""
}) => {
  // A structural mock of the broken out pie chart. Real implementation needs D3 arc generators or Recharts.
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-surface ${className}`} style={{ width: size, height: size }}>
       {/* Pseudo pie - using a conic gradient matching Omkaarya brand tokens */}
       <div 
         className="absolute inset-0 rounded-full shadow-sm"
         style={{
           background: `conic-gradient(var(--color-brand) 0% 40%, var(--color-status-success-text) 40% 70%, var(--color-subtle) 70% 100%)`
         }}
       />
       <div className="absolute inset-2 bg-surface rounded-full shadow-inner" /> 
    </div>
  );
};
