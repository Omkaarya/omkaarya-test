"use client";

/**
 * Scrollable main region (below header, above footer): page routes render here.
 * Slight rounding on the content well only.
 */
export function AdminDashboardMainPanel({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto rounded-lg p-4 sm:p-6">{children}</main>
  );
}
