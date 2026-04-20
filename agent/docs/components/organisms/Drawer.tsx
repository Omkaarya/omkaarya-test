"use client";
import React, { useEffect } from "react";
import { Icon } from "@/components/atoms/Icon";
import { Button } from "@/components/atoms/Button";
import { XCloseIcon } from "@/icons/duotone";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className = "",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const sizeClass = {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
    xl: "max-w-xl",
  }[size];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 flex flex-col bg-surface shadow-2xl border-l border-border transform transition-transform duration-300 w-full ${sizeClass} ${className} ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div className="flex flex-col pr-4">
            <h2 className="text-lg font-bold text-text-primary mb-1">{title}</h2>
            {description && (
              <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-secondary hover:bg-subtle rounded-md transition-colors shrink-0"
          >
            <Icon icon={XCloseIcon} size="md" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="px-6 py-5 border-t border-border bg-subtle/30 flex items-center justify-end gap-3 mt-auto">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
