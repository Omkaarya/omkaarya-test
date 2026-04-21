import React from "react";
import { Radio } from "@/components/atoms/CheckboxRadio";
import { Label } from "@/components/atoms/Label";

// ─── RadioGroup ───────────────────────────────────────────────────
export interface RadioGroupOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  orientation?: "vertical" | "horizontal";
  hint?: string;
  error?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  name,
  orientation = "vertical",
  hint,
  error,
}) => (
  <fieldset className="w-full space-y-2">
    {label && (
      <Label as="legend" className="mb-2">
        {label}
      </Label>
    )}
    <div className={`flex ${orientation === "horizontal" ? "flex-row flex-wrap gap-4" : "flex-col gap-3"}`}>
      {options.map((opt) => (
        <Radio
          key={opt.value}
          name={name}
          value={opt.value}
          label={opt.label}
          description={opt.description}
          disabled={opt.disabled}
          checked={value === opt.value}
          onChange={() => onChange?.(opt.value)}
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
