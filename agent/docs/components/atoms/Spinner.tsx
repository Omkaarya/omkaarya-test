import React from "react";

// ─── Types ────────────────────────────────────────────────────────
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type SpinnerVariant = "arc" | "dots";

export interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  className?: string;
}

// ─── Size map ─────────────────────────────────────────────────────
const sizeMap: Record<SpinnerSize, { svg: string; stroke: number; text: string }> = {
  xs:    { svg: "h-4 w-4",   stroke: 2,   text: "text-xs" },
  sm:    { svg: "h-5 w-5",   stroke: 2.5, text: "text-xs" },
  md:    { svg: "h-6 w-6",   stroke: 3,   text: "text-sm" },
  lg:    { svg: "h-8 w-8",   stroke: 3,   text: "text-sm" },
  xl:    { svg: "h-10 w-10", stroke: 3.5, text: "text-base" },
  "2xl": { svg: "h-12 w-12", stroke: 4,   text: "text-base" },
};

// ─── Arc spinner (thin arc that spins) ────────────────────────────
const ArcSpinner: React.FC<{ size: SpinnerSize }> = ({ size }) => {
  const { svg, stroke } = sizeMap[size];
  return (
    <svg
      className={`animate-spin ${svg} text-brand`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={stroke}
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

// ─── Dots spinner (rotating dots) ─────────────────────────────────
const DotsSpinner: React.FC<{ size: SpinnerSize }> = ({ size }) => {
  const { svg } = sizeMap[size];
  return (
    <div className={`relative ${svg}`} aria-hidden>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-brand"
          style={{
            top: "50%",
            left: "50%",
            transform: `rotate(${i * 45}deg) translateX(140%) translateY(-50%)`,
            opacity: 0.2 + i * 0.1,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────
export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "arc",
  label = "Loading...",
  className = "",
}) => {
  const { text } = sizeMap[size];

  return (
    <div
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      role="status"
      aria-label={label}
    >
      {variant === "arc" ? (
        <ArcSpinner size={size} />
      ) : (
        <DotsSpinner size={size} />
      )}
      {label && (
        <span className={`${text} text-text-tertiary`} aria-hidden>
          {label}
        </span>
      )}
    </div>
  );
};

// ─── FullPageSpinner ──────────────────────────────────────────────
export const FullPageSpinner: React.FC<{ label?: string }> = ({
  label = "Loading...",
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-overlay z-50">
    <Spinner size="xl" label={label} />
  </div>
);
