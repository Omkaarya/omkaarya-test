"use client";
import React, { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons/duotone";

export interface CalendarRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (range: { start: string; end: string }) => void;
}

export const CalendarRangeModal: React.FC<CalendarRangeModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [activeShortcut, setActiveShortcut] = useState("Last 30 days");

  if (!isOpen) return null;

  const shortcuts = [
    "Today",
    "Yesterday",
    "This week",
    "Last week",
    "This month",
    "Last month",
    "This year",
    "Last year",
    "All time"
  ];

  // A mock Calendar Month Renderer demonstrating how the standard 7x5 grid maps to our specific styling.
  const CalendarMonth = ({ monthName }: { monthName: string }) => (
    <div className="w-full sm:w-64">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button className="p-1 hover:bg-subtle rounded-md text-text-tertiary">
          <Icon icon={ChevronLeftIcon} size="sm" />
        </button>
        <span className="text-sm font-semibold text-text-primary">{monthName}</span>
        <button className="p-1 hover:bg-subtle rounded-md text-text-tertiary">
          <Icon icon={ChevronRightIcon} size="sm" />
        </button>
      </div>
      
      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-text-tertiary">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => <div key={d}>{d}</div>)}
      </div>
      
      {/* Days Grid - Mocking a partial selection range */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-0 relative">
        {/* We assume a 35 day grid for standard look */}
        {Array.from({ length: 35 }).map((_, i) => {
          const dayNum = (i % 30) + 1;
          const isSelectedRange = monthName === "February 2024" && dayNum >= 12 && dayNum <= 18;
          const isStart = monthName === "February 2024" && dayNum === 12;
          const isEnd = monthName === "February 2024" && dayNum === 18;
          const isToday = monthName === "January 2024" && dayNum === 5;

          return (
            <div key={i} className="relative flex justify-center py-0.5 z-10">
              {/* Range Background */}
              {isSelectedRange && !isStart && !isEnd && (
                <div className="absolute inset-y-0.5 inset-x-0 bg-brand/10 -z-10" />
              )}
              {isStart && (
                <div className="absolute inset-y-0.5 right-0 left-1/2 bg-brand/10 -z-10" />
              )}
              {isEnd && (
                <div className="absolute inset-y-0.5 left-0 right-1/2 bg-brand/10 -z-10" />
              )}
              
              <button
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
                  ${isStart || isEnd ? "bg-brand text-white font-semibold shadow-md" : ""}
                  ${isSelectedRange && !isStart && !isEnd ? "text-text-primary font-medium" : ""}
                  ${!isSelectedRange && !isStart && !isEnd ? "text-text-secondary hover:bg-subtle" : ""}
                  ${isToday && !isSelectedRange ? "text-brand font-semibold" : ""}
                `}
              >
                {dayNum}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface rounded-2xl shadow-xl border border-border flex flex-col md:flex-row overflow-hidden max-w-4xl w-full">
        
        {/* Left Sidebar Shortcuts */}
        <div className="md:w-56 bg-subtle/30 border-r border-border p-4 flex flex-col gap-1 overflow-y-auto">
           {shortcuts.map(s => (
             <button
               key={s}
               onClick={() => setActiveShortcut(s)}
               className={`
                 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-medium
                 ${activeShortcut === s 
                   ? "bg-surface shadow-xs border border-border/50 text-text-primary" 
                   : "text-text-secondary hover:text-text-primary hover:bg-subtle"}
               `}
             >
               {s}
             </button>
           ))}
        </div>

        {/* Right Calendar Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 flex flex-col sm:flex-row gap-8 items-start justify-center">
             <CalendarMonth monthName="January 2024" />
             <CalendarMonth monthName="February 2024" />
          </div>

          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface sm:justify-end">
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Mock Date Inputs */}
              <div className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary w-full sm:w-32 bg-subtle/50 text-center">
                Jan 12, 2024
              </div>
              <span className="text-text-tertiary flex items-center">-</span>
              <div className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary w-full sm:w-32 bg-subtle/50 text-center">
                Feb 18, 2024
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
               <Button variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">Cancel</Button>
               <Button variant="primary" onClick={() => { onApply?.({ start: "2024-01-12", end: "2024-02-18" }); onClose(); }} className="flex-1 sm:flex-none">Apply</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
