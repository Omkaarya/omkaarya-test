"use client";
import React, { useState } from "react";
import { Radio } from "@/components/atoms/CheckboxRadio";
import { Badge } from "@/components/atoms/Badge";

export interface RichRadioOption {
  value: string;
  title: string;
  description?: React.ReactNode;
  badge?: string;
  priceAmount?: string;
  pricePeriod?: string;
  disabled?: boolean;
  recommended?: boolean;
}

export interface RichRadioGroupProps {
  options: RichRadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  className?: string;
}

export const RichRadioGroup: React.FC<RichRadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState(value || "");

  const handleSelect = (val: string, disabled?: boolean) => {
    if (disabled) return;
    setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div className={`space-y-3 w-full ${className}`}>
      {options.map((opt) => {
        const isSelected = (value !== undefined ? value : internalValue) === opt.value;
        const isDisabled = opt.disabled;

        return (
          <div
            key={opt.value}
            onClick={() => handleSelect(opt.value, isDisabled)}
            className={`
              relative flex flex-col sm:flex-row sm:items-start p-4 rounded-xl border-2 transition-colors duration-200
              ${isDisabled ? "opacity-60 cursor-not-allowed bg-subtle border-border" : "cursor-pointer"}
              ${isSelected && !isDisabled ? "border-brand bg-brand/5 shadow-xs" : ""}
              ${!isSelected && !isDisabled ? "border-border bg-surface hover:bg-subtle" : ""}
            `}
          >
            {/* Left standard radio button */}
            <div className="flex items-start shrink-0 mr-4">
              <Radio
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => {}} // controlled by outer div
              />
            </div>

            {/* Middle textual content */}
            <div className="flex-1 min-w-0 mt-0.5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm text-text-primary">
                  {opt.title}
                </span>
                {opt.badge && (
                  <Badge color={opt.recommended ? "orange" : "gray"} size="sm">
                    {opt.badge}
                  </Badge>
                )}
              </div>
              {opt.description && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {opt.description}
                </p>
              )}
            </div>

            {/* Right pricing / metadata */}
            {opt.priceAmount && (
              <div className="shrink-0 mt-3 sm:mt-0 sm:ml-6 text-left sm:text-right">
                <div className="text-lg font-bold text-text-primary flex items-baseline gap-1 sm:justify-end">
                  {opt.priceAmount}
                  {opt.pricePeriod && (
                    <span className="text-sm font-normal text-text-tertiary">
                      {opt.pricePeriod}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
