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
  Tag,
  User,
  Users,
  UserX,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const templesActive =
    pathname === "/super-admin" || pathname.startsWith("/super-admin/create-temple");

  return (
    <div className="flex min-h-screen bg-zinc-100 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center border-b border-zinc-100 px-6 dark:border-zinc-800">
          <span className="text-xl font-semibold tracking-tight text-[var(--brand-primary)]">
            Omkaarya
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
                        ? "bg-red-50 text-[var(--brand-primary)] dark:bg-red-950/40 dark:text-orange-400"
                        : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/80",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            User Management
          </p>
          <ul className="space-y-0.5">
            {userNav.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
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
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white px-4 pr-20 dark:border-zinc-800 dark:bg-zinc-900 lg:pr-24">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <AdminBreadcrumbs pathname={pathname} />

          <div className="mx-auto hidden max-w-xl flex-1 px-4 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                placeholder="Search…"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-16 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800/80"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline-block dark:border-zinc-600 dark:bg-zinc-900">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Language"
              className="hidden rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 sm:block dark:hover:bg-zinc-800"
            >
              <span className="text-lg" title="English (US)">
                🇺🇸
              </span>
            </button>
            <button
              type="button"
              aria-label="Fullscreen"
              className="hidden rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:block dark:hover:bg-zinc-800"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Messages"
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Mail className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Settings"
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Account"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        <footer className="border-t border-zinc-200 bg-white px-4 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <p className="text-center text-zinc-500 sm:text-left">
              2024 - 2026 ©{" "}
              <span className="font-medium text-[var(--brand-primary)]">Om Kaaryaa</span> All Right
              Reserved
            </p>
            <p className="text-center text-zinc-500">
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
