import React from "react";

// ─── Types ────────────────────────────────────────────────────────
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
export type IconColor =
  | "brand" | "primary" | "secondary" | "tertiary"
  | "success" | "warning" | "danger" | "info" | "inherit";

export interface IconProps {
  /** The Pepul Dualtone icon component */
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  size?: IconSize;
  color?: IconColor;
  /** Override opacity of the secondary layer (dualtone effect) */
  secondaryOpacity?: number;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

// ─── Size map ─────────────────────────────────────────────────────
const sizeMap: Record<IconSize, string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

// ─── Color map ────────────────────────────────────────────────────
const colorMap: Record<IconColor, string> = {
  brand:     "text-brand",
  primary:   "text-fg-primary",
  secondary: "text-fg-secondary",
  tertiary:  "text-fg-tertiary",
  success:   "text-fg-success",
  warning:   "text-fg-warning",
  danger:    "text-fg-error",
  info:      "text-brand-primary",
  inherit:   "text-current",
};

// ─── Icon ─────────────────────────────────────────────────────────
// Usage:
//   import { HomeIcon } from "@/icons/dualtone";
//   <Icon icon={HomeIcon} size="md" color="brand" />
export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = "md",
  color = "inherit",
  className = "",
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden = !ariaLabel,
}) => (
  <IconComponent
    className={`shrink-0 ${sizeMap[size]} ${colorMap[color]} ${className}`}
    aria-label={ariaLabel}
    aria-hidden={ariaHidden}
  />
);

// ─── Usage example (for reference) ───────────────────────────────
//
// import { BuildingTempleIcon } from "@/icons/dualtone";
// import { Icon } from "@/components/atoms";
//
// <Icon icon={BuildingTempleIcon} size="lg" color="brand" />
//
