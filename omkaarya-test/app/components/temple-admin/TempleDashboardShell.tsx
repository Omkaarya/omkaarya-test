"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bell, CalendarDays, Cookie, Database, DollarSign,
  LayoutDashboard, Lock, Menu, Moon, Package,
  Settings, ShoppingCart, Sun, ChevronRight,
  MoreHorizontal, Users
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";

// ── Nav Config ─────────────────────────────────────────────────────

type NavSub = { href: string; label: string };
type L1Group = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKey?: string;
  href?: string;
  children?: NavSub[];
};

const NAV_GROUPS: L1Group[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/temple-admin",
  },
  {
    id: "finance", label: "Finance", icon: DollarSign, moduleKey: "finance",
    children: [
      { href: "/temple-admin/finance/transactions",        label: "Transactions" },
      { href: "/temple-admin/finance/donations",           label: "Donations" },
      { href: "/temple-admin/finance/reports",             label: "Reports" },
      { href: "/temple-admin/finance/assets",              label: "Assets Management" },
    ],
  },
  {
    id: "inventory", label: "Inventory", icon: Package, moduleKey: "inventory",
    children: [
      { href: "/temple-admin/inventory",                    label: "Products" },
      { href: "/temple-admin/inventory/stores",             label: "Stores" },
      { href: "/temple-admin/inventory/suppliers",          label: "Suppliers" },
    ],
  },
  {
    id: "bookings", label: "Bookings", icon: CalendarDays, moduleKey: "bookings",
    children: [
      { href: "/temple-admin/bookings",          label: "Booking Schedules" },
      { href: "/temple-admin/bookings/new",      label: "New Booking" },
    ],
  },
  {
    id: "pos", label: "POS", icon: ShoppingCart, moduleKey: "pos",
    children: [
      { href: "/temple-admin/pos",              label: "HQ Dashboard" },
      { href: "/temple-admin/pos/open-session",  label: "Open Terminal" },
      { href: "/temple-admin/pos/registers",     label: "Register Config" },
    ],
  },
  {
    id: "peoples", label: "Peoples", icon: Users, moduleKey: "peoples",
    children: [
      { href: "/temple-admin/peoples/staff",     label: "Staff Management" },
      { href: "/temple-admin/peoples/roles",     label: "Roles & Permissions" },
      { href: "/temple-admin/peoples/devotees",  label: "Devotee Management" },
    ],
  },
  {
    id: "settings", label: "Settings", icon: Settings,
    children: [
      { href: "/temple-admin/settings/general",       label: "General" },
      { href: "/temple-admin/settings/org-structure", label: "Org Structure" },
    ],
  },
];

// ── Shell Component ────────────────────────────────────────────────

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
  
  // Find the most specific matching group
  const getActiveGroup = () => {
    let bestMatch: { id: string; len: number } | null = null;
    for (const g of NAV_GROUPS) {
      if (g.href && pathname === g.href) {
        if (!bestMatch || g.href.length > bestMatch.len) {
          bestMatch = { id: g.id, len: g.href.length };
        }
      }
      if (g.children) {
        for (const c of g.children) {
          const exact = pathname === c.href;
          const prefix = pathname.startsWith(c.href + "/");
          if (exact || prefix) {
            if (!bestMatch || c.href.length > bestMatch.len) {
              bestMatch = { id: g.id, len: c.href.length };
            }
          }
        }
      }
    }
    return bestMatch?.id ?? null;
  };

  const activeGroupId = getActiveGroup();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeGroupId) {
      setOpenGroups(prev => {
        const next = new Set(prev);
        next.add(activeGroupId);
        return next;
      });
    }
  }, [activeGroupId]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const closeSidebar = () => onSidebarOpenChange(false);

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-white dark:bg-[var(--background)] font-sans text-[var(--foreground)]">
      
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col transition-transform duration-300
          bg-[var(--brand-primary)] border-r border-white/10 dark:bg-zinc-950 dark:border-zinc-800
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-20 shrink-0 items-center px-6">
          <Image src="/brand-logo/Omkaarya 9.svg" alt="Omkaarya" width={180} height={52}
            className="h-10 w-auto brightness-0 invert object-contain" />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-2 scrollbar-none pl-3">
          {NAV_GROUPS.map((group) => {
            const disabled = group.moduleKey ? disabledModules.has(group.moduleKey) : false;
            const isOpen = openGroups.has(group.id);
            const isDirectLink = group.href && !group.children?.length;
            const GroupIcon = group.icon;
            const isActiveGroup = activeGroupId === group.id;

            if (isDirectLink) {
              const active = isActiveGroup;
              return (
                <Link key={group.id} href={group.href!} onClick={closeSidebar}
                  className={`
                    relative flex items-center gap-3 px-4 py-3.5 rounded-l-full transition-all duration-200 group
                    ${active ? 'bg-white dark:bg-[var(--background)] text-[var(--brand-primary)] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'}
                    ${disabled ? 'opacity-30 pointer-events-none' : ''}
                  `}
                >
                   <div className={`absolute -top-6 right-0 w-6 h-6 bg-transparent rounded-br-full shadow-[10px_10px_0_10px_#ffffff] dark:shadow-[10px_10px_0_10px_#09090b] pointer-events-none transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />
                   <div className={`absolute -bottom-6 right-0 w-6 h-6 bg-transparent rounded-tr-full shadow-[10px_-10px_0_10px_#ffffff] dark:shadow-[10px_-10px_0_10px_#09090b] pointer-events-none transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />
                   <GroupIcon className="w-5 h-5 shrink-0" />
                   <span className="font-bold text-[15px] truncate">{group.label}</span>
                </Link>
              );
            }

            return (
              <div key={group.id} className="flex flex-col">
                <button onClick={() => toggleGroup(group.id)} disabled={disabled}
                  className={`
                    relative flex items-center gap-3 px-4 py-3.5 rounded-l-full transition-all duration-200 w-full text-left group
                    ${isActiveGroup && !isOpen ? 'bg-white dark:bg-[var(--background)] text-[var(--brand-primary)] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'}
                    ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
                  `}
                >
                  <div className={`absolute -top-6 right-0 w-6 h-6 bg-transparent rounded-br-full shadow-[10px_10px_0_10px_#ffffff] dark:shadow-[10px_10px_0_10px_#09090b] pointer-events-none transition-opacity duration-300 ${isActiveGroup && !isOpen ? 'opacity-100' : 'opacity-0'}`} />
                  <div className={`absolute -bottom-6 right-0 w-6 h-6 bg-transparent rounded-tr-full shadow-[10px_-10px_0_10px_#ffffff] dark:shadow-[10px_-10px_0_10px_#09090b] pointer-events-none transition-opacity duration-300 ${isActiveGroup && !isOpen ? 'opacity-100' : 'opacity-0'}`} />
                  <GroupIcon className={`w-5 h-5 shrink-0 ${isActiveGroup && !isOpen ? 'text-[var(--brand-primary)]' : ''}`} />
                  <span className="font-bold text-[15px] flex-1 truncate">{group.label}</span>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {isOpen && (
                  <div className="flex flex-col mt-1 space-y-1">
                    {group.children!.map(child => {
                      const isChildPath = pathname === child.href || pathname.startsWith(child.href + "/");
                      const active = isActiveGroup && isChildPath;
                      
                      return (
                        <Link key={child.href} href={child.href} onClick={closeSidebar}
                          className={`
                            relative flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-l-full transition-all duration-200 group
                            ${active ? 'bg-white dark:bg-[var(--background)] text-[var(--brand-primary)] shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'}
                          `}
                        >
                           <div className={`absolute -top-6 right-0 w-6 h-6 bg-transparent rounded-br-full shadow-[10px_10px_0_10px_#ffffff] dark:shadow-[10px_10px_0_10px_#09090b] pointer-events-none transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />
                           <div className={`absolute -bottom-6 right-0 w-6 h-6 bg-transparent rounded-tr-full shadow-[10px_-10px_0_10px_#ffffff] dark:shadow-[10px_-10px_0_10px_#09090b] pointer-events-none transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />
                           <span className="font-semibold text-sm truncate">{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/10 text-white">
            <div className="w-9 h-9 rounded-full bg-white text-[var(--brand-primary)] flex items-center justify-center shrink-0 shadow-sm font-bold text-sm">
              TA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">Temple Admin</span>
              <span className="text-[10px] text-white/70 truncate">v1.0.4 Premium</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-64">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden"
            onClick={() => onSidebarOpenChange(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <AdminBreadcrumbs pathname={pathname} />
          
          <div className="ml-auto flex items-center gap-3">
            <button type="button" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button type="button" onClick={onToggleTheme}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
