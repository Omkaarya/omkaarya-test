"use client";
import React from "react";
import { Breadcrumb, BreadcrumbItemProps } from "@/components/molecules/Breadcrumb";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Icon } from "@/components/atoms/Icon";
import { ArrowLeftIcon } from "@/icons/duotone";

export interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItemProps[];
  title: string;
  description?: string;
  
  // Banner / Profile mode
  bannerGradient?: string; // e.g. "bg-gradient-to-r from-blue-200 to-pink-200"
  avatarSrc?: string;
  avatarInitials?: string;
  showBackButton?: boolean;
  onBack?: () => void;

  // Actions area
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  tertiaryAction?: { label: string; onClick: () => void };
  
  // Bottom Slot (Often search bar or tabs)
  showSearch?: boolean;
  searchPlaceholder?: string;
  bottomSlot?: React.ReactNode;
  
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  description,
  bannerGradient,
  avatarSrc,
  avatarInitials,
  showBackButton,
  onBack,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  showSearch,
  searchPlaceholder = "Search",
  bottomSlot,
  className = "",
}) => {
  const isProfileMode = !!bannerGradient;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      
      {/* Banner Area */}
      {isProfileMode && (
        <div className={`w-full h-32 sm:h-48 rounded-t-2xl relative ${bannerGradient || "bg-subtle"}`}>
           {/* Overlapping Avatar Container */}
           {(avatarSrc || avatarInitials) && (
             <div className="absolute -bottom-10 left-6 sm:left-8 p-1.5 bg-surface rounded-full shadow-sm">
                <Avatar src={avatarSrc} initials={avatarInitials} size="xl" />
             </div>
           )}
        </div>
      )}

      {/* Content Area */}
      <div className={`flex flex-col pt-6 pb-6 px-6 sm:px-8 border-b border-border ${isProfileMode ? "bg-surface rounded-b-2xl shadow-xs" : ""}`}>
        
        {/* Top Row: Navigation/Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          
          <div className={`flex flex-col min-w-0 ${isProfileMode && (avatarSrc || avatarInitials) ? "sm:pl-32 pt-4 sm:pt-0" : ""}`}>
             {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-4" />}
             
             {showBackButton && (
               <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors mb-4">
                 <Icon icon={ArrowLeftIcon} size="sm" /> Back
               </button>
             )}

             <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-1">
               {title}
             </h1>
             {description && (
               <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
                 {description}
               </p>
             )}
          </div>

          {/* Action Group */}
          {(primaryAction || secondaryAction || tertiaryAction || showSearch) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 mt-4 sm:mt-0">
               {tertiaryAction && (
                 <Button variant="ghost" onClick={tertiaryAction.onClick}>{tertiaryAction.label}</Button>
               )}
               {secondaryAction && (
                 <Button variant="secondary" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
               )}
               {primaryAction && (
                 <Button variant="primary" onClick={primaryAction.onClick}>{primaryAction.label}</Button>
               )}
               
               {showSearch && (
                 <div className="w-full sm:w-64 mt-2 sm:mt-0">
                   <SearchInput placeholder={searchPlaceholder} />
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Bottom Slot */}
        {bottomSlot && (
          <div className="mt-4 w-full">
            {bottomSlot}
          </div>
        )}

      </div>
    </div>
  );
};
