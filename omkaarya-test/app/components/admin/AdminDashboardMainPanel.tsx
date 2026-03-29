"use client";

/**
 * Only this region scrolls. Sits on the white shell with a light grey fill and rounded border.
 */
export function AdminDashboardMainPanel({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden ">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-zinc-200/90 bg-zinc-100 dark:border-zinc-700/80 dark:bg-zinc-900/60 p-4 sm:p-6">
        {children}
      </div>
    </main>
  );
}
