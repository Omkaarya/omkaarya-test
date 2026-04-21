"use client";
import React from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { Icon } from "@/components/atoms/Icon";
import { File02Icon } from "@/icons/duotone";

export interface ActivityFeedItem {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
    initials?: string;
  };
  actionText: React.ReactNode;
  timestamp: string;
  targetText?: React.ReactNode;
  attachment?: {
    type: "quote" | "file";
    content?: string;
    fileName?: string;
    fileSize?: string;
  };
  badgeColor?: "brand" | "success" | "warning" | "gray"; 
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  className?: string;
}

const badgeColorMap = {
  brand: "bg-brand border-brand",
  success: "bg-status-success-text border-status-success-text",
  warning: "bg-status-warning-text border-status-warning-text",
  gray: "bg-text-tertiary border-text-tertiary",
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, className = "" }) => {
  return (
    <div className={`flow-root ${className}`}>
      <ul role="list" className="-mb-8">
        {items.map((item, itemIdx) => {
          const isLast = itemIdx === items.length - 1;
          const IndicatorColor = item.badgeColor ? badgeColorMap[item.badgeColor] : null;

          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {/* Connecting Line */}
                {!isLast ? (
                  <span
                    className="absolute left-[1.125rem] top-10 -ml-px h-full w-[2px] bg-border"
                    aria-hidden="true"
                  />
                ) : null}
                
                <div className="relative flex items-start space-x-3">
                  {/* Left Column (Avatar + optional indicator dot) */}
                  <div className="relative">
                    <Avatar 
                      src={item.user.avatarUrl} 
                      initials={item.user.initials} 
                      size="md" 
                    />
                    {/* Small badge icon (Figma showed small colored dots attaching to some avatars) */}
                    {IndicatorColor && (
                      <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${IndicatorColor}`} />
                    )}
                  </div>

                  {/* Right Column (Content) */}
                  <div className="min-w-0 flex-1 py-1.5">
                    <div className="text-sm text-text-secondary leading-snug">
                      <span className="font-semibold text-text-primary mr-1">
                        {item.user.name}
                      </span>
                      {item.actionText}
                      {item.targetText && (
                        <span className="font-semibold text-text-primary ml-1">
                          {item.targetText}
                        </span>
                      )}
                      <span className="whitespace-nowrap text-text-tertiary ml-2">
                        {item.timestamp}
                      </span>
                    </div>

                    {/* Sub-attachments */}
                    {item.attachment && (
                      <div className="mt-2">
                        {item.attachment.type === "quote" && (
                          <div className="text-sm text-text-secondary italic pl-3 border-l-2 border-border py-1">
                            "{item.attachment.content}"
                          </div>
                        )}
                        
                        {item.attachment.type === "file" && (
                          <div className="inline-flex items-center gap-3 p-3 mt-1 rounded-xl border border-border bg-surface w-64 hover:bg-subtle transition-colors cursor-pointer">
                            <div className="h-8 w-8 rounded-lg bg-bg-muted flex items-center justify-center text-text-secondary">
                              <Icon icon={File02Icon} size="sm" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-text-primary truncate">
                                {item.attachment.fileName}
                              </span>
                              <span className="text-xs text-text-tertiary">
                                {item.attachment.fileSize}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
