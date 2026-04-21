"use client";
import React from "react";

export interface TimeEvent {
  id: string;
  // Position mapped arbitrarily from 0 to 100 for height and top, or passed via CSS maps
  topPercentage: number;
  heightPercentage: number;
  content: React.ReactNode;
}

export interface DayColumn {
  dateLabel: string; // e.g. "8", "15"
  dayLabel: string;  // e.g. "Mon", "Tue"
  isToday?: boolean;
  events: TimeEvent[];
}

export interface CalendarTimeGridProps {
  timeSlots: string[]; // e.g. ["8 AM", "9 AM", "10 AM", ... "5 PM"]
  columns: DayColumn[];
  className?: string;
  hourHeight?: number; // Adjust if you want taller hours. Default is 64px.
}

export const CalendarTimeGrid: React.FC<CalendarTimeGridProps> = ({
  timeSlots,
  columns,
  className = "",
  hourHeight = 64,
}) => {
  return (
    <div className={`flex flex-col bg-surface border border-border sm:rounded-xl shadow-xs overflow-hidden ${className}`}>
      
      {/* Top Header Row (Axes Offset) */}
      <div className="flex border-b border-border bg-subtle">
        {/* Top left empty corner for Time Axis */}
        <div className="w-20 shrink-0 border-r border-border" />
        
        {/* Day Column Headers */}
        <div className="flex flex-1">
          {columns.map((col, idx) => (
            <div key={idx} className="flex-1 py-3 flex flex-col items-center justify-center border-r border-border last:border-r-0">
               <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${col.isToday ? "text-brand" : "text-text-tertiary"}`}>
                 {col.dayLabel}
               </span>
               <span className={`
                 w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold
                 ${col.isToday ? "bg-brand text-white shadow-sm" : "text-text-primary"}
               `}>
                 {col.dateLabel}
               </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Area (Scrollable if needed) */}
      <div className="flex flex-1 overflow-y-auto relative bg-surface min-h-[600px]">
        
        {/* Y Axis: Time Labels */}
        <div className="w-20 shrink-0 border-r border-border flex flex-col relative bg-surface z-10 text-right pr-2">
          {timeSlots.map((time, idx) => (
            <div key={idx} style={{ height: `${hourHeight}px` }} className="relative text-xs text-text-tertiary font-medium -mt-2.5 pt-px">
              {time}
            </div>
          ))}
        </div>

        {/* X Axis: Day Columns + Horizontal Lines */}
        <div className="flex-1 relative flex">
          
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
             {timeSlots.map((_, idx) => (
               <div key={`line-${idx}`} style={{ height: `${hourHeight}px` }} className="border-b border-subtle/50 w-full" />
             ))}
          </div>

          {/* Actual Columns with events */}
          {columns.map((col, cIdx) => (
            <div key={cIdx} className="flex-1 relative border-r border-border last:border-r-0 z-10 group">
               {/* Hover interact block to show selection capability */}
               <div className="absolute inset-0 pointer-events-none group-hover:bg-subtle/20 transition-colors" />

               {/* Render absolute events */}
               {col.events.map((evt) => (
                 <div
                   key={evt.id}
                   className="absolute left-1 right-1 px-0.5"
                   style={{
                     top: `${evt.topPercentage}%`,
                     height: `${evt.heightPercentage}%`,
                   }}
                 >
                   {evt.content}
                 </div>
               ))}
            </div>
          ))}

          {/* Optional Current Time indicator line (e.g. red line at 40% height) */}
          <div className="absolute left-0 right-0 h-px bg-brand z-20 pointer-events-none" style={{ top: "45%" }}>
            <div className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-brand shadow-sm" />
          </div>

        </div>

      </div>

    </div>
  );
};
