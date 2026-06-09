"use client";

/**
 * Only this region scrolls. Matches super-admin `AdminDashboardMainPanel` layout.
 */
export function TempleDashboardMainPanel({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-0 min-w-0 overflow-hidden">
      <div className="h-full min-h-0 overflow-y-auto rounded-xl border border-zinc-200/90 bg-zinc-100 p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {children}
      </div>
    </main>
  );
}
