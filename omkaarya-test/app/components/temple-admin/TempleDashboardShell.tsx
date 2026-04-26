"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Cookie,
  Database,
  DollarSign,
  LayoutDashboard,
  Lock,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  User,
  Users,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";

// ── Nav Configuration ──────────────────────────────────────────────
// Each group has an optional `moduleKey` for feature access control.
// If moduleKey is set and the module is disabled, the nav group is hidden.

type NavSubItem = { href: string; label: string };
type NavGroup = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKey?: string; // links to feature-module-map
  items: NavSubItem[];
};
type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKey?: string;
};
type NavItem = NavGroup | NavLink;

const navItems: NavItem[] = [
  { href: "/temple-admin", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Finance",
    icon: DollarSign,
    moduleKey: "finance",
    items: [
      { href: "/temple-admin/finance", label: "Dashboard" },
      { href: "/temple-admin/finance/transactions", label: "Transactions" },
      { href: "/temple-admin/finance/transactions/add", label: "Add Transaction" },
      { href: "/temple-admin/finance/donations", label: "Donations" },
      { href: "/temple-admin/finance/receipts/generate", label: "Generate Receipt" },
      { href: "/temple-admin/finance/reports", label: "Reports" },
      { href: "/temple-admin/finance/purchase-orders", label: "Purchase Orders" },
      { href: "/temple-admin/finance/assets", label: "Assets Management" },
    ],
  },
  {
    label: "Inventory",
    icon: Package,
    moduleKey: "inventory",
    items: [
      { href: "/temple-admin/inventory", label: "Products" },
      { href: "/temple-admin/inventory/create", label: "Add Product" },
      { href: "/temple-admin/inventory/categories", label: "Categories" },
      { href: "/temple-admin/inventory/stores", label: "Stores" },
      { href: "/temple-admin/inventory/suppliers", label: "Suppliers" },
      { href: "/temple-admin/inventory/low-stock", label: "Stock Alerts" },
      { href: "/temple-admin/inventory/adjustments", label: "Stock Adjustments" },
      { href: "/temple-admin/inventory/pooja-bom", label: "Pooja BOM" },
      { href: "/temple-admin/inventory/return-from-pooja", label: "Return from Pooja" },
      { href: "/temple-admin/inventory/print-labels", label: "Print Labels" },
    ],
  },
  {
    label: "Seva Bookings",
    icon: CalendarDays,
    moduleKey: "bookings",
    items: [
      { href: "/temple-admin/bookings", label: "Booking Schedules" },
      { href: "/temple-admin/bookings/calendar", label: "Booking Calendar" },
      { href: "/temple-admin/bookings/new", label: "New Booking" },
    ],
  },
  { href: "/temple-admin/pos", label: "POS", icon: ShoppingCart, moduleKey: "pos" },
  {
    label: "Prashadham",
    icon: Cookie,
    moduleKey: "prasad",
    items: [
      { href: "/temple-admin/prasad", label: "Prashadham Items" },
      { href: "/temple-admin/prasad/categories", label: "Categories" },
    ],
  },
  {
    label: "Master Data",
    icon: Database,
    moduleKey: "master",
    items: [
      { href: "/temple-admin/master", label: "All Master Data" },
    ],
  },
  {
    label: "Peoples",
    icon: Users,
    moduleKey: "peoples",
    items: [
      { href: "/temple-admin/peoples/staff", label: "Staff Management" },
      { href: "/temple-admin/peoples/roles", label: "Role & Permissions" },
      { href: "/temple-admin/peoples/devotees", label: "Devotee Management" },
    ],
  },
  { href: "/temple-admin/settings/general", label: "Settings", icon: Settings },
];

// ── Shell Props ────────────────────────────────────────────────────

export type TempleDashboardShellProps = {
  pathname: string;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  theme: string;
  onToggleTheme: () => void;
  children: React.ReactNode;
  /**
   * Set of module keys that are disabled for this tenant.
   * Nav items with a matching moduleKey will be hidden or shown as locked.
   * Empty set = all modules accessible (backward compatible).
   */
  disabledModules?: Set<string>;
};

export function TempleDashboardShell({
  pathname,
  sidebarOpen,
  onSidebarOpenChange,
  theme,
  onToggleTheme,
  children,
  disabledModules = new Set(),
}: TempleDashboardShellProps) {
  /**
   * Check if a module is disabled.
   * Items without moduleKey are always visible (e.g. Dashboard, Settings).
   */
  const isModuleDisabled = (moduleKey?: string): boolean => {
    if (!moduleKey) return false;
    return disabledModules.has(moduleKey);
  };

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
              // Check if this module is disabled
              const disabled = isModuleDisabled(item.moduleKey);

              if ("items" in item) {
                // ── Group nav ──────────────────────────
                if (disabled) {
                  // Show locked group
                  return (
                    <li key={item.label} className="mt-4 first:mt-0 opacity-40">
                      <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <item.icon className="h-4 w-4" aria-hidden />
                        {item.label}
                        <Lock className="ml-auto h-3 w-3" />
                      </div>
                    </li>
                  );
                }

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

              // ── Single nav link ──────────────────────
              if (disabled) {
                return (
                  <li key={item.label} className="opacity-40">
                    <span className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] cursor-not-allowed">
                      <item.icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                      {item.label}
                      <Lock className="ml-auto h-3 w-3" />
                    </span>
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
