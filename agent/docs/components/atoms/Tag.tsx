import React from "react";
import { BadgeColor } from "./Badge";
import { Avatar } from "./Avatar";

export interface TagProps {
  children: React.ReactNode;
  color?: BadgeColor | "default" | "dark";
  variant?: "solid" | "outline";
  leadingIcon?: React.ReactNode;
  dotColor?: BadgeColor | "default";
  avatarSrc?: string;
  avatarInitials?: string;
  onDismiss?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  className?: string; // Additional classes
}

const colorMap = {
  solid: {
    default: "bg-surface border-border text-text-secondary hover:bg-subtle",
    dark:    "bg-gray-800 border-gray-900 text-white hover:bg-gray-700",
    gray:    "bg-subtle border-border text-text-secondary hover:bg-bg-muted",
    brand:   "bg-bg-brand-secondary border-border-brand text-text-brand hover:bg-brand-muted",
    error:   "bg-status-danger-bg border-border-error text-status-danger-text hover:bg-red-100",
    warning: "bg-status-warning-bg border-border text-status-warning-text hover:bg-yellow-100",
    success: "bg-status-success-bg border-border text-status-success-text hover:bg-green-100",
    blue:    "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    indigo:  "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
    purple:  "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
    pink:    "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100",
    orange:  "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
  },
  outline: {
    default: "bg-transparent border-text-tertiary text-text-secondary hover:bg-surface",
    dark:    "bg-transparent border-gray-800 text-text-secondary hover:bg-secondary",
    gray:    "bg-transparent border-text-tertiary text-text-secondary hover:bg-subtle",
    brand:   "bg-transparent border-brand text-text-brand hover:bg-bg-brand-secondary",
    error:   "bg-transparent border-bg-error-solid text-status-danger-text hover:bg-status-danger-bg",
    warning: "bg-transparent border-bg-warning-solid text-status-warning-text hover:bg-status-warning-bg",
    success: "bg-transparent border-bg-success-solid text-status-success-text hover:bg-status-success-bg",
    blue:    "bg-transparent border-brand text-blue-700 hover:bg-blue-50",
    indigo:  "bg-transparent border-indigo-500 text-indigo-700 hover:bg-indigo-50",
    purple:  "bg-transparent border-purple-500 text-purple-700 hover:bg-purple-50",
    pink:    "bg-transparent border-pink-500 text-pink-700 hover:bg-pink-50",
    orange:  "bg-transparent border-orange-500 text-orange-700 hover:bg-orange-50",
  }
};

const dotColors = {
  default: "bg-text-tertiary",
  gray:    "bg-text-secondary",
  brand:   "bg-brand",
  error:   "bg-status-danger-text",
  warning: "bg-status-warning-text",
  success: "bg-status-success-text",
  blue:    "bg-brand-primary",
  indigo:  "bg-indigo-500",
  purple:  "bg-purple-500",
  pink:    "bg-pink-500",
  orange:  "bg-orange-500",
};

export const Tag: React.FC<TagProps> = ({
  children,
  color = "default",
  variant = "solid",
  leadingIcon,
  dotColor,
  avatarSrc,
  avatarInitials,
  onDismiss,
  onClick,
  disabled = false,
  className = "",
}) => {
  const isInteractive = !!onClick && !disabled;
  const hasAvatar = !!avatarSrc || !!avatarInitials;

  return (
    <span
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={isInteractive ? (e) => e.key === "Enter" && onClick?.() : undefined}
      className={`
        inline-flex items-center
        ${hasAvatar ? "pl-1 pr-3" : "px-3"} py-1 
        rounded-full border text-xs font-medium gap-1.5
        transition-colors duration-150
        ${colorMap[variant][color]}
        ${disabled ? "opacity-50 cursor-not-allowed" : isInteractive ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {hasAvatar && (
        <Avatar src={avatarSrc} initials={avatarInitials} size="xs" className="mr-0.5" />
      )}
      {dotColor && !hasAvatar && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[dotColor]}`} />
      )}
      {leadingIcon && !hasAvatar && (
        <span className="shrink-0 h-3.5 w-3.5 flex items-center justify-center">
          {leadingIcon}
        </span>
      )}
      {children}
      {onDismiss && !disabled && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="shrink-0 rounded-full hover:opacity-70 transition-opacity -mr-1 ml-0.5"
          aria-label="Remove"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};
