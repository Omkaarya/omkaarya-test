"use client";
import React, { useState } from "react";

// ─── Toggle / Switch ──────────────────────────────────────────────
export type ToggleSize = "sm" | "md";

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSize;
  label?: string;
  description?: string;
  id?: string;
}

const sizeMap: Record<ToggleSize, { track: string; thumb: string; translate: string }> = {
  sm: { track: "h-5 w-9",   thumb: "h-4 w-4 top-0.5 left-0.5", translate: "translate-x-4" },
  md: { track: "h-6 w-11",  thumb: "h-5 w-5 top-0.5 left-0.5", translate: "translate-x-5" },
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = "md",
  label,
  description,
  id,
}) => {
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked !== undefined ? checked : internal;
  const { track, thumb, translate } = sizeMap[size];
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOn;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={`flex items-center gap-3 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <button
        type="button"
        role="switch"
        id={inputId}
        aria-checked={isOn}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex shrink-0 rounded-full transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
          ${track}
          ${isOn ? "bg-brand" : "bg-border-strong"}
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            absolute inline-block rounded-full bg-white shadow-xs
            transition-transform duration-200
            ${thumb}
            ${isOn ? translate : "translate-x-0"}
          `}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={inputId}
              onClick={handleToggle}
              className={`text-sm font-medium text-text-primary ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-text-tertiary">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};
