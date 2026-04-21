"use client";
import React, { useState } from "react";
import { Icon } from "@/app/components/ds/atoms/Icon";

export interface TabItem {
  id: string;
  label: string;
  icon?: any; // e.g. from duotone
  badgeCount?: number;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultSelectedId?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "underline" | "pills";
  onChange?: (id: string) => void;
  className?: string;
  // If vertical, acts as a layout component (Tabs on left, content on right) instead of just an isolated Molecule
  renderPanelInline?: boolean; 
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultSelectedId,
  orientation = "horizontal",
  variant = "underline",
  onChange,
  className = "",
  renderPanelInline = true,
}) => {
  const [activeTab, setActiveTab] = useState(defaultSelectedId || items[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  const isVertical = orientation === "vertical";
  const isPills = variant === "pills";

  const renderTabsList = () => (
    <div 
      className={`
        flex ${isVertical ? "flex-col gap-1 pr-6" : "flex-row max-w-full overflow-x-auto scrollbar-hide"}
        ${!isVertical && !isPills ? "border-b border-border/50 gap-6" : ""}
        ${!isVertical && isPills ? "gap-2" : ""}
        ${className}
      `}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabClick(item.id)}
            className={`
              relative flex items-center justify-between gap-2 whitespace-nowrap transition-colors outline-none
              ${isVertical ? "w-full text-left px-3 py-2.5 rounded-lg font-medium text-sm" : "py-2.5 font-semibold text-sm"}
              
              /* Vertical Styles */
              ${isVertical && isActive ? "bg-subtle text-text-primary shadow-xs border border-border" : ""}
              ${isVertical && !isActive ? "text-text-secondary hover:bg-subtle/50 hover:text-text-primary border border-transparent" : ""}
              
              /* Horizontal Underline Styles */
              ${!isVertical && !isPills && isActive ? "text-brand border-b-2 border-brand" : ""}
              ${!isVertical && !isPills && !isActive ? "text-text-secondary hover:text-text-primary border-b-2 border-transparent" : ""}

              /* Horizontal Pills Styles */
              ${!isVertical && isPills && isActive ? "bg-subtle text-text-primary px-3 rounded-md shadow-xs border border-border" : ""}
              ${!isVertical && isPills && !isActive ? "text-text-secondary hover:bg-subtle/50 hover:text-text-primary px-3 rounded-md border border-transparent" : ""}
            `}
          >
            <div className="flex items-center gap-2">
               {item.icon && (
                 <Icon icon={item.icon} size="sm" className={isActive ? (isVertical || isPills ? "text-text-primary" : "text-brand") : "text-text-tertiary"} />
               )}
               {item.label}
            </div>
            
            {item.badgeCount !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-brand text-white" : "bg-border text-text-secondary"}`}>
                {item.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const activeContent = items.find(i => i.id === activeTab)?.content;

  if (renderPanelInline) {
    if (isVertical) {
      return (
        <div className="flex flex-col md:flex-row w-full gap-8">
           <div className="md:w-64 shrink-0">
             {renderTabsList()}
           </div>
           <div className="flex-1 min-w-0 bg-surface rounded-xl border border-border p-6 shadow-xs">
             {activeContent}
           </div>
        </div>
      );
    }
    return (
      <div className="w-full flex flex-col">
        {renderTabsList()}
        <div className="mt-6">
          {activeContent}
        </div>
      </div>
    );
  }

  // If not rendering inline, just return the list layout (useful for routing structures)
  return renderTabsList();
};
