"use client";

/**
 * Only this region scrolls. Sits on the shell with a light grey (light) or near-black (dark) fill and rounded border.
 */
export function AdminDashboardMainPanel({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden ">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-zinc-200/90 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 p-4 sm:p-6">
        {children}
      </div>
    </main>
  );
}
