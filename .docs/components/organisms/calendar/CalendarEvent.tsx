"use client";
import React from "react";
import { Avatar } from "@/components/atoms/Avatar";

export interface CalendarEventProps {
  title: string;
  time?: string;
  color?: "brand" | "success" | "warning" | "danger" | "gray" | "purple" | "blue";
  avatars?: string[]; // Array of avatar URLs to mock overlapping attendees
  isFill?: boolean; // True for block events, False for subtle translucent pills
  className?: string;
  onClick?: () => void;
}

export const CalendarEvent: React.FC<CalendarEventProps> = ({
  title,
  time,
  color = "brand",
  avatars = [],
  isFill = false,
  className = "",
  onClick,
}) => {
  const colorMap = {
    brand: isFill ? "bg-brand text-white border-brand" : "bg-brand/10 text-brand border-brand/20 hover:bg-brand/20",
    success: isFill ? "bg-status-success-bg text-status-success-text border-status-success-border" : "bg-status-success-bg/50 text-status-success-text border-status-success-border/50 hover:bg-status-success-bg",
    warning: isFill ? "bg-status-warning-bg text-status-warning-text border-status-warning-border" : "bg-status-warning-bg/50 text-status-warning-text border-status-warning-border/50 hover:bg-status-warning-bg",
    danger: isFill ? "bg-status-danger-bg text-status-danger-text border-status-danger-border" : "bg-status-danger-bg/50 text-status-danger-text border-status-danger-border/50 hover:bg-status-danger-bg",
    gray: isFill ? "bg-text-secondary text-white border-bg-disabled" : "bg-subtle text-text-secondary border-border hover:bg-border/30",
    purple: isFill ? "bg-[#8A2BE2] text-white border-[#8A2BE2]" : "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]/20 hover:bg-[#8A2BE2]/20",
    blue: isFill ? "bg-[#00BFFF] text-white border-[#00BFFF]" : "bg-[#00BFFF]/10 text-[#00BFFF] border-[#00BFFF]/20 hover:bg-[#00BFFF]/20",
  }[color];

  return (
    <div 
      onClick={onClick}
      className={`
        flex flex-col gap-1 w-full px-2 py-1.5 rounded-md border text-xs font-semibold cursor-pointer transition-colors overflow-hidden
        ${colorMap} ${className}
      `}
    >
      <div className="flex items-center justify-between gap-2 overflow-hidden">
        <span className="truncate max-w-full">{title}</span>
        {time && (
          <span className={`shrink-0 text-[10px] ${isFill ? "opacity-80" : "opacity-60"}`}>
            {time}
          </span>
        )}
      </div>

      {/* Render Attendees if supplied */}
      {avatars.length > 0 && (
        <div className="flex -space-x-1.5 mt-0.5">
          {avatars.map((src, i) => (
             <div key={i} className={`w-4 h-4 rounded-full border border-white overflow-hidden ${isFill ? "border-brand" : "border-surface"}`}>
               <img src={src} className="w-full h-full object-cover" />
             </div>
          ))}
        </div>
      )}
    </div>
  );
};
