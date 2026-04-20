"use client";
import React from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from "@/icons/duotone";

export interface CalendarHeaderProps {
  title: string; // e.g. "January 2027"
  subtitle?: string; // e.g. "Week 1"
  dateRange?: string; // e.g. "Jan 1, 2027 - Jan 31, 2027"
  viewMode: "month" | "week" | "day";
  onViewModeChange: (mode: "month" | "week" | "day") => void;
  onNext: () => void;
  onPrev: () => void;
  onToday: () => void;
  onAddEvent?: () => void;
  className?: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  subtitle,
  dateRange,
  viewMode,
  onViewModeChange,
  onNext,
  onPrev,
  onToday,
  onAddEvent,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-b border-border bg-surface ${className}`}>
      
      {/* Left side: Date Titles */}
      <div className="flex flex-col items-start w-full sm:w-auto">
        <div className="flex items-center gap-2">
           <h2 className="text-xl font-bold text-text-primary tracking-tight">{title}</h2>
           {subtitle && <span className="text-sm font-medium text-text-tertiary px-2 py-0.5 bg-subtle rounded-md border border-border">{subtitle}</span>}
        </div>
        {dateRange && <p className="text-sm text-text-secondary mt-1">{dateRange}</p>}
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        
        {/* Navigation Wrapper */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={onPrev} className="px-2">
            <Icon icon={ArrowLeftIcon} size="sm" />
          </Button>
          <Button variant="secondary" onClick={onNext} className="px-2">
            <Icon icon={ArrowRightIcon} size="sm" />
          </Button>
          <Button variant="secondary" onClick={onToday}>
            Today
          </Button>
        </div>

        {/* View Mode Dropdown / Select Mock */}
        <div className="shrink-0">
           <select 
             value={viewMode}
             onChange={(e) => onViewModeChange(e.target.value as any)}
             className="h-10 px-3 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand hover:bg-subtle transition-colors cursor-pointer"
           >
             <option value="month">Month view</option>
             <option value="week">Week view</option>
             <option value="day">Day view</option>
           </select>
        </div>

        {/* Add Event Action */}
        {onAddEvent && (
          <Button variant="primary" onClick={onAddEvent} className="shrink-0">
             <Icon icon={PlusIcon} size="sm" className="mr-1.5" /> Add event
          </Button>
        )}

      </div>
    </div>
  );
};
