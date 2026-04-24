import React from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  containerClassName?: string;
  inputSize?: "sm" | "md" | "lg";
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
    inputSize = "md",
    ...props 
  }, ref) => {
    
    // Size Mapping for Height and Padding
    const sizeClasses = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-4 text-sm",
      lg: "h-14 px-5 text-base"
    };

    const iconSizeClasses = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5"
    };

    return (
      <div className={`relative flex items-center w-full rounded-2xl border bg-white dark:bg-zinc-950 transition-all duration-200 focus-within:ring-4 focus-within:ring-[var(--brand-primary)]/10 ${
        error 
          ? "border-red-300 dark:border-red-900 focus-within:border-red-500" 
          : "border-zinc-200 dark:border-zinc-800 focus-within:border-[var(--brand-primary)]"
      } ${
        disabled ? "opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900" : ""
      } ${containerClassName}`}>
        
        {/* Left Adornment */}
        {leadingIcon && React.isValidElement(leadingIcon) && (
          <div className="pl-4 flex items-center justify-center text-zinc-400 shrink-0 pointer-events-none">
            {React.cloneElement(leadingIcon as React.ReactElement<any>, { 
              className: `${iconSizeClasses[inputSize]} ${(leadingIcon.props as any).className || ""}` 
            })}
          </div>
        )}
        
        {prefixText && (
          <span className="pl-4 pr-2 text-xs font-bold text-zinc-400 uppercase tracking-widest border-r border-zinc-100 dark:border-zinc-800 mr-2 h-full flex items-center">
            {prefixText}
          </span>
        )}

        {/* Core Input Field */}
        <input
          ref={ref}
          disabled={disabled}
          className={`
            flex-1 w-full bg-transparent font-bold 
            text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:font-medium
            focus:outline-none disabled:cursor-not-allowed
            ${sizeClasses[inputSize]}
            ${leadingIcon || prefixText ? "!pl-2" : ""}
            ${trailingIcon || suffixText ? "!pr-2" : ""}
            ${className}
          `}
          {...props}
        />

        {/* Right Adornment */}
        {suffixText && (
          <span className="pr-4 pl-2 text-xs font-bold text-zinc-400 uppercase tracking-widest border-l border-zinc-100 dark:border-zinc-800 ml-2 h-full flex items-center">
            {suffixText}
          </span>
        )}

        {trailingIcon && React.isValidElement(trailingIcon) && (
          <div className="pr-4 flex items-center justify-center text-zinc-400 shrink-0 pointer-events-none">
            {React.cloneElement(trailingIcon as React.ReactElement<any>, { 
              className: `${iconSizeClasses[inputSize]} ${(trailingIcon.props as any).className || ""}` 
            })}
          </div>
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
        <button type="button" onClick={onDecrement} className="px-1 text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none">
          <span className="text-lg leading-none font-medium">-</span>
        </button>
      }
      trailingIcon={
        <button type="button" onClick={onIncrement} className="px-1 text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none">
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
      <div className="flex items-center justify-between w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-4 pr-2 py-1 h-11 focus-within:ring-4 focus-within:ring-[var(--brand-primary)]/10">
         <span className="text-sm text-zinc-400 truncate flex-1 pointer-events-none font-medium">No file chosen</span>
         <div className="px-5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white pointer-events-none whitespace-nowrap">
           {buttonLabel}
         </div>
      </div>
    </div>
  )
);
FileInput.displayName = "FileInput";

