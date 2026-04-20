import React from "react";
import { Input, InputProps } from "@/app/components/ds/atoms/Input";
import { Label } from "@/app/components/ds/atoms/Label";
import { InputHint } from "@/app/components/ds/atoms/Label";

// ─── FormField ────────────────────────────────────────────────────
// Molecule: Label + Input + InputHint
export interface FormFieldProps extends InputProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  hint,
  error,
  required,
  optional,
  id,
  ...inputProps
}) => {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <Label htmlFor={fieldId} required={required} optional={optional}>
          {label}
        </Label>
      )}
      <Input
        id={fieldId}
        error={!!error}
        aria-describedby={hint || error ? `${fieldId}-hint` : undefined}
        {...inputProps}
      />
      {(hint || error) && (
        <InputHint id={`${fieldId}-hint`} error={!!error}>
          {error ?? hint}
        </InputHint>
      )}
    </div>
  );
};
