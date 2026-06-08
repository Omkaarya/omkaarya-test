"use client";
import React from "react";
import { Avatar } from "@/app/components/ds/atoms/Avatar";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";

// ─── Table Cells ─────────────────────────────────────────────────

export const AvatarCell = ({
  src,
  initials,
  title,
  subtitle,
  titleTooltip,
  subtitleTooltip,
}: {
  src?: string;
  initials?: string;
  title: string;
  subtitle?: string;
  titleTooltip?: string;
  subtitleTooltip?: string;
}) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar src={src} initials={initials} size="sm" className="shrink-0" />
    <div className="flex min-w-0 flex-1 flex-col">
      <TruncateText
        className="text-sm font-medium text-text-primary"
        title={titleTooltip ?? title}
      >
        {title}
      </TruncateText>
      {subtitle ? (
        <TruncateText
          className="text-sm text-text-tertiary"
          title={subtitleTooltip ?? subtitle}
        >
          {subtitle}
        </TruncateText>
      ) : null}
    </div>
  </div>
);

export const TextCell = ({
  text,
  subtext,
  title,
  subtextTitle,
}: {
  text: React.ReactNode;
  subtext?: React.ReactNode;
  title?: string;
  subtextTitle?: string;
}) => (
  <div className="flex min-w-0 flex-col">
    <TruncateText
      className="text-sm text-text-secondary"
      title={title ?? (typeof text === "string" ? text : undefined)}
    >
      {text}
    </TruncateText>
    {subtext ? (
      <TruncateText
        className="text-sm text-text-tertiary"
        title={
          subtextTitle ?? (typeof subtext === "string" ? subtext : undefined)
        }
      >
        {subtext}
      </TruncateText>
    ) : null}
  </div>
);

export const EntityNameCell = ({
  title,
  subtitle,
  titleTooltip,
  subtitleTooltip,
  initials,
  icon,
  avatarSrc,
}: {
  title: string;
  subtitle?: string;
  titleTooltip?: string;
  subtitleTooltip?: string;
  initials?: string;
  icon?: React.ReactNode;
  avatarSrc?: string;
}) => (
  <div className="flex min-w-0 items-center gap-3">
    {avatarSrc || initials ? (
      <Avatar src={avatarSrc} initials={initials} size="sm" className="shrink-0" />
    ) : icon ? (
      <div className="shrink-0">{icon}</div>
    ) : null}
    <div className="min-w-0 flex-1">
      <TruncateText
        className="text-sm font-semibold text-text-primary"
        title={titleTooltip ?? title}
      >
        {title}
      </TruncateText>
      {subtitle ? (
        <TruncateText
          className="text-xs text-text-tertiary"
          title={subtitleTooltip ?? subtitle}
        >
          {subtitle}
        </TruncateText>
      ) : null}
    </div>
  </div>
);

export const BadgeCell = ({ label, color = "gray" }: { label: string; color?: "brand" | "success" | "warning" | "danger" | "gray" }) => (
  <Badge color={color as any}>{label}</Badge>
);

export const ActionGroupCell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-end gap-2 text-text-tertiary">
    {children}
  </div>
);

export type TableRowIconAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
};

/** Inline icon buttons for table row actions (no overflow menu). */
export const TableRowIconActions = ({ actions }: { actions: TableRowIconAction[] }) => (
  <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
    {actions.map((action, i) => (
      <button
        key={i}
        type="button"
        title={action.label}
        aria-label={action.label}
        disabled={action.disabled}
        onClick={(e) => {
          e.stopPropagation();
          action.onClick();
        }}
        className={`rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          action.danger
            ? "text-text-quaternary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            : "text-text-quaternary hover:bg-subtle hover:text-text-primary"
        }`}
      >
        {action.icon}
      </button>
    ))}
  </div>
);

// ─── Table Headers (if needed separately) ────────────────────────
export const TableHeaderCell = ({ title, sortable }: { title: string; sortable?: boolean }) => (
  <div className="flex items-center gap-1">
    {title}
    {/* Optional sort icon logic usually wrapped by the parent DataTable */}
  </div>
);
