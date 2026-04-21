import React from "react";

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

export const ArrowNarrowUpLeftIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props} xmlns="http://www.w3.org/2000/svg">
<path d="M18 18L6 6M6 6V14M6 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

ArrowNarrowUpLeftIcon.displayName = "ArrowNarrowUpLeftIcon";
