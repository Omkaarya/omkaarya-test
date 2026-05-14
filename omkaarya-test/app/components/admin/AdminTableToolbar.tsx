import type { ReactNode } from "react";

type AdminTableToolbarProps = {
  children: ReactNode;
  className?: string;
  /** Search on first row, filters/tabs on second (e.g. invoices with many tabs). */
  stacked?: boolean;
};

/**
 * Top stripe inside AdminListCard: search + filters in one row on md+, stacked on small screens.
 */
export function AdminTableToolbar({ children, className = "", stacked = false }: AdminTableToolbarProps) {
  const layout = stacked
    ? "flex flex-col gap-3 border-b border-border p-4"
    : "flex flex-col gap-3 border-b border-border p-4 md:flex-row md:flex-nowrap md:items-center md:gap-3";
  return <div className={`${layout} ${className}`.trim()}>{children}</div>;
}

/** Search / primary controls: grows to fill width on desktop (`min-w-0` avoids flex overflow). */
export function AdminTableToolbarStart({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 flex-1 ${className}`.trim()}>{children}</div>;
}

/** Filters, selects, tab groups: wrap on narrow viewports; align end on desktop. */
export function AdminTableToolbarEnd({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex w-full shrink-0 flex-wrap items-center gap-2 md:w-auto md:justify-end ${className}`.trim()}
    >
      {children}
    </div>
  );
}
