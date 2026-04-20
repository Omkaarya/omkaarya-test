"use client";
import React from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { Icon } from "@/components/atoms/Icon";
import { PlayIcon, File02Icon, HeartIcon } from "@/icons/duotone";

export interface MessageProps {
  id: string;
  sender: {
    name: string;
    avatarUrl?: string;
    initials?: string;
  };
  timestamp: string;
  isOutgoing?: boolean;
  content?: string;
  attachment?: {
    type: "image" | "file" | "audio" | "link";
    url?: string;
    fileName?: string;
    fileSize?: string;
    duration?: string; // for audio
  };
  reactions?: { count: number; icon: any }[];
}

export const MessageBubble: React.FC<MessageProps> = ({
  sender,
  timestamp,
  isOutgoing = false,
  content,
  attachment,
  reactions,
}) => {
  return (
    <div className={`flex items-end gap-3 mb-6 w-full ${isOutgoing ? "flex-row-reverse" : ""}`}>
      
      {/* Avatar (Only incoming) */}
      {!isOutgoing && (
        <div className="shrink-0">
           <Avatar src={sender.avatarUrl} initials={sender.initials} size="sm" />
        </div>
      )}

      {/* Message Body */}
      <div className={`flex flex-col min-w-0 max-w-[80%] ${isOutgoing ? "items-end" : "items-start"}`}>
        
        {/* Name / Time Header */}
        {!isOutgoing && (
          <div className="flex items-center gap-2 mb-1 px-1">
             <span className="text-xs font-semibold text-text-primary">{sender.name}</span>
             <span className="text-xs text-text-tertiary">{timestamp}</span>
          </div>
        )}
        {isOutgoing && (
          <div className="flex items-center gap-2 mb-1 px-1">
             <span className="text-xs text-text-tertiary">{timestamp}</span>
             <span className="text-xs font-semibold text-text-primary">You</span>
          </div>
        )}

        {/* Text Content Container */}
        {content && (
          <div 
            className={`
              px-4 py-2.5 rounded-2xl text-sm leading-relaxed mb-1 shadow-xs
              ${isOutgoing 
                ? "bg-brand text-white rounded-br-sm" 
                : "bg-surface border border-border text-text-secondary rounded-bl-sm"}
            `}
          >
            {content}
          </div>
        )}

        {/* Attachments */}
        {attachment && (
          <div className="mt-1 w-full flex flex-col gap-1">
            
            {/* Audio Attachment */}
            {attachment.type === "audio" && (
              <div 
                className={`
                  flex items-center gap-3 p-2 rounded-full cursor-pointer shadow-xs border
                  ${isOutgoing ? "bg-brand/10 border-brand/20 w-64" : "bg-surface border-border w-64"}
                `}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isOutgoing ? "bg-brand text-white" : "bg-subtle text-text-secondary"} `}>
                   <Icon icon={PlayIcon} size="xs" className="ml-0.5" />
                </div>
                {/* Mock wave */}
                <div className="flex-1 h-3 flex items-center justify-between px-1 opacity-50">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className={`w-1 rounded-full ${isOutgoing ? "bg-brand" : "bg-text-tertiary"}`} style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                  ))}
                </div>
                <span className={`text-xs font-mono pr-2 ${isOutgoing ? "text-brand" : "text-text-tertiary"}`}>
                  {attachment.duration || "0:00"}
                </span>
              </div>
            )}

            {/* Image Attachment */}
            {attachment.type === "image" && (
              <div className="w-64 h-40 rounded-xl overflow-hidden border border-border shadow-xs bg-subtle">
                <img src={attachment.url} alt="Attachment" className="w-full h-full object-cover" />
              </div>
            )}

            {/* File Attachment */}
            {attachment.type === "file" && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface w-64 hover:bg-subtle transition-colors cursor-pointer shadow-xs">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-red-100/50 flex items-center justify-center text-status-danger-text">
                  <Icon icon={File02Icon} size="md" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-text-primary truncate">{attachment.fileName}</span>
                  <span className="text-xs text-text-tertiary">{attachment.fileSize}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
             {reactions.map((reaction, rIdx) => (
               <div key={rIdx} className="flex items-center gap-1 bg-surface border border-border rounded-full px-2 py-0.5 shadow-xs">
                 <Icon icon={reaction.icon || HeartIcon} size="sm" className="text-status-danger-text w-3 h-3" />
                 <span className="text-xs font-medium text-text-secondary">{reaction.count}</span>
               </div>
             ))}
          </div>
        )}

      </div>
    </div>
  );
};
