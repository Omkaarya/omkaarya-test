"use client";
import React, { useEffect } from "react";
import { Icon } from "@/components/atoms/Icon";
import { Button } from "@/components/atoms/Button";
import { XCloseIcon } from "@/icons/duotone";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: any;
  iconColor?: "primary" | "success" | "warning" | "danger" | "brand";
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconColor = "brand",
  children,
  footer,
  size = "md",
  align = "left",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[size];

  const bgColorClass = {
    primary: "bg-surface text-text-primary border-border",
    success: "bg-status-success-bg text-status-success-text border-status-success-border",
    warning: "bg-status-warning-bg text-status-warning-text border-status-warning-border",
    danger: "bg-status-danger-bg text-status-danger-text border-status-danger-border",
    brand: "bg-brand/10 text-brand border-brand/20",
  }[iconColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Surface */}
      <div 
        className={`
          relative bg-surface rounded-2xl shadow-2xl border border-border w-full flex flex-col overflow-hidden max-h-[90vh]
          transform transition-all ${sizeClass}
        `}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-text-tertiary hover:text-text-secondary hover:bg-subtle rounded-md transition-colors"
        >
          <Icon icon={XCloseIcon} size="sm" />
        </button>

        {/* Header Block */}
        <div className={`p-6 pb-4 sm:p-8 sm:pb-5 ${align === "center" ? "text-center flex flex-col items-center" : "text-left"}`}>
          {icon && (
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-xs mb-5 ${bgColorClass}`}>
               <Icon icon={icon} size="lg" />
            </div>
          )}
          {title && (
            <h2 className="text-xl font-bold text-text-primary mb-2 tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Body content */}
        <div className="px-6 sm:px-8 py-2 overflow-y-auto">
          {children}
        </div>

        {/* Footer Block */}
        {footer && (
          <div className="mt-6 px-6 py-5 sm:px-8 border-t border-border bg-subtle/30 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
             {footer}
          </div>
        )}
      </div>
    </div>
  );
};
