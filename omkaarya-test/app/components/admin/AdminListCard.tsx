import type { ReactNode } from "react";

const shellClass =
  "overflow-hidden rounded-2xl border border-border bg-surface shadow-xs";

const innerClass = "min-w-0";

type AdminListCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Outer shell for super-admin list pages: matches the Temples list card (border, radius, surface).
 */
export default function AdminListCard({ children, className = "" }: AdminListCardProps) {
  return (
    <div className={`${shellClass} ${className}`.trim()}>
      <div className={innerClass}>{children}</div>
    </div>
  );
}

export const adminListCardClassName = shellClass;
