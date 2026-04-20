import React from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { CheckCircle02Icon, File02Icon } from "@/icons/duotone";

export interface InlineCardProps {
  className?: string;
  children: React.ReactNode;
}

const BaseInlineCard: React.FC<InlineCardProps> = ({ children, className = "" }) => (
  <div className={`w-full bg-surface border border-border rounded-xl overflow-hidden shadow-xs ${className}`}>
    {children}
  </div>
);

// ─── Update / Notification Card ──────────────────────────────────
export const InlineUpdateCard: React.FC<{
  title: string;
  description: string;
  imageUrl?: string;
  onDismiss: () => void;
  onAction: () => void;
  actionLabel?: string;
}> = ({ title, description, imageUrl, onDismiss, onAction, actionLabel = "Changelog" }) => (
  <BaseInlineCard className="flex flex-col sm:flex-row p-6 gap-6 items-start sm:items-center">
    {imageUrl && (
      <div className="shrink-0 w-full sm:w-32 h-32 sm:h-24 rounded-lg bg-subtle overflow-hidden">
         <img src={imageUrl} alt="Update" className="w-full h-full object-cover" />
      </div>
    )}
    <div className="flex-1 min-w-0">
       <h4 className="text-base font-semibold text-text-primary mb-1">{title}</h4>
       <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
       <Button variant="secondary" onClick={onDismiss} className="flex-1 sm:flex-none">Dismiss</Button>
       <Button variant="primary" onClick={onAction} className="flex-1 sm:flex-none">{actionLabel}</Button>
    </div>
  </BaseInlineCard>
);

// ─── Upgrade Plan Card ──────────────────────────────────────────
export const InlineUpgradeCard: React.FC<{
  title: string;
  description: string;
  features: string[];
  onUpgrade: () => void;
  onViewPlans?: () => void;
}> = ({ title, description, features, onUpgrade, onViewPlans }) => (
  <BaseInlineCard className="p-6">
    <div className="flex flex-col mb-4">
       <h4 className="text-base font-semibold text-text-primary mb-1">{title}</h4>
       <p className="text-sm text-text-secondary">{description}</p>
    </div>
    
    <div className="space-y-3 mb-6">
      {features.map((feature, i) => (
        <div key={i} className="flex items-start gap-3">
          <Icon icon={CheckCircle02Icon} size="sm" className="text-status-success-text mt-0.5 shrink-0" />
          <span className="text-sm text-text-secondary leading-snug">{feature}</span>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-3 border-t border-border pt-4">
       {onViewPlans && <Button variant="secondary" onClick={onViewPlans}>All plans</Button>}
       <Button variant="primary" onClick={onUpgrade}>Upgrade plan</Button>
    </div>
  </BaseInlineCard>
);

// ─── Payment / Receipt Row ──────────────────────────────────────
export const InlinePaymentRow: React.FC<{
  title: string;
  subtitle: string;
  logo: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}> = ({ title, subtitle, logo, actionLabel, onAction }) => (
  <BaseInlineCard className="p-4 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-12 h-8 rounded shrink-0 border border-border bg-subtle flex items-center justify-center">
        {logo}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-text-primary truncate">{title}</span>
        <span className="text-xs text-text-tertiary truncate">{subtitle}</span>
      </div>
    </div>
    <Button variant="secondary" size="sm" onClick={onAction}>{actionLabel}</Button>
  </BaseInlineCard>
);
