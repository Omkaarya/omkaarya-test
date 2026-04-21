"use client";
import React from "react";
import { Tooltip, TooltipProps } from "@/components/atoms/Tooltip";
import { Icon } from "@/components/atoms/Icon";
import { HelpCircleIcon } from "@/icons/duotone";

export interface HelpTooltipProps extends Omit<TooltipProps, "children"> {
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  placement = "top",
  iconSize = "sm",
  className = "",
  ...props
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Tooltip content={content} placement={placement} {...props}>
        <button 
          type="button" 
          className="text-text-tertiary hover:text-text-secondary transition-colors focus:outline-none rounded-full focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Icon icon={HelpCircleIcon} size={iconSize} />
        </button>
      </Tooltip>
    </div>
  );
};
