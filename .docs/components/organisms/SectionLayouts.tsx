import React from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { DotsVerticalIcon } from "@/icons/duotone";

// ─── Section Header ───────────────────────────────────────────────
export interface SectionHeaderProps {
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  tertiaryAction?: { label: string; onClick: () => void };
  showMenu?: boolean;
  bottomSlot?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  showMenu,
  bottomSlot,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-4 py-5 border-b border-border ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Left Content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h3>
          </div>
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {tertiaryAction && (
             <Button variant="ghost" onClick={tertiaryAction.onClick}>{tertiaryAction.label}</Button>
          )}
          {secondaryAction && (
             <Button variant="secondary" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
          )}
          {primaryAction && (
             <Button variant="primary" onClick={primaryAction.onClick}>{primaryAction.label}</Button>
          )}
          {showMenu && (
             <button className="p-2 text-text-tertiary hover:text-text-primary rounded-md hover:bg-subtle transition-colors">
               <Icon icon={DotsVerticalIcon} size="md" />
             </button>
          )}
        </div>
      </div>

      {bottomSlot && (
        <div className="mt-2 text-sm">
          {bottomSlot}
        </div>
      )}
    </div>
  );
};

// ─── Section Footer ───────────────────────────────────────────────
export interface SectionFooterProps {
  leftControls?: React.ReactNode; // Usually a segmented control
  middleText?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  tertiaryAction?: { label: string; onClick: () => void };
  className?: string;
}

export const SectionFooter: React.FC<SectionFooterProps> = ({
  leftControls,
  middleText,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  className = "",
}) => {
  return (
    <div className={`py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border bg-surface ${className}`}>
      
      {/* Left Area (Segmented / Date filters) */}
      <div className="flex items-center flex-1 min-w-0 pr-4">
        {leftControls}
        {middleText && (
          <span className="text-sm font-semibold text-text-tertiary hover:text-text-secondary cursor-pointer transition-colors ml-4 whitespace-nowrap">
            {middleText}
          </span>
        )}
      </div>

      {/* Right Area (Action Buttons) */}
      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
         {tertiaryAction && (
            <Button variant="ghost" onClick={tertiaryAction.onClick}>{tertiaryAction.label}</Button>
         )}
         {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
         )}
         {primaryAction && (
            <Button variant="primary" onClick={primaryAction.onClick}>{primaryAction.label}</Button>
         )}
      </div>

    </div>
  );
};
