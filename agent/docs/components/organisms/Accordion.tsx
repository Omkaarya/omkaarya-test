"use client";
import React, { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Radio, Checkbox } from "@/components/atoms/CheckboxRadio";
import { ChevronDownIcon } from "@/icons/duotone";

export interface AccordionProps {
  items: AccordionItemType[];
  allowMultiple?: boolean;
  className?: string;
}

export interface AccordionItemType {
  id: string;
  title: string;
  badge?: string;
  content: string | React.ReactNode;
  triggerType?: "none" | "radio" | "checkbox"; // Based on Figma specs
  buttonLabel?: string;
  onButtonClick?: () => void;
  disabled?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className = "",
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string, disabled?: boolean) => {
    if (disabled) return;
    
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) newSet.clear();
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const isDisabled = item.disabled;

        return (
          <div
            key={item.id}
            className={`
              rounded-xl border transition-colors duration-200
              ${isOpen ? "border-brand bg-brand/5 shadow-xs" : "border-border bg-surface"}
              ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            {/* Header Trigger */}
            <div
              className={`
                flex items-center justify-between p-4
                ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
              `}
              onClick={() => toggle(item.id, isDisabled)}
            >
              <div className="flex items-center gap-3">
                {/* Trigger Selectors */}
                {item.triggerType === "radio" && (
                  <Radio
                    checked={isOpen}
                    disabled={isDisabled}
                    onChange={() => {}} // Controlled by outer div
                    onClick={(e) => e.stopPropagation()} // Let outer div handle it
                  />
                )}
                {item.triggerType === "checkbox" && (
                  <Checkbox
                    checked={isOpen}
                    disabled={isDisabled}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()} 
                  />
                )}
                
                {/* Title */}
                <span className={`text-sm font-semibold ${isDisabled ? "text-text-tertiary" : "text-text-primary"}`}>
                  {item.title}
                </span>

                {/* Optional Badge */}
                {item.badge && (
                  <Badge color="gray" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </div>

              {/* Chevron */}
              <span className={`transition-transform duration-200 text-fg-quaternary ${isOpen ? "rotate-180 text-brand" : ""} ${isDisabled ? "opacity-50" : ""}`}>
                <ChevronDownIcon className="h-5 w-5" />
              </span>
            </div>

            {/* Collapsible Content */}
            {isOpen && (
              <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-1 fade-in duration-200">
                {/* For radio/checkbox spacing alignment if they exist */}
                <div className={`${item.triggerType && item.triggerType !== "none" ? "ml-8" : ""}`}>
                  <div className="text-sm text-text-secondary leading-relaxed">
                    {item.content}
                  </div>
                  
                  {item.buttonLabel && (
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          item.onButtonClick?.();
                        }}
                      >
                        {item.buttonLabel}
                      </Button>
                    </div>
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
