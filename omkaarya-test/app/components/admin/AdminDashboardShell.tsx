"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  Cog,
  CreditCard,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  Maximize2,
  Minimize2,
  Menu,
  Receipt,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Tag,
  Users,
  UserX,
  Wallet,
  CheckSquare,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";
import { AdminAccountPopover } from "@/app/components/admin/AdminAccountPopover";
import { PENDING_PAYMENT_SUBMISSIONS_CHANGED_EVENT } from "@/lib/pending-payment-submissions-events";

// ── Navigation Config ──────────────────────────────────────────────

const primaryNav = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/core/temples", label: "Temples", icon: Building2 },
  { href: "/super-admin/core/deities", label: "Deities", icon: Sparkles },
  { href: "/super-admin/pricing-plans", label: "Pricing Plans", icon: Tag },
  { href: "/super-admin/subdomains", label: "Subdomains", icon: Globe },
] as const;

const financeNav = [
  {
    href: "/super-admin/finance",
    label: "Revenue Dashboard",
    icon: DollarSign,
  },
  {
    href: "/super-admin/finance/transactions",
    label: "Transactions",
    icon: Receipt,
  },
  { href: "/super-admin/finance/invoices", label: "Invoices", icon: FileText },
  { href: "/super-admin/finance/receipts", label: "Receipts", icon: Wallet },
  {
    href: "/super-admin/finance/confirm-payments",
    label: "Confirm Payments",
    icon: CheckSquare,
  },
] as const;

const subscriptionNav = [
  {
    href: "/super-admin/finance/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
  },
  {
    href: "/super-admin/finance/upcoming-renewals",
    label: "Upcoming Renewals",
    icon: RefreshCw,
  },
] as const;

const userNav = [
  { href: "/super-admin/user-management/users", label: "Users", icon: Users },
  {
    href: "/super-admin/user-management/roles",
    label: "Roles & Permissions",
    icon: Shield,
  },
  {
    href: "/super-admin/delete-account-requests",
    label: "Delete Account Requests",
    icon: UserX,
  },
] as const;

const systemSettingsNav = [
  {
    href: "/super-admin/system-settings/feature-registry",
    label: "Feature Registry",
    icon: Database,
  },
  { href: "/super-admin/cms", label: "Website CMS", icon: LayoutTemplate },
] as const;

/**
 * A nav href that is a prefix of sibling routes (e.g. /super-admin/finance vs …/transactions)
 * must be active on exact path only; otherwise "Revenue Dashboard" stays highlighted for all finance pages.
 */
function isChildNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/super-admin/finance") return false;
  return pathname.startsWith(`${href}/`);
}

type SidebarAccordionId = "finance" | "subscriptions" | "system";

/**
 * Subscriptions are checked first so /super-admin/finance/subscriptions
 * does not get attributed to a broader /super-admin/finance/… child match in finance.
 */
function sectionForPathname(pathname: string): SidebarAccordionId | null {
  if (subscriptionNav.some((item) => isChildNavActive(pathname, item.href))) {
    return "subscriptions";
  }
  if (financeNav.some((item) => isChildNavActive(pathname, item.href))) {
    return "finance";
  }
  if (systemSettingsNav.some((item) => isChildNavActive(pathname, item.href))) {
    return "system";
  }
  return null;
}

// ── Collapsible Section ────────────────────────────────────────────

function NavSection({
  label,
  icon: SectionIcon,
  items,
  pathname,
  onLinkClick,
  isOpen,
  onHeaderClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ReadonlyArray<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  pathname: string;
  onLinkClick: () => void;
  isOpen: boolean;
  onHeaderClick: () => void;
}) {
  const hasActiveChild = items.some((item) =>
    isChildNavActive(pathname, item.href),
  );

  return (
    <li>
      <button
        type="button"
        onClick={onHeaderClick}
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
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
        />
      </button>

      {isOpen && (
        <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-700">
          {items.map(({ href, label: itemLabel, icon: Icon }) => {
            const active = isChildNavActive(pathname, href);
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
                  <Icon
                    className={`h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-70"}`}
                  />
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

type DocumentWithWebkitFs = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type ElementWithWebkitFs = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function getFullscreenElement(): Element | null {
  const d = document as DocumentWithWebkitFs;
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

function isShellFullscreen(shell: HTMLDivElement | null): boolean {
  if (!shell) return false;
  return getFullscreenElement() === shell;
}

async function requestElFullscreen(el: HTMLElement): Promise<void> {
  const anyEl = el as ElementWithWebkitFs;
  if (typeof el.requestFullscreen === "function") {
    await el.requestFullscreen();
    return;
  }
  if (typeof anyEl.webkitRequestFullscreen === "function") {
    await Promise.resolve(anyEl.webkitRequestFullscreen());
    return;
  }
  throw new Error("Fullscreen API is not supported.");
}

async function exitDocFullscreen(): Promise<void> {
  const d = document as DocumentWithWebkitFs;
  if (typeof document.exitFullscreen === "function") {
    await document.exitFullscreen();
    return;
  }
  if (typeof d.webkitExitFullscreen === "function") {
    await Promise.resolve(d.webkitExitFullscreen());
    return;
  }
  throw new Error("Fullscreen API is not supported.");
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
  const shellRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const syncFullscreen = useCallback(() => {
    setFullscreen(isShellFullscreen(shellRef.current));
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, [syncFullscreen]);

  useEffect(() => {
    return () => {
      if (isShellFullscreen(shellRef.current)) {
        void exitDocFullscreen().catch(() => {});
      }
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current;
    if (isShellFullscreen(shell)) {
      await exitDocFullscreen().catch(() => {});
    } else if (shell) {
      await requestElFullscreen(shell).catch(() => {});
    }
    syncFullscreen();
  }, [syncFullscreen]);

  const closeSidebar = () => onSidebarOpenChange(false);

  const [openAccordion, setOpenAccordion] = useState<SidebarAccordionId | null>(
    () => sectionForPathname(pathname),
  );

  useEffect(() => {
    setOpenAccordion(sectionForPathname(pathname));
  }, [pathname]);

  const [pendingCount, setPendingCount] = useState(0);

  const loadPendingCount = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/payment-submissions/pending", {
        cache: "no-store",
      });
      const d = (await res.json().catch(() => null)) as {
        success?: boolean;
        data?: { data: unknown[] };
      } | null;
      if (!d || d.success !== true || !d.data) {
        setPendingCount(0);
        return;
      }
      setPendingCount((d.data.data ?? []).length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    void loadPendingCount();
  }, [pathname, loadPendingCount]);

  useEffect(() => {
    const id = window.setInterval(() => void loadPendingCount(), 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") void loadPendingCount();
    };
    const onListChanged = () => void loadPendingCount();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener(
      PENDING_PAYMENT_SUBMISSIONS_CHANGED_EVENT,
      onListChanged,
    );
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener(
        PENDING_PAYMENT_SUBMISSIONS_CHANGED_EVENT,
        onListChanged,
      );
    };
  }, [loadPendingCount]);

  return (
    <div
      ref={shellRef}
      className="flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-white font-sans text-[var(--text-primary)] dark:bg-zinc-950"
    >
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
        <div className="flex h-[4.5rem] items-center border-b border-white px-2 dark:border-zinc-950">
          <Image
            src="/brand-logo/Omkaarya 9.svg"
            alt="Omkaarya"
            width={180}
            height={48}
            className="h-48 w-auto"
            priority
          />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Primary Nav */}
          <ul className="space-y-0.5">
            {primaryNav.map(({ href, label, icon: Icon }) => {
              const active =
                (href === "/super-admin/core/temples" && templesActive) ||
                pathname === href;
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

            {/* Finance & Billing — collapsible (accordion with Subscriptions + System) */}
            <NavSection
              label="Finance & Billing"
              icon={Wallet}
              items={financeNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
              isOpen={openAccordion === "finance"}
              onHeaderClick={() =>
                setOpenAccordion((o) => (o === "finance" ? null : "finance"))
              }
            />

            {/* Subscriptions — collapsible */}
            <NavSection
              label="Subscriptions"
              icon={CreditCard}
              items={subscriptionNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
              isOpen={openAccordion === "subscriptions"}
              onHeaderClick={() =>
                setOpenAccordion((o) =>
                  o === "subscriptions" ? null : "subscriptions",
                )
              }
            />
          </ul>

          {/* User Management */}
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            User Management
          </p>
          <ul className="space-y-0.5">
            {userNav.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href === "/super-admin/user-management/roles" &&
                  pathname.startsWith("/super-admin/user-management/roles"));
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
              isOpen={openAccordion === "system"}
              onHeaderClick={() =>
                setOpenAccordion((o) => (o === "system" ? null : "system"))
              }
            />
          </ul>
        </nav>
      </aside>

      <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_1fr_auto] overflow-hidden lg:pl-64">
        <header className="z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white bg-white px-4 dark:border-zinc-950 dark:bg-zinc-950">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60 lg:hidden"
            onClick={() => onSidebarOpenChange(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <AdminBreadcrumbs pathname={pathname} />

          {/* <div className="mx-auto hidden max-w-xl flex-1 px-4 md:block">
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
          </div> */}

          <div className="ml-auto flex items-center gap-1">
            {/* <button
              type="button"
              aria-label="Language"
              className="hidden rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60 sm:block"
            >
              <span className="text-lg" title="English (US)">
                🇺🇸
              </span>
            </button> */}

            <button
              type="button"
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="hidden rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60 md:block"
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen ? (
                <Minimize2 className="h-5 w-5" aria-hidden />
              ) : (
                <Maximize2 className="h-5 w-5" aria-hidden />
              )}
            </button>
            {/* <button
              type="button"
              aria-label="Messages"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
            >
              <Mail className="h-5 w-5" />
            </button> */}
            <Link
              href="/super-admin/finance/confirm-payments"
              className="relative inline-flex rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
              aria-label={
                pendingCount > 0
                  ? `Unconfirmed bank payment submissions, ${pendingCount} to review. Open confirm payments.`
                  : "Unconfirmed bank payment submissions. Open confirm payments."
              }
            >
              <Bell className="h-5 w-5" aria-hidden />
              {pendingCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold leading-none text-white"
                  aria-hidden
                >
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
            {/* <button
              type="button"
              aria-label="Settings"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
            >
              <Settings className="h-5 w-5" />
            </button> */}
            <button
              type="button"
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
              onClick={onToggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <AdminAccountPopover />
          </div>
        </header>

        {children}

        <footer className="z-10 shrink-0 border-t border-white bg-white px-4 py-4 text-sm dark:border-zinc-950 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <p className="text-center text-[var(--text-muted)] sm:text-left">
              2024 - 2026 ©{" "}
              <span className="font-medium text-[var(--brand-primary)]">
                Omkaarya
              </span>{" "}
              All Rights Reserved
            </p>
            <p className="text-center text-[var(--text-muted)]">
              Powered By{" "}
              <span className="font-medium text-[var(--brand-primary)]">
                Pepulux
              </span>{" "}
              All Rights Reserved
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
              <a
                href="mailto:support@pepulux.com"
                className="text-[var(--brand-primary)] hover:underline"
              >
                Help
              </a>
              <Link
                href="/super-admin/cms"
                className="text-[var(--brand-primary)] hover:underline"
              >
                Website CMS
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
