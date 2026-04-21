import React from "react";

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

export const BluetoothOnIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props} xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" d="M18 17L12 22V12V2L18 7L12 12L18 17Z" fill="currentColor"/>
<path d="M6 7L18 17L12 22V2L18 7L6 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

BluetoothOnIcon.displayName = "BluetoothOnIcon";
