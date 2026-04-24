"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  Calendar,
  ChevronRight,
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
  HeartHandshake,
  BarChart3,
  TrendingUp,
  LineChart,
  Flower2
} from "lucide-react";
import { AdminBreadcrumbs } from "@/app/components/admin/adminBreadcrumbs";

// ── Navigation Config ──────────────────────────────────────────────

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

type L1Group = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavItem[];
};

const NAV_GROUPS: L1Group[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { href: "/super-admin", label: "Overview", icon: LayoutDashboard },
      { href: "/super-admin/finance", label: "Finance Analytics", icon: LineChart },
    ],
  },
  {
    id: "subscriptions_group",
    label: "Subscriptions",
    icon: CreditCard,
    children: [
      { href: "/super-admin/subscriptions", label: "Overview", icon: BarChart3 },
      { href: "/super-admin/subscriptions/domains", label: "Domains", icon: Globe },
      { href: "/super-admin/finance/upcoming-renewals", label: "Upcoming Renewals", icon: RefreshCw },
    ],
  },
  {
    id: "core",
    label: "Core",
    icon: Building2,
    children: [
      { href: "/super-admin/core/temples", label: "Temples", icon: Building2 },
      { href: "/super-admin/core/deities", label: "Deities", icon: Flower2 },
      { href: "/super-admin/pricing-plans", label: "Pricing Plans", icon: Tag },
      { href: "/super-admin/cms", label: "Website CMS", icon: Globe },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    children: [
      { href: "/super-admin/finance/transactions", label: "Transactions", icon: Receipt },
      { href: "/super-admin/finance/invoices", label: "Invoices", icon: FileText },
      { href: "/super-admin/finance/receipts", label: "Receipts", icon: Wallet },
      { href: "/super-admin/finance/confirm-payments", label: "Confirm Payments", icon: CheckSquare },
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    children: [
      { href: "/super-admin/user-management/users", label: "Users List", icon: Users },
      { href: "/super-admin/user-management/roles", label: "Roles & Permissions", icon: Shield },
      { href: "/super-admin/delete-account-requests", label: "Delete Requests", icon: UserX },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Cog,
    children: [
      { href: "/super-admin/system-settings/feature-registry", label: "Feature Registry", icon: Database },
    ],
  },
];

export function AdminDashboardShell({
  pathname,
  sidebarOpen,
  onSidebarOpenChange,
  theme,
  onToggleTheme,
  children,
}: any) {
  
  const getActiveGroup = () => {
    let bestMatch: { id: string; len: number } | null = null;
    for (const g of NAV_GROUPS) {
      if (g.children) {
        for (const c of g.children) {
          const exact = pathname === c.href;
          const prefix = c.href !== "/super-admin" && pathname.startsWith(c.href + "/");
          if (exact || prefix) {
            const len = c.href.length;
            if (!bestMatch || len > bestMatch.len) bestMatch = { id: g.id, len };
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

  // Notch component with corrected Z-Index and color blending
  const Notch = ({ active }: { active: boolean }) => (
    <div className={`absolute inset-y-0 right-0 w-6 pointer-events-none transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute -top-[24px] right-0 w-6 h-6 bg-transparent rounded-br-[24px] shadow-[10px_10px_0_10px_white] dark:shadow-[10px_10px_0_10px_#09090b]" />
       <div className="absolute -bottom-[24px] right-0 w-6 h-6 bg-transparent rounded-tr-[24px] shadow-[10px_-10px_0_10px_white] dark:shadow-[10px_-10px_0_10px_#09090b]" />
    </div>
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-white dark:bg-[var(--background)] font-sans text-[var(--foreground)]">
      {sidebarOpen && (
        <button className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm" onClick={() => onSidebarOpenChange(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col transition-transform duration-300 bg-[var(--brand-primary)] dark:bg-zinc-950 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-16 items-center border-b border-white/10 px-6 shrink-0">
          <Image src="/brand-logo/Omkaarya 9.svg" alt="Omkaarya" width={120} height={32} className="h-8 w-auto brightness-0 invert" />
        </div>

        {/* Removed scrollbar-none to prevent notch clipping on hover */}
        <nav className="flex-1 py-8 space-y-3 pl-3 overflow-y-visible">
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.has(group.id);
            const isActiveGroup = activeGroupId === group.id;
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="flex flex-col">
                <button 
                  onClick={() => toggleGroup(group.id)}
                  className={`
                    relative flex items-center gap-3 px-4 py-3.5 rounded-l-full transition-all duration-200 w-full text-left group
                    ${isActiveGroup && !isOpen ? 'bg-white dark:bg-[var(--background)] text-[var(--brand-primary)] shadow-sm' : 'text-white hover:bg-white dark:hover:bg-[var(--background)] hover:text-[var(--brand-primary)]'}
                  `}
                >
                  <Notch active={(isActiveGroup && !isOpen)} />
                  {/* Separate hover notch to avoid logic flicker */}
                  <div className="absolute inset-y-0 right-0 w-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute -top-[24px] right-0 w-6 h-6 bg-transparent rounded-br-[24px] shadow-[10px_10px_0_10px_white] dark:shadow-[10px_10px_0_10px_#09090b]" />
                    <div className="absolute -bottom-[24px] right-0 w-6 h-6 bg-transparent rounded-tr-[24px] shadow-[10px_-10px_0_10px_white] dark:shadow-[10px_-10px_0_10px_#09090b]" />
                  </div>

                  <GroupIcon className={`w-5 h-5 shrink-0 ${isActiveGroup && !isOpen ? 'text-[var(--brand-primary)]' : 'group-hover:scale-110'}`} />
                  <span className="font-bold text-[14px] flex-1 truncate">{group.label}</span>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {isOpen && (
                  <div className="flex flex-col mt-1 space-y-1">
                    {group.children!.map(child => {
                      const active = isActiveGroup && (pathname === child.href || (child.href !== "/super-admin" && pathname.startsWith(child.href + "/")));
                      const ChildIcon = child.icon || GroupIcon;
                      
                      return (
                        <Link 
                          key={child.href} 
                          href={child.href} 
                          className={`
                            relative flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-l-full transition-all duration-200 group
                            ${active ? 'bg-white dark:bg-[var(--background)] text-[var(--brand-primary)] shadow-sm' : 'text-white/80 hover:bg-white dark:hover:bg-[var(--background)] hover:text-[var(--brand-primary)]'}
                          `}
                        >
                           <Notch active={active} />
                           <div className="absolute inset-y-0 right-0 w-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             <div className="absolute -top-[24px] right-0 w-6 h-6 bg-transparent rounded-br-[24px] shadow-[10px_10px_0_10px_white] dark:shadow-[10px_10px_0_10px_#09090b]" />
                             <div className="absolute -bottom-[24px] right-0 w-6 h-6 bg-transparent rounded-tr-[24px] shadow-[10px_-10px_0_10px_white] dark:shadow-[10px_-10px_0_10px_#09090b]" />
                           </div>
                           <ChildIcon className={`w-4 h-4 ${active ? 'text-[var(--brand-primary)]' : 'text-white/50 group-hover:text-[var(--brand-primary)]'}`} />
                           <span className="font-bold text-[13px] truncate">{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
           <div className="flex items-center gap-3 px-2 py-1 text-white/60">
             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">SA</div>
             <div className="flex flex-col"><span className="text-[11px] font-bold text-white">Super Admin</span><span className="text-[10px]">Portal v1.0.6</span></div>
           </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-64">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
          <button type="button" className="lg:hidden p-2 text-zinc-500" onClick={() => onSidebarOpenChange(true)}><Menu className="h-5 w-5" /></button>
          <AdminBreadcrumbs pathname={pathname} />
          <div className="ml-auto flex items-center gap-3">
             <button onClick={onToggleTheme} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><User className="w-4 h-4 text-zinc-500" /></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-8">{children}</main>
        <footer className="shrink-0 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950 text-xs text-zinc-500 font-medium flex justify-between items-center">
           <p>© 2024 - 2026 Om Kaaryaa. All Rights Reserved.</p>
           <div className="flex gap-4"><a href="#" className="hover:text-[var(--brand-primary)]">Terms</a><a href="#" className="hover:text-[var(--brand-primary)]">Privacy</a></div>
        </footer>
      </div>
    </div>
  );
}
