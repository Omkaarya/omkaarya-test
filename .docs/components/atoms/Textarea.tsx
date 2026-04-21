import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  charCount?: boolean;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error = false, charCount = false, maxLength, value, onChange, ...props }, ref) => {
    const [count, setCount] = React.useState(
      typeof value === "string" ? value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          onChange={charCount ? handleChange : onChange}
          className={`
            flex min-h-[100px] w-full rounded-lg border px-3 py-2.5
            text-sm font-normal resize-y
            bg-surface text-text-primary placeholder:text-text-placeholder
            border-border
            focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
            disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-text-disabled
            ${error ? "border-border-error focus:ring-border-error" : ""}
            ${className}
          `}
          {...props}
        />
        {charCount && maxLength && (
          <p className="mt-1.5 text-xs text-text-tertiary text-right">
            {count}/{maxLength}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
