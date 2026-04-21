import React from "react";
import { Button } from "@/components/atoms/Button";

export interface EmptyStateProps {
  illustration?: React.ReactNode;
  icon?: any; // e.g. from duotone
  title: string;
  description?: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "",
}) => {
  // If an icon is provided instead of a full illustration, we wrap it in a faint stylized circle to match the Figma aesthetics
  const renderIllustration = () => {
    if (illustration) return illustration;
    if (icon) {
      const IconComp = icon;
      return (
        <div className="relative flex items-center justify-center w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-subtle rounded-full border-[6px] border-surface mix-blend-multiply" />
          <div className="absolute -inset-4 bg-subtle/30 rounded-full border border-border/50" />
          <IconComp className="w-8 h-8 text-text-tertiary relative z-10" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 w-full h-full min-h-[400px] border border-dashed border-border rounded-xl bg-surface/50 ${className}`}>
      
      {renderIllustration()}

      <h3 className="text-lg font-semibold text-text-primary mt-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-text-secondary mt-2 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 mt-8">
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button variant="primary" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
