import React from "react";
import { Avatar, AvatarSize, AvatarProps } from "@/components/atoms/Avatar";

// ─── AvatarGroup ──────────────────────────────────────────────────
// Stacked overlapping avatars with overflow count
export interface AvatarGroupItem extends Omit<AvatarProps, "size" | "indicator"> {
  id: string | number;
}

export interface AvatarGroupProps {
  avatars: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
}

const sizeOverlap: Record<AvatarSize, string> = {
  xxs:  "-ml-2",
  xs:   "-ml-2",
  sm:   "-ml-2.5",
  md:   "-ml-3",
  lg:   "-ml-3",
  xl:   "-ml-3.5",
  "2xl":"-ml-4",
};

const sizeContainer: Record<AvatarSize, string> = {
  xxs:  "h-6 w-6 text-[10px]",
  xs:   "h-8 w-8 text-xs",
  sm:   "h-9 w-9 text-xs",
  md:   "h-10 w-10 text-sm",
  lg:   "h-11 w-11 text-sm",
  xl:   "h-12 w-12 text-base",
  "2xl":"h-14 w-14 text-base",
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = "md",
}) => {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className="flex items-center">
      {visible.map((av, i) => (
        <div
          key={av.id}
          className={`relative ring-2 ring-surface rounded-full ${i > 0 ? sizeOverlap[size] : ""}`}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar
            src={av.src}
            alt={av.alt}
            initials={av.initials}
            size={size}
          />
        </div>
      ))}

      {overflow > 0 && (
        <div
          className={`
            relative ${sizeOverlap[size]} z-0
            ${sizeContainer[size]}
            rounded-full ring-2 ring-surface
            bg-subtle text-text-secondary font-semibold
            flex items-center justify-center
          `}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

// ─── AvatarLabelGroup ─────────────────────────────────────────────
// Avatar + name + optional email/subtitle
export interface AvatarLabelGroupProps extends Omit<AvatarProps, "size"> {
  name: string;
  subtitle?: string;
  size?: AvatarSize;
  supportingText?: string;
}

const labelSizeMap: Record<AvatarSize, { name: string; sub: string; gap: string }> = {
  xxs:  { name: "text-xs font-semibold",  sub: "text-[10px]", gap: "gap-1.5" },
  xs:   { name: "text-xs font-semibold",  sub: "text-xs",     gap: "gap-2" },
  sm:   { name: "text-sm font-semibold",  sub: "text-xs",     gap: "gap-2" },
  md:   { name: "text-sm font-semibold",  sub: "text-xs",     gap: "gap-3" },
  lg:   { name: "text-sm font-semibold",  sub: "text-xs",     gap: "gap-3" },
  xl:   { name: "text-base font-semibold",sub: "text-sm",     gap: "gap-3" },
  "2xl":{ name: "text-lg font-semibold",  sub: "text-base",   gap: "gap-4" },
};

export const AvatarLabelGroup: React.FC<AvatarLabelGroupProps> = ({
  name,
  subtitle,
  supportingText,
  size = "md",
  ...avatarProps
}) => {
  const l = labelSizeMap[size];

  return (
    <div className={`inline-flex items-center ${l.gap}`}>
      <Avatar size={size} {...avatarProps} />
      <div className="flex flex-col">
        <span className={`${l.name} text-text-primary leading-tight`}>{name}</span>
        {(subtitle || supportingText) && (
          <span className={`${l.sub} text-text-tertiary leading-tight`}>
            {subtitle ?? supportingText}
          </span>
        )}
      </div>
    </div>
  );
};
