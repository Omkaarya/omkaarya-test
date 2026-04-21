import React from "react";

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

export const AlignCenterIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props} xmlns="http://www.w3.org/2000/svg">
<path d="M18 10H6M21 6H3M21 14H3M18 18H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

AlignCenterIcon.displayName = "AlignCenterIcon";
