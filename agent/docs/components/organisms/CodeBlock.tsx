"use client";
import React, { useState } from "react";
import { Icon } from "@/components/atoms/Icon";
import { CopyIcon, CheckIcon } from "@/icons/duotone";

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "tsx",
  showLineNumbers = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple formatting helper for TSX strings to colorize keywords without a heavyweight library
  const highlightCode = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Basic highlighting (this is just for aesthetic presentation in docs)
      let formattedLine = line
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\b(const|let|var|function|return|export|import|from|default)\b/g, '<span class="text-pink-400">$1</span>')
        .replace(/\b(Button|Icon|Badge|Select|Input)\b/g, '<span class="text-indigo-400">$1</span>')
        .replace(/(\w+)=/g, '<span class="text-sky-300">$1</span>=')
        .replace(/("[^"]*")/g, '<span class="text-emerald-300">$1</span>');

      return (
        <div key={i} className="table-row">
          {showLineNumbers && (
            <span className="table-cell text-right pr-4 text-text-tertiary select-none opacity-50 text-xs align-middle">
              {i + 1}
            </span>
          )}
          <span 
            className="table-cell whitespace-pre-wrap font-mono text-sm leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: formattedLine || " " }} 
          />
        </div>
      );
    });
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-[#0f1115] border border-border border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-text-tertiary hover:text-white transition-colors p-1 rounded"
          title="Copy code"
        >
          <Icon icon={copied ? CheckIcon : CopyIcon} size="xs" color={copied ? "success" : "secondary"} />
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-gray-300">
        <div className="table w-full">
          {highlightCode(code.trim())}
        </div>
      </div>
    </div>
  );
};
