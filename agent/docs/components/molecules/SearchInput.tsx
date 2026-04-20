import React from "react";
import { Input, InputProps } from "@/components/atoms/Input";
import { SearchMdIcon } from "@/icons/duotone";

// ─── SearchInput ──────────────────────────────────────────────────
// Molecule: Search icon + Input
export interface SearchInputProps extends Omit<InputProps, "leadingIcon"> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  value,
  onClear,
  className = "",
  ...props
}) => (
  <div className="relative w-full">
    {/* Leading search icon */}
    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-fg-quaternary">
      <SearchMdIcon className="h-4 w-4" aria-hidden />
    </span>

    <Input
      value={value}
      placeholder={placeholder}
      className={`pl-9 ${onClear && value ? "pr-9" : ""} ${className}`}
      {...props}
    />

    {/* Clear button */}
    {onClear && value && (
      <button
        type="button"
        onClick={onClear}
        className="absolute inset-y-0 right-3 flex items-center text-fg-quaternary hover:text-fg-secondary transition-colors"
        aria-label="Clear search"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    )}
  </div>
);
