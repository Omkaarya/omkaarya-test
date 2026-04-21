"use client";
import React, { useState } from "react";
import { Button, ButtonSize } from "./Button";

// ─── ButtonGroup (segmented / tab-switch) ─────────────────────────
export interface ButtonGroupOption {
  label: string;
  value: string;
  leadingIcon?: React.ReactNode;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  options,
  value,
  onChange,
  size = "md",
  fullWidth = false,
}) => {
  const [internal, setInternal] = useState(value ?? options[0]?.value);
  const active = value ?? internal;

  const handleClick = (val: string) => {
    setInternal(val);
    onChange?.(val);
  };

  return (
    <div
      className={`inline-flex rounded-lg border border-border overflow-hidden shadow-xs bg-surface divide-x divide-border ${fullWidth ? "w-full" : ""}`}
      role="group"
    >
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleClick(opt.value)}
            className={`
              inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand
              ${size === "sm"  ? "h-9 px-3.5 text-sm"   : ""}
              ${size === "md"  ? "h-10 px-4  text-sm"   : ""}
              ${size === "lg"  ? "h-11 px-4.5 text-base" : ""}
              ${size === "xl"  ? "h-12 px-5  text-base" : ""}
              ${size === "2xl" ? "h-14 px-6  text-lg"   : ""}
              ${fullWidth ? "flex-1" : ""}
              ${isActive
                ? "bg-subtle text-text-primary font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
              }
            `}
          >
            {opt.leadingIcon && <span className="shrink-0">{opt.leadingIcon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

// ─── ButtonGroupRadio (radio style — icon + text rows) ────────────
interface ButtonGroupRadioProps {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export const ButtonGroupRadio: React.FC<ButtonGroupRadioProps> = ({
  options,
  value,
  onChange,
}) => {
  const [internal, setInternal] = useState(value ?? options[0]?.value);
  const active = value ?? internal;

  return (
    <div className="inline-flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => { setInternal(opt.value); onChange?.(opt.value); }}
            className={`
              inline-flex items-center gap-2 px-4 h-10 rounded-lg border text-sm font-medium
              transition-colors duration-150 cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
              ${isActive
                ? "border-brand bg-bg-active text-text-brand"
                : "border-border bg-surface text-text-secondary hover:bg-subtle"
              }
            `}
          >
            <span
              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center
                ${isActive ? "border-brand" : "border-border-strong"}
              `}
            >
              {isActive && <span className="h-2 w-2 rounded-full bg-brand" />}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

// ─── ButtonToolbar (with prev/next) ───────────────────────────────
interface ButtonToolbarProps {
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
  onAdd?: () => void;
  size?: ButtonSize;
}

export const ButtonToolbar: React.FC<ButtonToolbarProps> = ({
  label,
  onPrev,
  onNext,
  onAdd,
  size = "md",
}) => (
  <div className="inline-flex rounded-lg border border-border divide-x divide-border overflow-hidden shadow-xs bg-surface">
    <Button variant="ghost" size={size} onClick={onPrev} iconOnly aria-label="Previous">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Button>
    {onAdd && (
      <Button variant="ghost" size={size} onClick={onAdd} iconOnly aria-label="Add">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    )}
    <Button variant="ghost" size={size} onClick={onNext} iconOnly aria-label="Next">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Button>
  </div>
);
