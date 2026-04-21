import React from "react";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Icon } from "@/app/components/ds/atoms/Icon";
import { DotsVerticalIcon, TrendUp01Icon, TrendDown01Icon } from "@/app/icons";

export interface MetricCardProps {
  title: string;
  value: string;
  trendPercentage?: number; // e.g. 100 for +100%
  trendLabel?: string;      // e.g. "vs last month"
  chartColor?: "brand" | "success" | "warning" | "gray";
  showMenu?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trendPercentage,
  trendLabel,
  chartColor = "brand",
  showMenu = true,
  className = "",
}) => {
  const isPositive = trendPercentage && trendPercentage > 0;
  const isNegative = trendPercentage && trendPercentage < 0;

  // Render a mock SVG sparkline based on chartColor logic mapping to tokens.
  const strokeColorClass = 
    chartColor === "brand" ? "stroke-brand" :
    chartColor === "success" ? "stroke-status-success-text" :
    chartColor === "warning" ? "stroke-status-warning-text" :
    "stroke-text-tertiary";

  const fillColorClass = 
    chartColor === "brand" ? "fill-brand/10" :
    chartColor === "success" ? "fill-status-success-text/10" :
    chartColor === "warning" ? "fill-status-warning-text/10" :
    "fill-text-tertiary/10";

  return (
    <div className={`bg-surface p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between ${className}`}>
      
      <div className="flex justify-between items-start mb-6">
        <h4 className="text-sm font-semibold text-text-secondary leading-tight">{title}</h4>
        {showMenu && (
          <button className="text-text-tertiary hover:text-text-primary transition-colors">
             <Icon icon={DotsVerticalIcon} size="sm" />
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-3 relative z-10">
        <span className="text-3xl font-bold text-text-primary tracking-tight">
          {value}
        </span>
        
        {trendPercentage !== undefined && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className={`flex items-center gap-0.5 ${isPositive ? "text-status-success-text" : isNegative ? "text-status-danger-text" : "text-text-secondary"}`}>
              {isPositive && <Icon icon={TrendUp01Icon} size="sm" />}
              {isNegative && <Icon icon={TrendDown01Icon} size="sm" />}
              {Math.abs(trendPercentage)}%
            </span>
            {trendLabel && <span className="text-text-tertiary font-medium">{trendLabel}</span>}
          </div>
        )}
      </div>

      {/* Embedded Sparkline Graphic */}
      <div className="w-full h-12 mt-4 relative -mx-2 opacity-80">
        {/* Simple embedded SVG mocking the area chart sparkline shown inside the Metric grid */}
        <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path 
            d="M0,25 C10,15 20,25 30,10 C40,-5 50,20 60,15 C70,10 80,25 90,5 L100,10 L100,30 L0,30 Z" 
            className={fillColorClass} 
          />
          <path 
            d="M0,25 C10,15 20,25 30,10 C40,-5 50,20 60,15 C70,10 80,25 90,5 L100,10" 
            fill="none" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={strokeColorClass}
          />
        </svg>
      </div>
      
    </div>
  );
};
