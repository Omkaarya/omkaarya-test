import React from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  prefixText?: React.ReactNode;
  suffixText?: React.ReactNode;
  containerClassName?: string;
  inputSize?: "sm" | "md" | "lg" | "xl";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = "", 
    containerClassName = "",
    error = false, 
    leadingIcon, 
    trailingIcon, 
    prefixText, 
    suffixText, 
    disabled, 
    ...props 
  }, ref) => {
    
    const hasLeftAdornment = leadingIcon || prefixText;
    const hasRightAdornment = trailingIcon || suffixText;

    return (
      <div className={`relative flex items-center w-full rounded-lg border bg-surface transition-colors focus-within:ring-2 focus-within:ring-brand focus-within:border-transparent ${
        error ? "border-border-error focus-within:ring-border-error" : "border-border"
      } ${
        disabled ? "bg-bg-disabled cursor-not-allowed opacity-70" : ""
      } ${containerClassName}`}>
        
        {/* Left Adornments */}
        {prefixText && (
          <span className="flex items-center pl-3 pr-2 text-text-tertiary select-none border-r border-border mr-2 text-sm bg-subtle rounded-l-md h-full">
            {prefixText}
          </span>
        )}
        {!prefixText && leadingIcon && (
          <span className="flex items-center pl-3 pr-2 text-fg-quaternary pointer-events-none">
            {leadingIcon}
          </span>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          disabled={disabled}
          className={`
            flex-1 h-10 w-full bg-transparent text-sm font-normal
            text-text-primary placeholder:text-text-placeholder
            focus:outline-none disabled:cursor-not-allowed
            ${!hasLeftAdornment ? "pl-3" : ""}
            ${!hasRightAdornment ? "pr-3" : ""}
            ${className}
          `}
          {...props}
        />

        {/* Right Adornments */}
        {!suffixText && trailingIcon && (
          <span className="flex items-center pr-3 pl-2 text-fg-quaternary">
            {trailingIcon}
          </span>
        )}
        {suffixText && (
          <span className="flex items-center pr-3 pl-2 text-text-tertiary select-none border-l border-border ml-2 text-sm bg-subtle rounded-r-md h-full">
            {suffixText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps & { onIncrement?: () => void, onDecrement?: () => void }>(
  ({ onIncrement, onDecrement, ...props }, ref) => (
    <Input
      ref={ref}
      type="number"
      leadingIcon={
        <button type="button" onClick={onDecrement} className="px-1 text-text-tertiary hover:text-text-primary transition-colors focus:outline-none">
          <span className="text-lg leading-none font-medium">-</span>
        </button>
      }
      trailingIcon={
        <button type="button" onClick={onIncrement} className="px-1 text-text-tertiary hover:text-text-primary transition-colors focus:outline-none">
          <span className="text-lg leading-none font-medium">+</span>
        </button>
      }
      className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      {...props}
    />
  )
);
NumberInput.displayName = "NumberInput";

export const DateInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => (
    <Input
      ref={ref}
      type="date"
      className="appearance-none"
      {...props}
    />
  )
);
DateInput.displayName = "DateInput";

export const FileInput = React.forwardRef<HTMLInputElement, InputProps & { buttonLabel?: string }>(
  ({ buttonLabel = "Browse", ...props }, ref) => (
    <div className="relative w-full">
      <Input
        ref={ref}
        type="file"
        className="opacity-0 absolute inset-0 z-10 cursor-pointer w-full"
        {...props}
      />
      {/* Visual Mock of the File input */}
      <div className="flex items-center justify-between w-full rounded-lg border border-border bg-surface pl-3 pr-1 py-1 h-10 focus-within:ring-2 focus-within:ring-brand">
         <span className="text-sm text-text-tertiary truncate flex-1 pointer-events-none">No file chosen</span>
         <div className="px-4 py-1.5 rounded-md bg-subtle border border-border text-xs font-semibold text-text-primary pointer-events-none whitespace-nowrap">
           {buttonLabel}
         </div>
      </div>
    </div>
  )
);
FileInput.displayName = "FileInput";
