"use client";
import React from "react";
import { Icon } from "@/components/atoms/Icon";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: any;
  shortcut?: string; // e.g. "⌘ C"
  separator?: boolean; // If true, renders a line instead of an item
  danger?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onSelect: (id: string) => void;
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  isOpen,
  x,
  y,
  onClose,
  onSelect,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div 
        className={`fixed z-50 min-w-[200px] bg-surface border border-border sm:rounded-lg shadow-xl py-1.5 flex flex-col ${className}`}
        style={{ top: y, left: x }}
      >
        {items.map((item, idx) => {
           if (item.separator) {
             return <div key={`sep-${idx}`} className="w-full h-px bg-border my-1" />;
           }

           return (
             <button
               key={item.id}
               onClick={() => { onSelect(item.id); onClose(); }}
               className={`
                 w-full px-3 py-2 flex items-center justify-between text-sm font-medium transition-colors text-left
                 ${item.danger ? "text-status-danger-text hover:bg-status-danger-bg/50" : "text-text-secondary hover:bg-subtle hover:text-text-primary"}
               `}
             >
                <div className="flex items-center gap-2">
                   {item.icon && <Icon icon={item.icon} size="sm" className={item.danger ? "text-status-danger-text" : "text-text-tertiary"} />}
                   {item.label}
                </div>
                {item.shortcut && (
                   <span className="text-xs text-text-tertiary tracking-widest font-mono ml-4">{item.shortcut}</span>
                )}
             </button>
           );
        })}
      </div>
    </>
  );
};
