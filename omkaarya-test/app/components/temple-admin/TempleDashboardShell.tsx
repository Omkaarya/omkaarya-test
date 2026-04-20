"use client";

import Link from "next/link";
import {
  Bell,
  LayoutDashboard,
  Mail,
  Maximize2,
  Menu,
  Package,
  Search,
  Settings,
  Sun,
  Moon,
  User,
  Users,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";

const navItems = [
  { href: "/temple-admin", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Inventory",
    icon: Package,
    items: [
      { href: "/temple-admin/inventory", label: "Products" },
      { href: "/temple-admin/inventory/categories", label: "Category" },
      { href: "/temple-admin/inventory/low-stock", label: "Low Stocks" },
      { href: "/temple-admin/inventory/print-barcode", label: "Print Barcode" },
      { href: "/temple-admin/inventory/print-qr", label: "Print QR Code" },
    ],
  },
  { href: "#", label: "Staff", icon: Users },
  { href: "#", label: "Settings", icon: Settings },
] as const;

export type TempleDashboardShellProps = {
  pathname: string;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  theme: string;
  onToggleTheme: () => void;
  children: React.ReactNode;
};

export function TempleDashboardShell({
  pathname,
  sidebarOpen,
  onSidebarOpenChange,
  theme,
  onToggleTheme,
  children,
}: TempleDashboardShellProps) {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-white font-sans text-[var(--text-primary)] dark:bg-zinc-950">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => onSidebarOpenChange(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-zinc-100 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center border-b border-zinc-100 px-6 dark:border-zinc-800">
          <span className="text-xl font-bold tracking-tight text-[var(--brand-primary)]">
            OMKAARYA
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              if ("items" in item) {
                // Group Header
                const isGroupActive = item.items.some(sub => pathname.startsWith(sub.href));
                return (
                  <li key={item.label} className="mt-4 first:mt-0">
                    <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      <item.icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </div>
                    <ul className="mt-1 space-y-0.5 pl-4">
                      {item.items.map((sub) => {
                        const active = pathname === sub.href;
                        return (
                          <li key={sub.label}>
                            <Link
                              href={sub.href}
                              onClick={() => onSidebarOpenChange(false)}
                              className={[
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                active
                                  ? "bg-orange-50 font-semibold text-[var(--brand-primary)] dark:bg-orange-950/20"
                                  : "text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60",
                              ].join(" ")}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              }

              const active = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => onSidebarOpenChange(false)}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-orange-50 font-semibold text-[var(--brand-primary)] dark:bg-orange-950/20"
                        : "text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60",
                    ].join(" ")}
                  >
                    <item.icon
                      className={`h-5 w-5 shrink-0 ${active ? "opacity-100" : "opacity-80"}`}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-64">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-100 bg-white px-4 pr-20 dark:border-zinc-800 dark:bg-zinc-950 lg:pr-24">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60 lg:hidden"
            onClick={() => onSidebarOpenChange(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <AdminBreadcrumbs pathname={pathname} />

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
              onClick={onToggleTheme}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-[var(--text-muted)] dark:bg-zinc-700 dark:text-zinc-300"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <footer className="shrink-0 border-t border-zinc-100 bg-white px-4 py-4 text-xs text-[var(--text-muted)] dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p>© 2024 - 2026 Om Kaaryaa</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[var(--brand-primary)]">Terms</a>
              <a href="#" className="hover:text-[var(--brand-primary)]">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
