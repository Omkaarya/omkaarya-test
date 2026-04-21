"use client";
import React from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { Icon } from "@/components/atoms/Icon";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Breadcrumb } from "@/components/molecules/Breadcrumb";
import { DropdownMenu } from "@/components/organisms/DropdownMenu";
import { Bell01Icon, Settings01Icon } from "@/icons/duotone";

export interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  userName?: string;
  userEmail?: string;
  onSearch?: (val: string) => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbs,
  userName = "Olivia Rhye",
  userEmail = "olivia@example.com",
  onSearch,
  className = "",
}) => {
  return (
    <header className={`h-16 w-full bg-surface border-b border-border flex items-center justify-between px-6 lg:px-8 shrink-0 transition-all ${className}`}>
      
      {/* Left Area: Context (Breadcrumbs) */}
      <div className="flex-1 min-w-0 flex items-center">
        {breadcrumbs ? (
          <Breadcrumb items={breadcrumbs} />
        ) : (
          <span className="text-lg font-semibold text-text-primary truncate">Dashboard</span>
        )}
      </div>

      {/* Right Area: Utility & Account */}
      <div className="flex items-center gap-4 sm:gap-6 ml-4 shrink-0">
        
        {/* Search */}
        <div className="hidden md:block w-64 lg:w-80 transition-all">
          <SearchInput placeholder="Search everywhere..." onChange={(e) => onSearch?.(e.target.value)} />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 flex items-center justify-center rounded-full text-text-tertiary hover:bg-subtle hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand">
            <Icon icon={Bell01Icon} size="md" />
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-full text-text-tertiary hover:bg-subtle hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand">
            <Icon icon={Settings01Icon} size="md" />
          </button>
        </div>

        <div className="w-px h-6 bg-border hidden sm:block" />

        {/* Dropdown Menu Account Profile */}
        <DropdownMenu
          align="right"
          trigger={<Avatar initials="OR" indicator="online" className="cursor-pointer ring-2 ring-transparent hover:ring-brand/30 transition-all" />}
          header={{
            name: userName,
            email: userEmail,
            avatarInitials: "OR"
          }}
          items={[
            { id: "profile", label: "View profile", shortcut: "⌘P" },
            { id: "settings", label: "Settings", shortcut: "⌘S" },
            "divider",
            { id: "logout", label: "Sign out", danger: true }
          ]}
        />

      </div>
    </header>
  );
};
