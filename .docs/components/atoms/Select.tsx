import React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
  options: { label: string; value: string; disabled?: boolean }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error = false, placeholder, options, ...props }, ref) => (
    <div className="relative w-full">
      <select
        ref={ref}
        className={`
          appearance-none flex h-10 w-full rounded-lg border px-3 pr-9 py-2
          text-sm font-normal cursor-pointer
          bg-surface text-text-primary
          border-border
          focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
          disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-text-disabled
          ${error ? "border-border-error focus:ring-border-error" : ""}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-fg-quaternary">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  )
);

Select.displayName = "Select";
