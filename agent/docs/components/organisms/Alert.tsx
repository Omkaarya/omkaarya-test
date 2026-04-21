"use client";
import React from "react";
import { Icon } from "@/components/atoms/Icon";
import { Button } from "@/components/atoms/Button";
import { 
  InfoCircleIcon, 
  CheckCircle02Icon, 
  AlertTriangleIcon, 
  AlertCircleIcon, 
  XCloseIcon 
} from "@/icons/duotone";
import { Avatar } from "@/components/atoms/Avatar";

export type AlertType = "info" | "success" | "warning" | "error";

interface BaseAlertNotificationProps {
  type?: AlertType;
  title: React.ReactNode;
  description?: React.ReactNode;
  onDismiss?: () => void;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

const typeConfig = {
  info: {
    icon: InfoCircleIcon,
    bgClass: "bg-surface",
    borderClass: "border-border",
    iconClass: "text-text-secondary",
    leftBorderClass: "border-l-text-tertiary",
  },
  success: {
    icon: CheckCircle02Icon,
    bgClass: "bg-status-success-bg",
    borderClass: "border-status-success-border",
    iconClass: "text-status-success-text",
    leftBorderClass: "border-l-status-success-text",
  },
  warning: {
    icon: AlertTriangleIcon,
    bgClass: "bg-status-warning-bg",
    borderClass: "border-status-warning-border",
    iconClass: "text-status-warning-text",
    leftBorderClass: "border-l-status-warning-text",
  },
  error: {
    icon: AlertCircleIcon,
    bgClass: "bg-status-danger-bg",
    borderClass: "border-status-danger-border",
    iconClass: "text-status-danger-text",
    leftBorderClass: "border-l-status-danger-text",
  },
};

// ─── Inline Alert ─────────────────────────────────────────────────
export const Alert: React.FC<BaseAlertNotificationProps> = ({
  type = "info",
  title,
  description,
  onDismiss,
  primaryAction,
  secondaryAction,
  className = "",
}) => {
  const config = typeConfig[type];

  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-xl border ${config.bgClass} ${config.borderClass} ${className}`}>
      {/* Left colored accent bar - if using the specific Figma style variant */}
      
      <div className="shrink-0 mt-0.5">
        <Icon icon={config.icon} size="md" className={config.iconClass} />
      </div>
      
      <div className="flex-1 min-w-0 pr-6">
        <h4 className={`text-sm font-semibold mb-1 ${type === "info" ? "text-text-primary" : config.iconClass}`}>
          {title}
        </h4>
        {description && (
          <div className="text-sm text-text-secondary leading-relaxed mb-3">
            {description}
          </div>
        )}
        
        {/* Actions layout matching Figma text-links */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-4 mt-2">
            {secondaryAction && (
              <button 
                onClick={secondaryAction.onClick}
                className="text-sm font-medium text-text-tertiary hover:text-text-secondary"
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button 
                onClick={primaryAction.onClick}
                className={`text-sm font-semibold hover:opacity-80 transition-opacity ${type === "info" ? "text-brand" : config.iconClass}`}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>

      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <Icon icon={XCloseIcon} size="sm" />
        </button>
      )}
    </div>
  );
};

// ─── Floating Toast Notification ──────────────────────────────────
export interface ToastNotificationProps extends BaseAlertNotificationProps {
  avatar?: string;
  avatarInitials?: string;
  timestamp?: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  type = "info",
  title,
  description,
  avatar,
  avatarInitials,
  timestamp,
  onDismiss,
  primaryAction,
  secondaryAction,
  className = "",
}) => {
  const config = typeConfig[type];

  return (
    <div className={`relative flex items-start gap-4 p-4 bg-surface border border-border shadow-lg rounded-xl max-w-sm w-full ${className}`}>
      
      <div className="shrink-0 mt-1">
        {avatar || avatarInitials ? (
          <Avatar src={avatar} initials={avatarInitials} size="md" />
        ) : (
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${config.bgClass}`}>
            <Icon icon={config.icon} size="md" className={config.iconClass} />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0 pr-6">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-text-primary leading-tight">
            {title}
          </p>
        </div>
        
        {description && (
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            {description}
          </p>
        )}

        {(primaryAction || secondaryAction || timestamp) && (
          <div className="flex items-center gap-3 mt-1">
            {secondaryAction && (
              <button 
                onClick={secondaryAction.onClick}
                className="text-sm font-medium text-text-tertiary hover:text-text-secondary"
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button 
                onClick={primaryAction.onClick}
                className="text-sm font-semibold text-brand hover:opacity-80 transition-opacity"
              >
                {primaryAction.label}
              </button>
            )}
            {timestamp && <span className="text-xs text-text-tertiary ml-auto">{timestamp}</span>}
          </div>
        )}
      </div>

      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <Icon icon={XCloseIcon} size="sm" />
        </button>
      )}
    </div>
  );
};
