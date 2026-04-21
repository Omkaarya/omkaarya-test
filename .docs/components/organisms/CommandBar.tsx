"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@/components/atoms/Icon";
import { Avatar } from "@/components/atoms/Avatar";
import { SearchIcon, XCloseIcon } from "@/icons/duotone";

export interface CommandItemProps {
  id: string;
  icon?: any;
  avatarSrc?: string;
  avatarInitials?: string;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect?: () => void;
}

export interface CommandGroupProps {
  heading: string;
  items: CommandItemProps[];
}

export interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  groups: CommandGroupProps[];
  placeholder?: string;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  isOpen,
  onClose,
  groups,
  placeholder = "Search or type a command...",
}) => {
  const [query, setQuery] = useState("");

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter groups based on query
  const filteredGroups = query 
    ? groups.map(g => ({
        ...g,
        items: g.items.filter(i => 
          i.label.toLowerCase().includes(query.toLowerCase()) || 
          i.description?.toLowerCase().includes(query.toLowerCase())
        )
      })).filter(g => g.items.length > 0)
    : groups;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col transform transition-all">
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Icon icon={SearchIcon} size="md" className="text-text-tertiary" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-base text-text-primary focus:outline-none placeholder:text-text-placeholder"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button 
             onClick={onClose}
             className="text-text-tertiary hover:text-text-secondary p-1 rounded-md transition-colors"
          >
            <Icon icon={XCloseIcon} size="sm" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          {filteredGroups.length === 0 ? (
            <div className="py-14 text-center text-text-tertiary text-sm">
              No results found for "{query}"
            </div>
          ) : (
            filteredGroups.map((group, gIdx) => (
              <div key={gIdx} className="mb-4 last:mb-0">
                <div className="px-3 py-1.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  {group.heading}
                </div>
                <div className="space-y-0.5 mt-1">
                  {group.items.map((item) => (
                     <button
                       key={item.id}
                       onClick={() => {
                         item.onSelect?.();
                         onClose();
                       }}
                       className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-subtle text-left transition-colors group cursor-pointer"
                     >
                       <div className="shrink-0 flex items-center justify-center w-6 h-6">
                         {(item.avatarSrc || item.avatarInitials) ? (
                            <Avatar src={item.avatarSrc} initials={item.avatarInitials} size="sm" />
                         ) : item.icon ? (
                            <Icon icon={item.icon} size="md" className="text-text-secondary group-hover:text-text-primary transition-colors" />
                         ) : null}
                       </div>
                       
                       <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium text-text-primary truncate">{item.label}</span>
                          {item.description && (
                            <span className="text-xs text-text-tertiary truncate mt-0.5">{item.description}</span>
                          )}
                       </div>

                       {item.shortcut && (
                         <div className="shrink-0 text-xs font-mono text-text-tertiary bg-surface border border-border px-1.5 py-0.5 rounded shadow-xs">
                           {item.shortcut}
                         </div>
                       )}
                     </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-subtle/50 flex items-center gap-4 text-xs font-medium text-text-tertiary">
          <span><kbd className="font-sans border border-border rounded px-1 shadow-xs bg-surface mr-1">↑↓</kbd> to navigate</span>
          <span><kbd className="font-sans border border-border rounded px-1 shadow-xs bg-surface mr-1">↵</kbd> to select</span>
          <span><kbd className="font-sans border border-border rounded px-1 shadow-xs bg-surface mr-1">esc</kbd> to dismiss</span>
        </div>

      </div>
    </div>
  );
};
