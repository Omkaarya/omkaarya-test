"use client";
import React from "react";

export interface DayData {
  dateBox: string; // e.g. "1", "31"
  isCurrentMonth?: boolean;
  isToday?: boolean;
  events?: React.ReactNode[];
}

export interface CalendarMonthProps {
  days: DayData[];
  className?: string;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({ days, className = "" }) => {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`w-full bg-surface border border-border sm:rounded-xl overflow-hidden flex flex-col shadow-xs ${className}`}>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border bg-subtle">
        {weekDays.map((day) => (
          <div key={day} className="py-2.5 text-center text-xs font-semibold text-text-tertiary uppercase tracking-wider border-r border-border last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 flex-1 min-h-[600px] bg-surface">
        {days.map((day, idx) => (
          <div 
            key={idx}
            className={`
              min-h-[120px] p-2 border-b border-r border-border hover:bg-subtle/30 transition-colors flex flex-col gap-1.5 overflow-hidden
              ${idx % 7 === 6 ? "border-r-0" : ""}
              ${!day.isCurrentMonth ? "bg-subtle/50 text-text-disabled" : "text-text-primary"}
            `}
          >
            {/* Date Number Header */}
            <div className="flex items-center justify-between">
               <span 
                 className={`
                   w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold
                   ${day.isToday ? "bg-brand text-white shadow-sm" : ""}
                 `}
               >
                 {day.dateBox}
               </span>
               {day.isToday && <span className="w-1.5 h-1.5 rounded-full bg-brand mr-1" />}
            </div>

            {/* Event Stack */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {day.events && day.events.map((evt, eIdx) => (
                <div key={eIdx}>{evt}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
