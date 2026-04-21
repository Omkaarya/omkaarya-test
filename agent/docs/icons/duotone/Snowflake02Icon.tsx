import React from "react";

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

export const Snowflake02Icon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props} xmlns="http://www.w3.org/2000/svg">
<path d="M12 8V16M12 8V2M12 8L7 3M12 8L17 3M12 16V22M12 16L7 21M12 16L17 21M16 12H8M16 12H22M16 12L21 7M16 12L21 17M8 12H2M8 12L3 7M8 12L3 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

Snowflake02Icon.displayName = "Snowflake02Icon";
