"use client";
import React from "react";

export interface ContentDividerProps {
  children?: React.ReactNode;
  className?: string;
  lineClassName?: string;
}

export const ContentDivider: React.FC<ContentDividerProps> = ({
  children,
  className = "",
  lineClassName = ""
}) => {
  return (
    <div className={`relative flex items-center py-4 ${className}`}>
      <div className={`flex-grow border-t border-border ${lineClassName}`} />
      
      {children && (
        <div className="shrink-0 max-w-full px-4 flex justify-center">
          {children}
        </div>
      )}
      
      <div className={`flex-grow border-t border-border ${lineClassName}`} />
    </div>
  );
};

// --- Pre-packaged Inner Content Types ---

export const DividerLabel: React.FC<{ text: string }> = ({ text }) => (
  <span className="text-sm font-semibold text-text-primary px-2">{text}</span>
);

export const DividerText: React.FC<{ text: string }> = ({ text }) => (
  <span className="text-sm text-text-tertiary px-2">{text}</span>
);

export const DividerButton: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="h-8 px-4 rounded-lg bg-surface border border-border text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-subtle transition-colors shadow-xs"
  >
    {label}
  </button>
);

export const DividerSegmentedControl: React.FC<{ 
  tabs: string[]; 
  activeTab?: string; 
  onChange?: (tab: string) => void 
}> = ({ tabs, activeTab, onChange }) => (
  <div className="flex items-center rounded-lg bg-surface border border-border p-0.5 shadow-xs">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange?.(tab)}
        className={`
          flex-1 px-4 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap
          ${activeTab === tab 
            ? "bg-subtle text-text-primary shadow-xs border border-border/50" 
            : "text-text-secondary hover:text-text-primary hover:bg-subtle/50 border border-transparent"}
        `}
      >
        {tab}
      </button>
    ))}
  </div>
);

export const DividerIconGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center rounded-lg bg-surface border border-border shadow-xs overflow-hidden">
    {children}
  </div>
);
