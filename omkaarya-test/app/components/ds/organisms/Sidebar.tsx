"use client";
import React, { useState } from "react";
import { Icon } from "@/app/components/ds/atoms/Icon";
import { Avatar } from "@/app/components/ds/atoms/Avatar";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Home01Icon, FolderIcon, Settings01Icon, ChevronDownIcon, LogOut01Icon, SupportIcon, Users01Icon } from "@/app/icons";

export interface NavItemType {
  id: string;
  label: string;
  icon?: any;
  href?: string;
  badge?: string;
  children?: NavItemType[];
}

export interface SidebarProps {
  items: NavItemType[];
  activeId?: string;
  onItemClick?: (id: string, href?: string) => void;
  logoUrl?: string;
  accountName?: string;
  accountEmail?: string;
  accountAvatar?: string;
  className?: string;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items = [],
  activeId,
  onItemClick,
  logoUrl,
  accountName = "Olivia Rhye",
  accountEmail = "olivia@example.com",
  accountAvatar,
  className = "",
  isCollapsed = false,
}) => {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["dashboard", "projects"]));

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const NavItem = ({ item, depth = 0 }: { item: NavItemType; depth?: number }) => {
    const isActive = activeId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openGroups.has(item.id);

    return (
      <div className="flex flex-col">
        <button
          onClick={() => {
            if (hasChildren) toggleGroup(item.id);
            else onItemClick?.(item.id, item.href);
          }}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group text-sm font-medium
            ${isActive && !hasChildren ? "bg-brand/10 text-brand font-semibold" : "text-text-secondary hover:bg-subtle hover:text-text-primary"}
          `}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          <div className="flex items-center gap-3">
            {item.icon && (
              <Icon 
                icon={item.icon} 
                size="md" 
                color={isActive && !hasChildren ? "brand" : "secondary"}
                className={`transition-colors ${isActive && !hasChildren ? "" : "group-hover:text-text-primary"}`} 
              />
            )}
            {!isCollapsed && <span>{item.label}</span>}
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {item.badge && <Badge color={isActive ? "brand" : "gray"} size="sm">{item.badge}</Badge>}
              {hasChildren && (
                <Icon 
                  icon={ChevronDownIcon} 
                  size="sm" 
                  className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
                />
              )}
            </div>
          )}
        </button>
        
        {!isCollapsed && hasChildren && isOpen && (
          <div className="mt-1 flex flex-col space-y-0.5 relative before:absolute before:left-[1.2rem] before:top-0 before:bottom-0 before:w-px before:bg-border">
            {item.children!.map((child) => (
              <NavItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`flex flex-col h-screen bg-surface border-r border-border transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"} ${className}`}>
      
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-6 shrink-0 border-b border-border">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-8" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bg-brand-solid flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            {!isCollapsed && <span className="font-bold text-xl tracking-tight text-text-primary">Omkaarya</span>}
          </div>
        )}
      </div>

      {/* Nav Link Lists */}
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 scrollbar-hide">
        {items.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </div>

      {/* Footer Account Block */}
      <div className="shrink-0 p-4 border-t border-border mt-auto">
        {!isCollapsed && (
          <div className="flex items-center justify-between p-2 hover:bg-subtle rounded-xl cursor-pointer transition-colors group">
            <div className="flex items-center gap-3">
              <Avatar src={accountAvatar} initials="OR" size="md" indicator="online" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary leading-tight">{accountName}</span>
                <span className="text-xs text-text-tertiary">{accountEmail}</span>
              </div>
            </div>
            <button className="text-fg-quaternary hover:text-text-primary p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon icon={LogOut01Icon} size="sm" />
            </button>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <Avatar src={accountAvatar} initials="OR" size="md" indicator="online" />
          </div>
        )}
      </div>
    </aside>
  );
};
