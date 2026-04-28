import React from "react";
import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Check, Minus } from "lucide-react";

export interface PricingFeature {
  id: string | number;
  name: string;
  included: boolean;
}

export interface PricingPlanCardProps {
  id: string;
  name: string;
  price: string | number;
  billingCycle: "monthly" | "yearly";
  setupFee: string | number;
  trialText?: string;
  description: string;
  isAnnual: boolean;
  onToggleAnnual?: (isAnnual: boolean) => void;
  features: PricingFeature[];
  isSelected?: boolean;
  onSelect?: () => void;
  ctaText?: string;
  badgeText?: string;
  className?: string;
}

export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  id,
  name,
  price,
  billingCycle,
  setupFee,
  trialText = "14-days free trial",
  description,
  isAnnual,
  onToggleAnnual,
  features,
  isSelected = false,
  onSelect,
  ctaText = "Select",
  badgeText,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col bg-white rounded-xl shadow-sm transition-all duration-200 overflow-hidden ${
        isSelected ? "border-[2px] border-[var(--brand-primary)]" : "border border-border"
      } ${className}`}
    >
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary">{name}</h3>
          {badgeText && (
            <span className="px-3 py-1 bg-subtle text-text-secondary text-xs font-semibold rounded-full border border-border">
              {badgeText}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-4 flex items-baseline">
          <span className="text-4xl md:text-5xl font-bold text-text-primary">
            {typeof price === "number" ? `$${price}` : price}
          </span>
          <span className="text-text-secondary text-sm font-medium ml-1">
            /{billingCycle}
          </span>
        </div>

        {/* Setup Fee */}
        <div className="bg-surface-subtle rounded-lg px-4 py-3 flex justify-between items-center mb-6 border border-border">
          <span className="text-sm text-text-secondary font-medium">
            Onboarding & Setup fee
          </span>
          <span className="text-sm font-bold text-text-primary">
            {typeof setupFee === "number" ? `$${setupFee}` : setupFee}
          </span>
        </div>

        {/* Trial Badge */}
        {trialText && (
          <div className="mb-6">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-status-success-bg text-status-success-text border border-status-success-bg/50">
              {trialText}
            </span>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm font-medium text-text-primary mb-1">Description:</p>
          <p className="text-sm text-text-secondary leading-relaxed h-[60px]">
            {description}
          </p>
        </div>

        {/* Toggle (Internal) */}
        {onToggleAnnual && (
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => onToggleAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 transition-colors duration-200 ease-in-out ${
                isAnnual ? "bg-[var(--brand-primary)]" : "bg-gray-200 dark:bg-gray-700"
              }`}
              role="switch"
              aria-checked={isAnnual}
            >
              <span className="sr-only">Toggle annual pricing</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
                  isAnnual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-text-primary">
              Annual pricing <span className="text-[var(--brand-primary)]">(save 20%)</span>
            </span>
          </div>
        )}

        {/* Features List */}
        <div className="flex flex-col flex-grow">
          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">
            INCLUDED
          </h4>
          <ul className="flex flex-col gap-3.5 mb-8 flex-grow">
            {features.map((feature) => (
              <li
                key={feature.id}
                className={`flex items-start gap-3 text-sm ${
                  feature.included ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {feature.included ? (
                  <Icon icon={Check} size="sm" color="brand" className="mt-0.5" />
                ) : (
                  <Icon icon={Minus} size="sm" className="text-text-disabled mt-0.5" />
                )}
                <span className={feature.included ? "" : "text-text-disabled"}>{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          variant={isSelected ? "primary" : "primary"}
          className={`w-full h-12 text-base font-bold rounded-xl justify-center ${
            !isSelected ? "bg-[var(--brand-primary)] hover:opacity-90 text-white" : ""
          }`}
          onClick={onSelect}
        >
          {isSelected ? "Selected" : ctaText}
        </Button>
      </div>
    </div>
  );
};
