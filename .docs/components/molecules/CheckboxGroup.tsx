import React from "react";
import { Checkbox } from "@/components/atoms/CheckboxRadio";
import { Label } from "@/components/atoms/Label";

// ─── CheckboxGroup ────────────────────────────────────────────────
export interface CheckboxGroupOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label?: string;
  options: CheckboxGroupOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  orientation?: "vertical" | "horizontal";
  hint?: string;
  error?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  value = [],
  onChange,
  orientation = "vertical",
  hint,
  error,
}) => {
  const toggle = (val: string) => {
    const next = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange?.(next);
  };

  return (
    <fieldset className="w-full space-y-2">
      {label && <Label as="legend" className="mb-2">{label}</Label>}
      <div className={`flex ${orientation === "horizontal" ? "flex-row flex-wrap gap-4" : "flex-col gap-3"}`}>
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            label={opt.label}
            description={opt.description}
            disabled={opt.disabled}
            checked={value.includes(opt.value)}
            onChange={() => toggle(opt.value)}
          />
        ))}
      </div>
      {(hint || error) && (
        <p className={`text-xs mt-1.5 ${error ? "text-text-error" : "text-text-tertiary"}`}>
          {error ?? hint}
        </p>
      )}
    </fieldset>
  );
};
