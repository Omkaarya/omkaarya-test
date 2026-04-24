"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bell, Building2, Calendar, ChevronRight, CreditCard,
  FileText, Globe, LayoutDashboard, Mail, Maximize2,
  Menu, Receipt, Search, Settings, Shield, Sun, Moon,
  Tag, User, Users, History, Languages, Home, Wallet,
  UserX, ShieldCheck, Settings2
} from "lucide-react";

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
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/super-admin" },
  { id: "temples", label: "Temples", icon: Building2, href: "/super-admin/core/temples" },
  { id: "pricing", label: "Pricing Plans", icon: Tag, href: "/super-admin/pricing-plans" },
  { id: "domains", label: "Domains", icon: Globe, href: "/super-admin/subscriptions/domains" },
  { id: "panchangam", label: "Panchangam", icon: Calendar, href: "/super-admin/cms" },
  {
    id: "finance",
    label: "Finance & Billing",
    icon: Wallet,
    children: [
      { href: "/super-admin/finance/transactions", label: "Transactions", icon: Receipt },
      { href: "/super-admin/finance/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    href: "/super-admin/subscriptions",
  },
];

const USER_MGMT_NAV = [
  { href: "/super-admin/user-management/users", label: "Users", icon: Users },
  { href: "/super-admin/user-management/roles", label: "Role & Permissions", icon: Shield },
  { href: "/super-admin/user-management/delete-requests", label: "Delete Account Requests", icon: UserX },
];

const SYSTEM_NAV = [
  { href: "/super-admin/system-settings", label: "System Settings", icon: Settings2, hasChildren: true },
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
    for (const g of NAV_GROUPS) {
      if (g.href && (pathname === g.href || pathname.startsWith(g.href + "/"))) return g.id;
      if (g.children) {
        for (const c of g.children) {
          if (pathname === c.href || pathname.startsWith(c.href + "/")) return g.id;
        }
      }
    }
    return null;
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

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* 1. SIDEBAR (Solid White Column) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col transition-transform duration-300 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-16 items-center px-8 shrink-0">
          <Link href="/super-admin" className="flex items-center gap-0.5">
             <span className="text-xl font-black tracking-tighter text-zinc-900"><span className="text-orange-500">pepu</span>lux</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto scrollbar-none px-4">
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.has(group.id);
            const isActiveGroup = activeGroupId === group.id;
            const GroupIcon = group.icon;
            const isDirect = !!group.href;

            return (
              <div key={group.id} className="flex flex-col">
                {isDirect ? (
                  <Link 
                    href={group.href!}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-bold text-[13px]
                      ${isActiveGroup ? 'bg-zinc-50 text-orange-500' : 'text-zinc-500 hover:bg-zinc-50/80 hover:text-zinc-900'}
                    `}
                  >
                    <GroupIcon className={`w-5 h-5 shrink-0 ${isActiveGroup ? 'text-orange-500' : 'text-zinc-400'}`} />
                    <span className="truncate">{group.label}</span>
                  </Link>
                ) : (
                  <>
                    <button 
                      onClick={() => toggleGroup(group.id)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left font-bold text-[13px]
                        ${isActiveGroup ? 'text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50/80 hover:text-zinc-900'}
                      `}
                    >
                      <GroupIcon className={`w-5 h-5 shrink-0 ${isActiveGroup ? 'text-orange-500' : 'text-zinc-400'}`} />
                      <span className="flex-1 truncate">{group.label}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="flex flex-col mt-0.5 space-y-0.5">
                        {group.children!.map(child => {
                          const active = pathname === child.href || pathname.startsWith(child.href + "/");
                          return (
                            <Link 
                              key={child.href} 
                              href={child.href} 
                              className={`
                                flex items-center gap-3 pl-11 pr-4 py-2 rounded-lg transition-all duration-200 font-bold text-[12px]
                                ${active ? 'text-orange-500 bg-zinc-50/50' : 'text-zinc-400 hover:text-zinc-900'}
                              `}
                            >
                               <span className="truncate">{child.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          <div className="pt-6 mt-6 border-t border-zinc-100 space-y-0.5">
             <p className="px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">User Management</p>
             {USER_MGMT_NAV.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-[13px] transition-all ${pathname.includes(item.href) ? 'bg-zinc-50 text-orange-500' : 'text-zinc-500 hover:bg-zinc-50/80'}`}>
                   <item.icon className={`w-5 h-5 ${pathname.includes(item.href) ? 'text-orange-500' : 'text-zinc-400'}`} />
                   <span className="truncate">{item.label}</span>
                </Link>
             ))}
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-100 space-y-0.5">
             <p className="px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">System</p>
             {SYSTEM_NAV.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-[13px] transition-all ${pathname.includes(item.href) ? 'bg-zinc-50 text-orange-500' : 'text-zinc-500 hover:bg-zinc-50/80'}`}>
                   <item.icon className={`w-5 h-5 ${pathname.includes(item.href) ? 'text-orange-500' : 'text-zinc-400'}`} />
                   <span className="flex-1 truncate">{item.label}</span>
                   {item.hasChildren && <ChevronRight className="w-4 h-4 text-zinc-400" />}
                </Link>
             ))}
          </div>
        </nav>
      </aside>

      {/* 2. MAIN FRAME (Differentiated Content Unit) */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-[260px] bg-white dark:bg-zinc-900">
        
        {/* The 3-Layer Container (Inset with Radius) */}
        <div className="flex-1 flex flex-col mt-2.5 ml-2.5 mb-2.5 rounded-tl-[24px] rounded-bl-[24px] overflow-hidden bg-[#F8F9FB] dark:bg-zinc-950 border-l border-t border-b border-zinc-100 dark:border-zinc-800 shadow-[-8px_0_24px_rgba(0,0,0,0.015)]">
          
          {/* Layer 1: Nav Bar (White + Rounded Top Left) */}
          <header className="flex h-16 shrink-0 items-center gap-4 bg-white px-8 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 rounded-tl-[24px]">
            <button type="button" className="lg:hidden p-2 text-zinc-500" onClick={() => onSidebarOpenChange(true)}><Menu className="h-5 w-5" /></button>
            
            <div className="flex items-center gap-3">
               <Home className="w-4 h-4 text-zinc-400" />
               <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
               <span className="text-[13px] font-bold text-orange-500">Temples</span>
            </div>

            {/* Search Bar Sync */}
            <div className="hidden md:flex flex-1 max-w-lg relative ml-8">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
               <input 
                 className="w-full h-10 pl-10 pr-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[13px] font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-200 transition-all"
                 placeholder="Search.."
               />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-400 tracking-tighter">⌘K</div>
            </div>
            
            <div className="ml-auto flex items-center gap-1">
               <button className="p-2 text-zinc-400 hover:text-zinc-900"><Languages className="w-5 h-5" /></button>
               <button className="p-2 text-zinc-400 hover:text-zinc-900"><Maximize2 className="w-5 h-5" /></button>
               <button className="p-2 text-zinc-400 hover:text-zinc-900"><Mail className="w-5 h-5" /></button>
               <button className="p-2 text-zinc-400 hover:text-zinc-900 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
               </button>
               <button className="p-2 text-zinc-400 hover:text-zinc-900"><Settings className="w-5 h-5" /></button>
               <button onClick={onToggleTheme} className="p-2 text-zinc-400 hover:text-zinc-900">
                 {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 ml-2 cursor-pointer hover:border-orange-200 transition-all overflow-hidden">
                  <User className="w-5 h-5 text-zinc-400" />
               </div>
            </div>
          </header>

          {/* Layer 2: Main Content Area (Tertiary Gray) */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-none">
             <div className="max-w-[1600px] mx-auto">
               {children}
             </div>
          </main>

          {/* Layer 3: Footer (Branding Integration) */}
          <footer className="px-10 py-5 bg-transparent flex items-center justify-between text-[11px] font-bold text-zinc-400 tracking-tight shrink-0 border-t border-zinc-50 dark:border-zinc-800/50">
             <p>2024 - 2026 © <span className="text-orange-500 font-black tracking-tighter">Om Kaaryaa</span> All Right Reserved</p>
             <div className="flex items-center gap-8 uppercase tracking-widest text-[10px]">
                <div className="flex items-center gap-1.5 font-bold">Powered By <span className="text-orange-500 font-black">Pepulux</span> All Right Reserved</div>
                <div className="flex gap-4 font-bold">
                   <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
                   <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
                   <a href="#" className="hover:text-zinc-900 transition-colors">Help</a>
                   <a href="#" className="hover:text-zinc-900 transition-colors">Status</a>
                </div>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
