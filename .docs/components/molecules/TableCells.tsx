"use client";
import React from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { Badge } from "@/components/atoms/Badge";

// ─── Table Cells ─────────────────────────────────────────────────

export const AvatarCell = ({ src, initials, title, subtitle }: { src?: string; initials?: string; title: string; subtitle?: string }) => (
  <div className="flex items-center gap-3">
    <Avatar src={src} initials={initials} size="sm" />
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-medium text-text-primary truncate">{title}</span>
      {subtitle && <span className="text-sm text-text-tertiary truncate">{subtitle}</span>}
    </div>
  </div>
);

export const TextCell = ({ text, subtext }: { text: React.ReactNode; subtext?: React.ReactNode }) => (
  <div className="flex flex-col min-w-0">
     <span className="text-sm text-text-secondary truncate">{text}</span>
     {subtext && <span className="text-sm text-text-tertiary truncate">{subtext}</span>}
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

// ─── Table Headers (if needed separately) ────────────────────────
export const TableHeaderCell = ({ title, sortable }: { title: string; sortable?: boolean }) => (
  <div className="flex items-center gap-1">
    {title}
    {/* Optional sort icon logic usually wrapped by the parent DataTable */}
  </div>
);
