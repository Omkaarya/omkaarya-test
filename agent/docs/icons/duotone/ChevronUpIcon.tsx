import React from "react";

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

export const ChevronUpIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props} xmlns="http://www.w3.org/2000/svg">
<path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

ChevronUpIcon.displayName = "ChevronUpIcon";
