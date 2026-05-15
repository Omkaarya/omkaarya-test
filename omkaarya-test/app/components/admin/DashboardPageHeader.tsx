import type { ReactNode } from "react";

export type DashboardPageHeaderProps = {
  /** Optional breadcrumb row (temple pattern: text-xs text-text-tertiary + links). */
  breadcrumb?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Shown inline after the title (e.g. count pill). */
  titleAccessory?: ReactNode;
  actions?: ReactNode;
};

/**
 * Page title block aligned with temple-admin dashboard screens
 * (e.g. `temple-admin/(dashboard)/finance/donations/page.tsx`).
 */
export function DashboardPageHeader({
  breadcrumb,
  title,
  description,
  titleAccessory,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <div className={breadcrumb ? "space-y-2" : undefined}>
      {breadcrumb ? (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-tertiary">{breadcrumb}</div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {titleAccessory ? (
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-display-xs font-bold tracking-tight text-text-primary">{title}</h1>
              {titleAccessory}
            </div>
          ) : (
            <h1 className="text-display-xs font-bold tracking-tight text-text-primary">{title}</h1>
          )}
          {description != null ? (
            <div className="mt-1 text-sm text-text-tertiary">{description}</div>
          ) : null}
        </div>
        {actions != null ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
