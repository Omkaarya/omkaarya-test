import React from "react";

// ─── Label ────────────────────────────────────────────────────────
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required,
  optional,
  className = "",
  ...props
}) => (
  <label
    className={`block text-sm font-medium text-text-secondary ${className}`}
    {...props}
  >
    {children}
    {required && <span className="ml-1 text-status-danger-text">*</span>}
    {optional && (
      <span className="ml-1.5 text-xs font-normal text-text-tertiary">(optional)</span>
    )}
  </label>
);

// ─── InputHint ────────────────────────────────────────────────────
export interface InputHintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: boolean;
}

export const InputHint: React.FC<InputHintProps> = ({
  children,
  error = false,
  className = "",
  ...props
}) => (
  <p
    className={`text-xs mt-1.5 ${error ? "text-text-error" : "text-text-tertiary"} ${className}`}
    {...props}
  >
    {children}
  </p>
);
