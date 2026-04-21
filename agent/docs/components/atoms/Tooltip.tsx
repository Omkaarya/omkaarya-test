"use client";
import React, { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
}

// ─── Placement styles ─────────────────────────────────────────────
const placementStyles: Record<TooltipPlacement, { tooltip: string; arrow: string }> = {
  top: {
    tooltip: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    arrow:   "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900",
  },
  bottom: {
    tooltip: "top-full left-1/2 -translate-x-1/2 mt-2",
    arrow:   "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900",
  },
  left: {
    tooltip: "right-full top-1/2 -translate-y-1/2 mr-2",
    arrow:   "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900",
  },
  right: {
    tooltip: "left-full top-1/2 -translate-y-1/2 ml-2",
    arrow:   "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900",
  },
};

// ─── Tooltip ─────────────────────────────────────────────────────
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  delay = 300,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { tooltip, arrow } = placementStyles[placement];

  const show = () => {
    if (disabled) return;
    timer.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}

      {visible && (
        <div
          role="tooltip"
          className={`
            absolute z-50 whitespace-nowrap
            px-3 py-1.5 rounded-lg
            bg-gray-900 text-white text-xs font-medium
            shadow-lg pointer-events-none
            animate-in fade-in-0 zoom-in-95 duration-100
            ${tooltip}
          `}
        >
          {content}
          {/* Arrow */}
          <span
            className={`absolute w-0 h-0 border-4 ${arrow}`}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
};
