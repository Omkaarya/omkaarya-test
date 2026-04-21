import React, { useRef, useEffect } from "react";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showValue?: boolean;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ label, value = 50, min = 0, max = 100, step = 1, showValue = true, onChange, className = "", ...props }, ref) => {
    
    // Calculate percentage for background track styling
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={`w-full flex flex-col gap-2 ${className}`}>
        {(label || showValue) && (
          <div className="flex justify-between items-center text-sm">
            {label && <span className="font-medium text-text-primary">{label}</span>}
            {showValue && <span className="text-text-secondary">{value}</span>}
          </div>
        )}
        <div className="relative flex items-center h-5 w-full">
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-1.5 appearance-none rounded-full bg-subtle outline-none custom-slider z-10"
            style={{
              background: `linear-gradient(to right, var(--color-brand) ${percentage}%, var(--color-subtle) ${percentage}%)`
            }}
            {...props}
          />
          <style dangerouslySetInnerHTML={{
            __html: `
              .custom-slider::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background-color: white;
                border: 2px solid var(--color-brand);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .custom-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background-color: white;
                border: 2px solid var(--color-brand);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
            `
          }} />
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";
