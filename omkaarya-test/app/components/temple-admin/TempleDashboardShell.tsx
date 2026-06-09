"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Cookie,
  Database,
  DollarSign,
  LayoutDashboard,
  Lock,
  Maximize2,
  Menu,
  Minimize2,
  Monitor,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  Users,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";
import { TempleAccountPopover } from "@/app/components/temple-admin/TempleAccountPopover";

// ── Navigation Config ──────────────────────────────────────────────

const primaryNav = [
  { href: "/temple-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/temple-admin/pos", label: "POS", icon: ShoppingCart, moduleKey: "pos" },
  { href: "/temple-admin/kiosk", label: "Kiosk Center", icon: Monitor, moduleKey: "kiosk" },
  { href: "/temple-admin/settings/general", label: "Settings", icon: Settings },
] as const;

const financeNav = [
  { href: "/temple-admin/finance", label: "Dashboard", icon: LayoutDashboard },
  { href: "/temple-admin/finance/transactions", label: "Transactions", icon: DollarSign },
  { href: "/temple-admin/finance/transactions/add", label: "Add Transaction", icon: DollarSign },
  { href: "/temple-admin/finance/donations", label: "Donations", icon: DollarSign },
  { href: "/temple-admin/finance/receipts/generate", label: "Generate Receipt", icon: DollarSign },
  { href: "/temple-admin/finance/reports", label: "Reports", icon: DollarSign },
  { href: "/temple-admin/finance/purchase-orders", label: "Purchase Orders", icon: DollarSign },
  { href: "/temple-admin/finance/assets", label: "Assets Management", icon: DollarSign },
] as const;

const inventoryNav = [
  { href: "/temple-admin/inventory", label: "Products", icon: Package },
  { href: "/temple-admin/inventory/create", label: "Add Product", icon: Package },
  { href: "/temple-admin/inventory/categories", label: "Categories", icon: Package },
  { href: "/temple-admin/inventory/stores", label: "Stores", icon: Package },
  { href: "/temple-admin/inventory/suppliers", label: "Suppliers", icon: Package },
  { href: "/temple-admin/inventory/low-stock", label: "Stock Alerts", icon: Package },
  { href: "/temple-admin/inventory/adjustments", label: "Stock Adjustments", icon: Package },
  { href: "/temple-admin/inventory/pooja-bom", label: "Pooja BOM", icon: Package },
  { href: "/temple-admin/inventory/print-labels", label: "Print Labels", icon: Package },
  { href: "/temple-admin/inventory/print-qr", label: "Print QR", icon: Package },
] as const;

const bookingsNav = [
  { href: "/temple-admin/bookings", label: "Booking Schedules", icon: CalendarDays },
  { href: "/temple-admin/bookings/calendar", label: "Booking Calendar", icon: CalendarDays },
  { href: "/temple-admin/bookings/new", label: "New Booking", icon: CalendarDays },
] as const;

const prasadNav = [
  { href: "/temple-admin/prasad", label: "Prashadham Items", icon: Cookie },
  { href: "/temple-admin/prasad/categories", label: "Categories", icon: Cookie },
] as const;

const masterNav = [
  { href: "/temple-admin/master", label: "All Master Data", icon: Database },
] as const;

const peoplesNav = [
  { href: "/temple-admin/peoples/staff", label: "Staff Management", icon: Users },
  { href: "/temple-admin/peoples/roles", label: "Role & Permissions", icon: Users },
  { href: "/temple-admin/peoples/devotees", label: "Devotee Management", icon: Users },
] as const;

type SidebarAccordionId = "finance" | "inventory" | "bookings" | "prasad" | "master" | "peoples";

function isChildNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/temple-admin/finance") return pathname === href;
  if (href === "/temple-admin") return pathname === href;
  return pathname.startsWith(`${href}/`);
}

function sectionForPathname(pathname: string): SidebarAccordionId | null {
  if (financeNav.some((item) => isChildNavActive(pathname, item.href))) return "finance";
  if (inventoryNav.some((item) => isChildNavActive(pathname, item.href))) return "inventory";
  if (bookingsNav.some((item) => isChildNavActive(pathname, item.href))) return "bookings";
  if (prasadNav.some((item) => isChildNavActive(pathname, item.href))) return "prasad";
  if (masterNav.some((item) => isChildNavActive(pathname, item.href))) return "master";
  if (peoplesNav.some((item) => isChildNavActive(pathname, item.href))) return "peoples";
  return null;
}

function NavSection({
  label,
  icon: SectionIcon,
  items,
  pathname,
  onLinkClick,
  isOpen,
  onHeaderClick,
  disabled,
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
  disabled?: boolean;
}) {
  const hasActiveChild = items.some((item) => isChildNavActive(pathname, item.href));

  if (disabled) {
    return (
      <li className="opacity-40">
        <span className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)]">
          <SectionIcon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
          <span className="flex-1 text-left">{label}</span>
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </span>
      </li>
    );
  }

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
                      ? "bg-zinc-50 font-semibold text-[var(--brand-primary)] dark:bg-zinc-800/50"
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

export type TempleDashboardShellProps = {
  pathname: string;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  theme: string;
  onToggleTheme: () => void;
  children: React.ReactNode;
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
  const shellRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const isModuleDisabled = (moduleKey?: string): boolean => {
    if (!moduleKey) return false;
    return disabledModules.has(moduleKey);
  };

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
          <ul className="space-y-0.5">
            {primaryNav.map(({ href, label, icon: Icon, ...rest }) => {
              const moduleKey = "moduleKey" in rest ? rest.moduleKey : undefined;
              const disabled = isModuleDisabled(moduleKey);
              const active =
                href === "/temple-admin"
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);

              if (disabled) {
                return (
                  <li key={label} className="opacity-40">
                    <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)]">
                      <Icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                      {label}
                      <Lock className="ml-auto h-3.5 w-3.5" aria-hidden />
                    </span>
                  </li>
                );
              }

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

            <NavSection
              label="Finance"
              icon={DollarSign}
              items={financeNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
              isOpen={openAccordion === "finance"}
              onHeaderClick={() =>
                setOpenAccordion((o) => (o === "finance" ? null : "finance"))
              }
              disabled={isModuleDisabled("finance")}
            />

            <NavSection
              label="Inventory"
              icon={Package}
              items={inventoryNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
              isOpen={openAccordion === "inventory"}
              onHeaderClick={() =>
                setOpenAccordion((o) => (o === "inventory" ? null : "inventory"))
              }
              disabled={isModuleDisabled("inventory")}
            />

            <NavSection
              label="Seva Bookings"
              icon={CalendarDays}
              items={bookingsNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
              isOpen={openAccordion === "bookings"}
              onHeaderClick={() =>
                setOpenAccordion((o) => (o === "bookings" ? null : "bookings"))
              }
              disabled={isModuleDisabled("bookings")}
            />

            <NavSection
              label="Prashadham"
              icon={Cookie}
              items={prasadNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
              isOpen={openAccordion === "prasad"}
              onHeaderClick={() => setOpenAccordion((o) => (o === "prasad" ? null : "prasad"))}
              disabled={isModuleDisabled("prasad")}
            />

            <NavSection
              label="Master Data"
              icon={Database}
              items={masterNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
              isOpen={openAccordion === "master"}
              onHeaderClick={() => setOpenAccordion((o) => (o === "master" ? null : "master"))}
              disabled={isModuleDisabled("master")}
            />

            <NavSection
              label="Peoples"
              icon={Users}
              items={peoplesNav}
              pathname={pathname}
              onLinkClick={closeSidebar}
              isOpen={openAccordion === "peoples"}
              onHeaderClick={() => setOpenAccordion((o) => (o === "peoples" ? null : "peoples"))}
              disabled={isModuleDisabled("peoples")}
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

          <div className="ml-auto flex items-center gap-1">
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
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100/90 dark:hover:bg-zinc-800/60"
            >
              <Bell className="h-5 w-5" aria-hidden />
            </button>
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
            <TempleAccountPopover />
          </div>
        </header>

        {children}

        <footer className="z-10 shrink-0 border-t border-white bg-white px-4 py-4 text-sm dark:border-zinc-950 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <p className="text-center text-[var(--text-muted)] sm:text-left">
              2024 - 2026 ©{" "}
              <span className="font-medium text-[var(--brand-primary)]">Omkaarya</span> All Rights
              Reserved
            </p>
            <p className="text-center text-[var(--text-muted)]">
              Powered By{" "}
              <span className="font-medium text-[var(--brand-primary)]">Pepulux</span> All Rights
              Reserved
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
              <a
                href="mailto:support@pepulux.com"
                className="text-[var(--brand-primary)] hover:underline"
              >
                Help
              </a>
              <Link
                href="/temple-admin/settings/general"
                className="text-[var(--brand-primary)] hover:underline"
              >
                Settings
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
