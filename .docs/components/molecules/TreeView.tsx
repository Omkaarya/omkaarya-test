"use client";
import React, { useState } from "react";
import { Icon } from "@/components/atoms/Icon";
import { Avatar } from "@/components/atoms/Avatar";
import { FolderIcon, File02Icon, ChevronRightIcon, ChevronDownIcon } from "@/icons/duotone";

export interface TreeItem {
  id: string;
  label: string;
  type?: "folder" | "file" | "doc" | "user";
  avatarSrc?: string;
  children?: TreeItem[];
  defaultExpanded?: boolean;
}

export interface TreeViewProps {
  items: TreeItem[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  className?: string;
}

// Recursive node renderer
const TreeNode: React.FC<{
  node: TreeItem;
  depth: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
}> = ({ node, depth, selectedId, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(node.defaultExpanded ?? false);
  const isSelected = selectedId === node.id;
  const isFolder = node.type === "folder" || (node.children && node.children.length > 0);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    if (onSelect) onSelect(node.id);
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        onClick={handleSelect}
        className={`
          flex items-center w-full py-1.5 px-2 rounded-md cursor-pointer transition-colors group select-none
          ${isSelected ? "bg-subtle text-text-primary" : "text-text-secondary hover:bg-subtle/50 hover:text-text-primary"}
        `}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        
        {/* Interaction Caret Area */}
        <div 
          onClick={isFolder ? toggleExpand : undefined}
          className={`w-5 h-5 flex items-center justify-center shrink-0 mr-1 rounded hover:bg-border/50 text-text-tertiary transition-colors ${!isFolder ? "opacity-0 cursor-default" : ""}`}
        >
           {isFolder && (
             <Icon icon={isExpanded ? ChevronDownIcon : ChevronRightIcon} size="sm" />
           )}
        </div>

        {/* Node Icon */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0 mr-2">
          {node.type === "folder" || isFolder ? (
            <Icon icon={FolderIcon} size="sm" className="text-text-tertiary" />
          ) : node.type === "user" && node.avatarSrc ? (
            <Avatar src={node.avatarSrc} size="xs" />
          ) : (
            <Icon icon={File02Icon} size="sm" className="text-text-tertiary" />
          )}
        </div>

        {/* Node Label */}
        <span className="text-sm font-medium truncate">{node.label}</span>
      </div>

      {/* Recursive Children Drop */}
      {isExpanded && node.children && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              selectedId={selectedId} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  items,
  onSelect,
  selectedId,
  className = "",
}) => {
  return (
    <div className={`w-full flex flex-col py-2 overflow-y-auto ${className}`}>
      {items.map((item) => (
        <TreeNode 
          key={item.id} 
          node={item} 
          depth={0} 
          selectedId={selectedId} 
          onSelect={onSelect} 
        />
      ))}
    </div>
  );
};
