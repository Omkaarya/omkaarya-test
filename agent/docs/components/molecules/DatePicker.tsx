import React from "react";
import { Input, InputProps } from "@/components/atoms/Input";
import { Icon } from "@/components/atoms/Icon";
import { CalendarDate01Icon } from "@/icons/duotone";

export interface DatePickerProps extends Omit<InputProps, "type" | "leadingIcon" | "trailingIcon"> {
  label?: string;
  hint?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  hint,
  className = "",
  error,
  ...props
}) => {
  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      
      {/* 
        Using native standard HTML5 'date' input and relying on OS-level calendar pickers.
        We provide the Calendar Icon explicitly as a left adornment for visual matching.
      */}
      <Input
        type="date"
        leadingIcon={<Icon icon={CalendarDate01Icon} size="sm" />}
        error={error}
        // Tailwind class 'cursor-text' overrides standard pointer, and a hack to hide native right-side icons in webkit
        className="[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full cursor-pointer bg-surface"
        {...props}
      />

      {(hint || error) && (
        <p className={`text-xs mt-1.5 ${error ? "text-text-error" : "text-text-tertiary"}`}>
          {error ? `Error: ${error}` : hint}
        </p>
      )}
    </div>
  );
};
