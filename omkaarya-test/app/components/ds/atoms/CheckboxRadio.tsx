import React from "react";

// ─── Checkbox ─────────────────────────────────────────────────────
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
  error?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, description, indeterminate = false, error = false, disabled, id, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    React.useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate, resolvedRef]);

    return (
      <div className={`flex items-start gap-3 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        <div className="relative flex items-center h-5 mt-0.5">
          <input
            ref={resolvedRef}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className={`
              peer h-4 w-4 rounded appearance-none cursor-pointer shrink-0
              border-2 border-border-strong bg-surface
              checked:bg-brand checked:border-brand
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
              disabled:cursor-not-allowed
              ${error ? "border-border-error" : ""}
              ${className}
            `}
            {...props}
          />
          {/* Check mark */}
          <svg
            className="absolute h-3 w-3 left-0.5 pointer-events-none hidden peer-checked:block text-brand-on"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={inputId}
                className={`text-sm font-medium ${disabled ? "cursor-not-allowed" : "cursor-pointer"} text-text-primary`}
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
  }
);

Checkbox.displayName = "Checkbox";

// ─── Radio ────────────────────────────────────────────────────────
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: boolean;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className = "", label, description, error = false, disabled, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`flex items-start gap-3 ${disabled ? "opacity-50" : ""}`}>
        <div className="relative flex items-center h-5 mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            disabled={disabled}
            className={`
              peer h-4 w-4 rounded-full appearance-none cursor-pointer shrink-0
              border-2 border-border-strong bg-surface
              checked:border-brand
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
              disabled:cursor-not-allowed
              ${error ? "border-border-error" : ""}
              ${className}
            `}
            {...props}
          />
          {/* Inner dot */}
          <span className="absolute h-2 w-2 rounded-full bg-brand left-1 pointer-events-none hidden peer-checked:block" />
        </div>

        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={inputId}
                className={`text-sm font-medium ${disabled ? "cursor-not-allowed" : "cursor-pointer"} text-text-primary`}
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
  }
);

Radio.displayName = "Radio";
