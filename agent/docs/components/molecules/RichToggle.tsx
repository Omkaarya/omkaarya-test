"use client";
import React, { useState } from "react";
import { Toggle } from "@/components/atoms/Toggle";

export interface RichToggleProps {
  label: string;
  description?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const RichToggle: React.FC<RichToggleProps> = ({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [internalChecked, setInternalChecked] = useState(checked);

  const handleToggle = (newChecked: boolean) => {
    if (disabled) return;
    setInternalChecked(newChecked);
    onChange?.(newChecked);
  };

  const isChecked = onChange ? checked : internalChecked;

  return (
    <div 
      className={`flex items-start gap-3 w-full ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      onClick={() => handleToggle(!isChecked)}
    >
      <div className="shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
        <Toggle 
          checked={isChecked} 
          disabled={disabled} 
          onChange={handleToggle} 
        />
      </div>
      
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-sm font-semibold leading-tight ${disabled ? "text-text-tertiary" : "text-text-primary"}`}>
          {label}
        </span>
        {description && (
          <span className={`text-sm mt-0.5 leading-relaxed ${disabled ? "text-text-tertiary" : "text-text-secondary"}`}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
