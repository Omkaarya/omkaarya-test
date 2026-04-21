"use client";
import React, { useState } from "react";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { ChevronDownIcon, XCloseIcon, File02Icon, PlusIcon } from "@/icons/duotone";

export interface ColorPickerProps {
  currentColor?: string;
  onColorChange?: (hex: string) => void;
  brandColors?: string[];
  savedColors?: string[];
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor = "#7F56D9",
  onColorChange,
  brandColors = ["#7F56D9", "#F04438", "#F79009", "#12B76A", "#0BA5EC", "#667085"],
  savedColors = ["#101828", "#344054", "#475467", "#667085", "#98A2B3"],
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"Solid" | "Gradient" | "Image">("Solid");

  return (
    <div className={`w-full max-w-[280px] bg-surface border border-border sm:rounded-xl shadow-lg p-4 flex flex-col gap-4 select-none ${className}`}>
      
      {/* Header Tabs & Close */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-4 text-sm font-semibold">
          <button 
            className={`transition-colors ${activeTab === "Solid" ? "text-brand" : "text-text-secondary hover:text-text-primary"}`}
            onClick={() => setActiveTab("Solid")}
          >
            Solid
          </button>
          <button 
            className={`transition-colors ${activeTab === "Gradient" ? "text-brand" : "text-text-secondary hover:text-text-primary"}`}
            onClick={() => setActiveTab("Gradient")}
          >
            Gradient
          </button>
          <button 
            className={`transition-colors ${activeTab === "Image" ? "text-brand" : "text-text-secondary hover:text-text-primary"}`}
            onClick={() => setActiveTab("Image")}
          >
            Image
          </button>
        </div>
        <button className="text-text-tertiary hover:text-text-secondary transition-colors">
          <Icon icon={XCloseIcon} size="sm" />
        </button>
      </div>

      {/* Main Color Gradient Area */}
      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border shadow-xs cursor-crosshair">
         {/* Background gradients mapping actual color logic is complex in CSS, we use a mock generic background */}
         <div 
           className="w-full h-full" 
           style={{
             backgroundColor: currentColor,
             backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)"
           }}
         />
         {/* Selector Ring */}
         <div className="absolute top-4 right-8 w-4 h-4 rounded-full border-2 border-white shadow-sm pointer-events-none" />
      </div>

      {/* Sliders Area */}
      <div className="flex items-center gap-3">
        {/* Eyedropper tool icon */}
        <button className="w-8 h-8 rounded-full border border-border bg-subtle flex items-center justify-center shrink-0 hover:bg-border/30 transition-colors">
          <Icon icon={PlusIcon} size="sm" className="rotate-45" />
        </button>

        <div className="flex flex-col flex-1 gap-2.5">
          {/* Hue slider mock */}
          <div className="w-full h-3 rounded-full relative shadow-xs" style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}>
             <div className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-white border border-border shadow-sm" style={{ left: "70%" }} />
          </div>
          {/* Opacity slider mock */}
          <div className="w-full h-3 rounded-full relative shadow-xs" style={{ background: `linear-gradient(to right, transparent, ${currentColor})` }}>
             <div className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-white border border-border shadow-sm" style={{ left: "100%" }} />
          </div>
        </div>
      </div>

      {/* Inputs Area */}
      <div className="grid grid-cols-[1fr_80px] gap-2 items-center">
        <Input 
          defaultValue={currentColor} 
          className="text-xs h-8 px-2 uppercase font-mono"
          leadingIcon={<span className="text-xs font-semibold px-2">Hex</span>}
        />
        <Input 
          defaultValue="100%" 
          className="text-xs h-8 px-2 text-center"
        />
      </div>

      <div className="w-full h-px bg-border my-1" />

      {/* Swatches Area */}
      <div className="flex flex-col gap-3">
        
        {/* Saved Colors */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">Saved</span>
            <button className="text-[10px] font-medium text-text-tertiary flex items-center hover:text-text-secondary">
               <Icon icon={PlusIcon} size="xs" className="mr-0.5" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedColors.map((c, i) => (
              <button key={`saved-${i}`} className="w-5 h-5 rounded-full shadow-xs border border-black/10" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        {/* Brand Colors */}
        <div className="flex flex-col gap-1.5 mt-2">
           <span className="text-xs font-semibold text-text-primary">Brand</span>
           <div className="flex flex-wrap gap-2">
            {brandColors.map((c, i) => (
              <button key={`brand-${i}`} className="w-5 h-5 rounded-full shadow-xs border border-black/10 transition-transform hover:scale-110" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
