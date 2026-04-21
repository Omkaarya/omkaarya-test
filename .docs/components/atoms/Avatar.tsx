import React from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────
export type AvatarSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarIndicator = "none" | "online" | "offline" | "busy" | "verified";

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  indicator?: AvatarIndicator;
  className?: string;
}

// ─── Size map ─────────────────────────────────────────────────────
const sizeMap: Record<AvatarSize, { container: string; text: string; indicator: string; indicatorPos: string }> = {
  xxs: { container: "h-6 w-6",   text: "text-[10px]", indicator: "h-1.5 w-1.5", indicatorPos: "bottom-0 right-0" },
  xs:  { container: "h-8 w-8",   text: "text-xs",     indicator: "h-2 w-2",     indicatorPos: "bottom-0 right-0" },
  sm:  { container: "h-9 w-9",   text: "text-sm",     indicator: "h-2.5 w-2.5", indicatorPos: "bottom-0 right-0" },
  md:  { container: "h-10 w-10", text: "text-sm",     indicator: "h-2.5 w-2.5", indicatorPos: "bottom-0.5 right-0.5" },
  lg:  { container: "h-11 w-11", text: "text-base",   indicator: "h-3 w-3",     indicatorPos: "bottom-0.5 right-0.5" },
  xl:  { container: "h-12 w-12", text: "text-lg",     indicator: "h-3 w-3",     indicatorPos: "bottom-0.5 right-0.5" },
  "2xl":{ container: "h-14 w-14",text: "text-xl",     indicator: "h-3.5 w-3.5", indicatorPos: "bottom-1 right-1" },
};

// ─── Indicator color / style ──────────────────────────────────────
const indicatorStyles: Record<AvatarIndicator, string | null> = {
  none:     null,
  online:   "bg-status-success-text border-2 border-surface rounded-full",
  offline:  "bg-text-disabled border-2 border-surface rounded-full",
  busy:     "bg-status-warning-text border-2 border-surface rounded-full",
  verified: "bg-brand-primary border-2 border-surface rounded-full flex items-center justify-center",
};

// ─── Placeholder icon ─────────────────────────────────────────────
const PlaceholderIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M12 2a5 5 0 100 10A5 5 0 0012 2zM4 20a8 8 0 0116 0H4z"
      clipRule="evenodd"
    />
  </svg>
);

// ─── Verified check icon (tiny) ───────────────────────────────────
const CheckIcon = () => (
  <svg className="h-2 w-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────────
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  initials,
  size = "md",
  indicator = "none",
  className = "",
}) => {
  const s = sizeMap[size];
  const indicatorStyle = indicatorStyles[indicator];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {/* Avatar circle */}
      <div
        className={`
          ${s.container} rounded-full overflow-hidden
          flex items-center justify-center
          ${src ? "" : initials ? "bg-bg-brand-secondary text-text-brand font-semibold" : "bg-subtle text-text-tertiary"}
        `}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <span className={`${s.text} font-semibold select-none`}>{initials}</span>
        ) : (
          <PlaceholderIcon className={`${s.text} h-3/5 w-3/5`} />
        )}
      </div>

      {/* Indicator dot */}
      {indicatorStyle && (
        <span
          className={`absolute ${s.indicator} ${s.indicatorPos} ${indicatorStyle}`}
        >
          {indicator === "verified" && <CheckIcon />}
        </span>
      )}
    </div>
  );
};
