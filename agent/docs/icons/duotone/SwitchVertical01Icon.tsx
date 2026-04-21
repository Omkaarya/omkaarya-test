import React from "react";

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

export const SwitchVertical01Icon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props} xmlns="http://www.w3.org/2000/svg">
<path d="M17 4V20M17 20L13 16M17 20L21 16M7 20V4M7 4L3 8M7 4L11 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

SwitchVertical01Icon.displayName = "SwitchVertical01Icon";
