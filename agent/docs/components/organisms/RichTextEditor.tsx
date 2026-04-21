"use client";
import React, { useState } from "react";
import { Icon } from "@/components/atoms/Icon";
import { 
  TypeBold02Icon, 
  TypeItalic02Icon, 
  TypeUnderline01Icon, 
  TypeStrikethrough01Icon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ListIcon,
  ListArrowDown01Icon,
  Link01Icon,
  ImageUpdate01Icon,
} from "@/icons/duotone";

export interface RichTextEditorProps {
  initialValue?: string;
  onChange?: (val: string) => void;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = "",
  onChange,
  maxLength = 1000,
  className = "",
  disabled = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set(["bold"])); // Mock initial state
  const charCount = value.length;

  const toggleFormat = (format: string) => {
    setActiveFormats(prev => {
      const next = new Set(prev);
      if (next.has(format)) next.delete(format);
      else next.add(format);
      return next;
    });
  };

  const ToolbarButton = ({ icon, format }: { icon: any; format: string }) => {
    const isActive = activeFormats.has(format);
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => toggleFormat(format)}
        className={`
          flex items-center justify-center p-1.5 rounded-md transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isActive && !disabled ? "bg-subtle text-text-primary" : "text-text-tertiary hover:bg-subtle hover:text-text-secondary"}
        `}
      >
        <Icon icon={icon} size="sm" />
      </button>
    );
  };

  const Divider = () => <div className="w-px h-5 bg-border mx-1" />;

  return (
    <div className={`flex flex-col w-full rounded-xl border transition-colors focus-within:border-brand focus-within:ring-1 focus-within:ring-brand ${disabled ? "bg-bg-disabled border-border opacity-70" : "bg-surface border-border"} ${className}`}>
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-subtle/30 rounded-t-xl overflow-x-auto">
        <ToolbarButton icon={TypeBold02Icon} format="bold" />
        <ToolbarButton icon={TypeItalic02Icon} format="italic" />
        <ToolbarButton icon={TypeUnderline01Icon} format="underline" />
        <ToolbarButton icon={TypeStrikethrough01Icon} format="strikethrough" />
        
        <Divider />
        
        <ToolbarButton icon={AlignLeftIcon} format="align-left" />
        <ToolbarButton icon={AlignCenterIcon} format="align-center" />
        <ToolbarButton icon={AlignRightIcon} format="align-right" />
        
        <Divider />

        <ToolbarButton icon={ListIcon} format="bullet-list" />
        <ToolbarButton icon={ListArrowDown01Icon} format="number-list" />
        
        <Divider />

        <ToolbarButton icon={Link01Icon} format="link" />
        <ToolbarButton icon={ImageUpdate01Icon} format="image" />

        <div className="ml-auto flex items-center gap-2 pr-1">
          {/* Mock selectors for Font/Size shown in Figma */}
          <select disabled={disabled} className="text-xs bg-transparent border-none text-text-secondary focus:outline-none appearance-none cursor-pointer">
            <option>Inter</option>
            <option>Poppins</option>
          </select>
          <select disabled={disabled} className="text-xs bg-transparent border-none text-text-secondary focus:outline-none appearance-none cursor-pointer">
            <option>16px</option>
            <option>14px</option>
          </select>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 min-h-[200px]">
        {/* We use a standard textarea for functional placeholder, simulating a WYSIWYG */}
        <textarea
          disabled={disabled}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder="Enter a description..."
          className="w-full h-full min-h-[200px] p-4 bg-transparent resize-y text-sm text-text-primary focus:outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed"
        />
      </div>

      {/* Footer Info */}
      <div className="flex justify-start px-4 py-3 border-t border-border bg-transparent rounded-b-xl">
        <span className="text-xs font-medium text-text-tertiary">
          {charCount} / {maxLength} characters remaining
        </span>
      </div>
    </div>
  );
};
