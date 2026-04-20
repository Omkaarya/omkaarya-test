"use client";
import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { InputHint } from "@/components/atoms/Label";

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  hint?: string;
  label?: string;
  separatorMode?: "none" | "dash" | "space";
  separatorPositions?: number[]; // e.g., [3] puts a separator after the 3rd input
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value = "",
  onChange,
  error = false,
  hint,
  label,
  separatorMode = "none",
  separatorPositions = length === 6 ? [3] : [],
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState<string[]>(
    Array.from({ length }, (_, i) => value[i] || "")
  );
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const triggerChange = (newValues: string[]) => {
    setInternalValue(newValues);
    onChange?.(newValues.join(""));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValues = [...internalValue];
      
      if (newValues[index] !== "") {
        // Clear current input
        newValues[index] = "";
        triggerChange(newValues);
      } else if (index > 0) {
        // Focus previous and clear it
        inputRefs.current[index - 1]?.focus();
        newValues[index - 1] = "";
        triggerChange(newValues);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers (based on standard OTP)
    if (!val) return;

    const newValues = [...internalValue];
    // Take only the last character in case they tried typing multiple quickly inside one box without pasting
    newValues[index] = val.slice(-1);
    triggerChange(newValues);

    // Focus next
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      inputRefs.current[index]?.blur();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    if (!pastedData) return;

    const newValues = [...internalValue];
    pastedData.split("").forEach((char, i) => {
      newValues[i] = char;
    });
    triggerChange(newValues);
    
    // Focus next available or last
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      
      <div className="flex items-center flex-wrap gap-2">
        {Array.from({ length }).map((_, i) => {
          const showSeparator = separatorPositions.includes(i + 1) && i < length - 1;
          
          return (
            <React.Fragment key={i}>
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={2} // Using 2 to capture quick typing before enforcing 1 char in onChange
                value={internalValue[i] || ""}
                onChange={(e) => handleInput(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                className={`
                  w-12 h-14 text-center text-xl font-semibold rounded-lg border bg-surface
                  focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
                  transition-colors shadow-xs
                  ${error ? "border-border-error focus:ring-border-error" : "border-border text-text-primary"}
                  ${internalValue[i] ? "border-brand border-2" : ""}
                `}
                aria-label={`Digit ${i + 1}`}
              />
              {showSeparator && (
                <span className="text-text-tertiary font-bold text-lg px-0.5 select-none animate-in fade-in">
                  {separatorMode === "dash" ? "–" : separatorMode === "space" ? " " : ""}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {(hint || error) && (
        <InputHint error={!!error}>{error ? "Error: " + hint : hint}</InputHint>
      )}
    </div>
  );
};
