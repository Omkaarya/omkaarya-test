"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  Cog,
  CreditCard,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  Mail,
  Maximize2,
  Menu,
  Receipt,
  Search,
  Settings,
  Shield,
  Sun,
  Moon,
  Tag,
  User,
  Users,
  UserX,
  Wallet,
  CheckSquare,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";

// ── Navigation Config ──────────────────────────────────────────────

const primaryNav = [
  { href: "#", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin", label: "Temples", icon: Building2 },
  { href: "/super-admin/pricing-plans", label: "Pricing Plans", icon: Tag },
  { href: "#", label: "Domains", icon: Globe },
  { href: "#", label: "Panchangam", icon: Calendar },
] as const;

const financeNav = [
  { href: "/super-admin/finance", label: "Revenue Dashboard", icon: DollarSign },
  { href: "/super-admin/finance/transactions", label: "Transactions", icon: Receipt },
  { href: "/super-admin/finance/invoices", label: "Invoices", icon: FileText },
  { href: "/super-admin/finance/receipts", label: "Receipts", icon: Wallet },
  { href: "/super-admin/finance/confirm-payments", label: "Confirm Payments", icon: CheckSquare },
] as const;

const subscriptionNav = [
  { href: "/super-admin/finance/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/super-admin/finance/upcoming-renewals", label: "Upcoming Renewals", icon: RefreshCw },
] as const;

const userNav = [
  { href: "#", label: "Users", icon: Users },
  { href: "#", label: "Role & Permissions", icon: Shield },
  { href: "#", label: "Delete Account Requests", icon: UserX },
] as const;

const systemSettingsNav = [
  { href: "/super-admin/system-settings/feature-registry", label: "Feature Registry", icon: Database },
  { href: "/super-admin/cms", label: "Website CMS", icon: Globe },
] as const;

// ── Collapsible Section ────────────────────────────────────────────

function NavSection({
  label,
  icon: SectionIcon,
  items,
  pathname,
  onLinkClick,
  defaultOpen = false,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ReadonlyArray<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  pathname: string;
  onLinkClick: () => void;
  defaultOpen?: boolean;
}) {
  const hasActiveChild = items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  const [open, setOpen] = useState(defaultOpen || hasActiveChild);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={[
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          hasActiveChild
            ? "bg-zinc-100 font-semibold text-[var(--brand-primary)] dark:bg-zinc-800/80"
            : "text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60",
        ].join(" ")}
      >
        <SectionIcon
          className={`h-5 w-5 shrink-0 ${hasActiveChild ? "opacity-100" : "opacity-80"}`}
        />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </button>

      {open && (
        <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-700">
          {items.map(({ href, label: itemLabel, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={itemLabel}>
                <Link
                  href={href}
                  onClick={onLinkClick}
                  className={[
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "font-semibold text-[var(--brand-primary)] bg-zinc-50 dark:bg-zinc-800/50"
                      : "text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60",
                  ].join(" ")}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-70"}`} />
                  {itemLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

// ── Shell Props ────────────────────────────────────────────────────

export type AdminDashboardShellProps = {
  pathname: string;
  /** Controls mobile drawer; desktop sidebar is always visible via CSS. */
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  templesActive: boolean;
  theme: string;
  onToggleTheme: () => void;
  /** Main content panel (below header, above footer). */
  children: React.ReactNode;
};

/**
 * Fixed chrome: left sidebar, top bar (search + actions), footer.
 * Does not include the scrollable page body — pass that as `children` (typically `AdminDashboardMainPanel`).
 */
export function AdminDashboardShell({
  pathname,
  sidebarOpen,
  onSidebarOpenChange,
  templesActive,
  theme,
  onToggleTheme,
  children,
}: AdminDashboardShellProps) {
  const closeSidebar = () => onSidebarOpenChange(false);

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-white font-sans text-[var(--text-primary)] dark:bg-zinc-950">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-white bg-white transition-transform dark:border-zinc-950 dark:bg-zinc-950",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center border-b border-white px-6 dark:border-zinc-950">
          <span className="text-xl font-semibold tracking-tight" aria-label="Pepulux">
            <span className="text-[var(--text-primary)]">pep</span>
            <span className="text-[var(--brand-primary)]">ulux</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Primary Nav */}
          <ul className="space-y-0.5">
            {primaryNav.map(({ href, label, icon: Icon }) => {
              const active = href === "/super-admin" && templesActive;
              return (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={closeSidebar}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-zinc-100 font-semibold text-[var(--brand-primary)] dark:bg-zinc-800/80"
                        : "text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60",
                    ].join(" ")}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${active ? "opacity-100" : "opacity-80"}`}
                      aria-hidden
                    />
                    {label}
                  </Link>
                </li>
              );
            })}

            {/* Finance & Billing — collapsible */}
            <NavSection
              label="Finance & Billing"
              icon={Wallet}
              items={financeNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
            />

            {/* Subscriptions — collapsible */}
            <NavSection
              label="Subscriptions"
              icon={CreditCard}
              items={subscriptionNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
            />
          </ul>

          {/* User Management */}
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            User Management
          </p>
          <ul className="space-y-0.5">
            {userNav.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
                >
                  <Icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* System Settings */}
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            System
          </p>
          <ul className="space-y-0.5">
            <NavSection
              label="System Settings"
              icon={Cog}
              items={systemSettingsNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
            />
          </ul>
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-64">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white bg-white px-4 pr-20 dark:border-zinc-950 dark:bg-zinc-950 lg:pr-24">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60 lg:hidden"
            onClick={() => onSidebarOpenChange(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <AdminBreadcrumbs pathname={pathname} />

          <div className="mx-auto hidden max-w-xl flex-1 px-4 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="search"
                placeholder="Search…"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-16 text-sm text-[var(--text-primary)] outline-none ring-[var(--brand-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--border-default)] bg-[var(--surface-card)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] sm:inline-block">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Language"
              className="hidden rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60 sm:block"
            >
              <span className="text-lg" title="English (US)">
                🇺🇸
              </span>
            </button>
            <button
              type="button"
              aria-label="Fullscreen"
              className="hidden rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60 md:block"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Messages"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
            >
              <Mail className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Settings"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
              onClick={onToggleTheme}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              aria-label="Account"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-[var(--text-muted)] dark:bg-zinc-700 dark:text-zinc-300"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {children}

        <footer className="shrink-0 border-t border-white bg-white px-4 py-4 text-sm dark:border-zinc-950 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <p className="text-center text-[var(--text-muted)] sm:text-left">
              2024 - 2026 ©{" "}
              <span className="font-medium text-[var(--brand-primary)]">Om Kaaryaa</span> All Right
              Reserved
            </p>
            <p className="text-center text-[var(--text-muted)]">
              Powered By{" "}
              <span className="font-medium text-[var(--brand-primary)]">Pepulux</span> All Right
              Reserved
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
              <a href="#" className="text-[var(--brand-primary)] hover:underline">
                Terms
              </a>
              <a href="#" className="text-[var(--brand-primary)] hover:underline">
                Privacy
              </a>
              <a href="#" className="text-[var(--brand-primary)] hover:underline">
                Help
              </a>
              <a href="#" className="text-[var(--brand-primary)] hover:underline">
                Status
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
