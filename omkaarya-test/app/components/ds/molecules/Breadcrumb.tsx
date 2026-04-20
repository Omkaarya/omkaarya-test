"use client";
import React from "react";
import { Icon } from "@/app/components/ds/atoms/Icon";
import { ChevronRightIcon, Home01Icon, DotsHorizontalIcon } from "@/app/icons";

export interface BreadcrumbItemProps {
  label: string;
  href?: string;
  isHome?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItemProps[];
  separator?: "chevron" | "slash";
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = "chevron",
  className = "",
}) => {
  const getSeparator = () => {
    if (separator === "chevron") {
      return <Icon icon={ChevronRightIcon} size="sm" className="text-text-tertiary mx-1.5" />;
    }
    return <span className="text-text-tertiary mx-2 font-medium">/</span>;
  };

  const processItemsContext = () => {
    // Figma shows specific truncation patterns: Home -> ... -> Parent -> Target
    // If more than 4 items, we can visually collapse. For simplicity, we just map what is passed.
    // If a label is "...", we render standard dots
    return items;
  };

  return (
    <nav className={`flex items-center text-sm font-medium ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center min-w-0">
        {processItemsContext().map((item, index) => {
          const isLast = index === items.length - 1;
          const isDots = item.label === "...";

          return (
            <li key={index} className="flex items-center">
              {/* Item Content */}
              {isDots ? (
                <span className="flex items-center text-text-tertiary px-1">...</span>
              ) : (
                <a
                  href={isLast || !item.href ? undefined : item.href}
                  className={`
                    flex items-center transition-colors
                    ${isLast 
                      ? "text-brand font-semibold cursor-default" 
                      : item.href 
                        ? "text-text-secondary hover:text-text-primary" 
                        : "text-text-secondary cursor-default"
                    }
                  `}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.isHome && (
                    <Icon 
                      icon={Home01Icon} 
                      size="md" 
                      className={`mr-1.5 ${isLast ? "text-brand" : "text-text-secondary"}`} 
                    />
                  )}
                  {(!item.isHome || item.label !== "Home") && <span>{item.label}</span>}
                </a>
              )}

              {/* Separator */}
              {!isLast && getSeparator()}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
