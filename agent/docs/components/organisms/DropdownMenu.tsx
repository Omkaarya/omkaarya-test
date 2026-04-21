"use client";
import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/atoms/Icon";
import { Avatar } from "@/components/atoms/Avatar";
import { SearchInput } from "@/components/molecules/SearchInput";
import { CheckIcon, ChevronRightIcon } from "@/icons/duotone";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: any;
  avatarSrc?: string;
  shortcut?: string;
  danger?: boolean;
  isDisabled?: boolean;
  children?: DropdownItem[]; // Nested sub-menu
}

export interface DropdownGroup {
  id: string;
  groupLabel?: string;
  items: DropdownItem[];
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  groups: DropdownGroup[];
  // Configurations matching the enormous spec block
  enableSearch?: boolean;
  searchPlaceholder?: string;
  isMultiSelect?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  align?: "left" | "right";
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  groups,
  enableSearch,
  searchPlaceholder = "Search...",
  isMultiSelect = false,
  selectedIds = [],
  onSelect,
  align = "left",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string, hasChildren: boolean) => {
    if (hasChildren) return; // Normally open sub-menu (mock logic here)
    if (onSelect) onSelect(id);
    if (!isMultiSelect) setIsOpen(false);
  };

  const renderItem = (item: DropdownItem, isNested: boolean = false) => {
    const isSelected = selectedIds.includes(item.id);
    
    return (
      <button
        key={item.id}
        disabled={item.isDisabled}
        onClick={() => handleSelect(item.id, !!item.children)}
        className={`
          w-full px-3 py-2 flex items-center justify-between text-left text-sm font-medium transition-colors
          ${item.isDisabled ? "opacity-50 cursor-not-allowed text-text-tertiary" : ""}
          ${item.danger && !item.isDisabled ? "text-status-danger-text hover:bg-status-danger-bg/50" : ""}
          ${!item.danger && !item.isDisabled ? "text-text-secondary hover:bg-subtle hover:text-text-primary" : ""}
          ${isNested ? "pl-8" : ""} 
        `}
      >
        <div className="flex items-center min-w-0 flex-1">
          {/* Checkmark block for multi-select */}
          {isMultiSelect && (
            <div className="w-5 h-5 flex items-center justify-center shrink-0 mr-2 border border-border rounded-sm bg-surface">
               {isSelected && <Icon icon={CheckIcon} size="sm" className="text-brand" />}
            </div>
          )}

          {/* Left Icon or Avatar */}
          {item.avatarSrc ? (
            <div className="mr-3 shrink-0"><Avatar src={item.avatarSrc} size="xs" /></div>
          ) : item.icon && !isMultiSelect ? (
            <Icon icon={item.icon} size="sm" className={`mr-3 shrink-0 ${item.danger ? "text-status-danger-text" : "text-text-tertiary"}`} />
          ) : null}

          <span className="truncate">{item.label}</span>
        </div>

        {/* Right Adornments */}
        <div className="flex items-center ml-4 shrink-0">
          {item.shortcut && (
             <span className="text-xs text-text-tertiary tracking-widest font-mono">{item.shortcut}</span>
          )}
          {item.children && (
             <Icon icon={ChevronRightIcon} size="sm" className="text-text-tertiary ml-2" />
          )}
          {/* Single Select Checkmark */}
          {!isMultiSelect && isSelected && !item.children && (
             <Icon icon={CheckIcon} size="sm" className="text-brand ml-2" />
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`
            absolute z-50 mt-2 min-w-[240px] max-w-[320px] bg-surface border border-border sm:rounded-xl shadow-xl py-1.5 flex flex-col
            ${align === "right" ? "right-0" : "left-0"}
             ${className}
          `}
        >
          {enableSearch && (
            <div className="px-3 pb-2 pt-1 border-b border-border/50 mb-1">
               <SearchInput placeholder={searchPlaceholder} />
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto">
            {groups.map((group, gIdx) => (
              <div key={group.id} className={`${gIdx > 0 ? "border-t border-border mt-1 pt-1" : ""}`}>
                {group.groupLabel && (
                  <div className="px-3 py-1.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {group.groupLabel}
                  </div>
                )}
                {group.items.map(item => renderItem(item))}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
