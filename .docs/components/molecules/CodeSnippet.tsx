"use client";
import React, { useState } from "react";
import { Icon } from "@/components/atoms/Icon";
import { Copy01Icon, CheckIcon } from "@/icons/duotone";
import { Button } from "@/components/atoms/Button";

export interface CodeSnippetProps {
  code: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  language?: string;
  maxHeight?: number; // e.g. 300 to show "Show more"
  className?: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  tabs,
  activeTab,
  onTabChange,
  language = "typescript",
  maxHeight,
  className = "",
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!maxHeight);

  const lines = code.trim().split("\n");
  const needsExpansion = maxHeight && !isExpanded;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy code");
    }
  };

  return (
    <div className={`relative flex flex-col w-full rounded-2xl border border-border bg-surface overflow-hidden shadow-xs ${className}`}>
      
      {/* Header bar (Tabs + Copy) */}
      {(tabs || true) && (
        <div className="flex items-center justify-between border-b border-border bg-subtle px-2">
          
          <div className="flex items-end gap-1 px-1 h-12">
            {tabs ? tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`
                  px-4 h-9 text-sm font-semibold rounded-t-lg transition-colors border-b-2
                  ${activeTab === tab 
                    ? "text-text-primary border-brand bg-surface" 
                    : "text-text-tertiary border-transparent hover:text-text-secondary"}
                `}
              >
                {tab}
              </button>
            )) : (
              <div className="px-3 py-2 text-xs font-mono font-medium text-text-tertiary uppercase">
                {language}
              </div>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 mr-2 text-text-tertiary hover:text-text-secondary hover:bg-surface rounded-md transition-all"
            title="Copy code"
          >
            <Icon icon={isCopied ? CheckIcon : Copy01Icon} size="sm" className={isCopied ? "text-status-success-text" : ""} />
          </button>
        </div>
      )}

      {/* Code Body */}
      <div 
        className={`relative w-full bg-surface ${needsExpansion ? "overflow-hidden" : "overflow-x-auto"}`}
        style={{ maxHeight: needsExpansion ? `${maxHeight}px` : undefined }}
      >
        <table className="w-full text-left border-collapse text-sm font-mono leading-relaxed text-text-secondary">
          <tbody className="align-top">
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-subtle/50 transition-colors">
                <td className="w-12 px-4 py-0.5 text-right text-text-tertiary select-none border-r border-border/50 sticky left-0 bg-surface">
                  {idx + 1}
                </td>
                <td className="px-4 py-0.5 whitespace-pre">
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Gradient Fade for Expansion */}
        {needsExpansion && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent flex items-end justify-center pb-4">
             <Button variant="outline" size="sm" onClick={() => setIsExpanded(true)} className="bg-surface shadow-md">
               Show more
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};
