"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Building2,
  Calendar,
  CreditCard,
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
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";
import { useTheme } from "@/app/components/ThemeProvider";

const primaryNav = [
  { href: "#", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin", label: "Temples", icon: Building2 },
  { href: "#", label: "Subscriptions", icon: CreditCard },
  { href: "#", label: "Pricing Plans", icon: Tag },
  { href: "#", label: "Domains", icon: Globe },
  { href: "#", label: "Transactions", icon: Receipt },
  { href: "#", label: "Panchangam", icon: Calendar },
] as const;

const userNav = [
  { href: "#", label: "Users", icon: Users },
  { href: "#", label: "Role & Permissions", icon: Shield },
  { href: "#", label: "Delete Account Requests", icon: UserX },
] as const;

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const templesActive =
    pathname === "/super-admin" || pathname.startsWith("/super-admin/create-temple");

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)] font-sans text-[var(--text-primary)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border-default)] bg-[var(--surface-elevated)] transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center border-b border-[var(--border-default)] px-6">
          <span className="text-xl font-semibold tracking-tight" aria-label="Pepulux">
            <span className="text-[var(--text-primary)]">pep</span>
            <span className="text-[var(--brand-primary)]">ulux</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {primaryNav.map(({ href, label, icon: Icon }) => {
              const active = href === "/super-admin" && templesActive;
              return (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={() => setSidebarOpen(false)}
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
          </ul>
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            User Management
          </p>
          <ul className="space-y-0.5">
            {userNav.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
                >
                  <Icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 pr-20 lg:pr-24">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60 lg:hidden"
            onClick={() => setSidebarOpen(true)}
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
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-page)] py-2 pl-10 pr-16 text-sm text-[var(--text-primary)] outline-none ring-[var(--brand-primary)] placeholder:text-[var(--text-muted)] focus:ring-2"
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
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        <footer className="border-t border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-4 text-sm">
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
