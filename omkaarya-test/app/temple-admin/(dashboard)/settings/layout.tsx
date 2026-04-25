"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Globe, 
  Receipt, 
  ShoppingCart, 
  Printer, 
  Mail, 
  PieChart, 
  Package,
  Settings2
} from "lucide-react";

const SETTINGS_GROUPS = [
  {
    title: "Organization",
    items: [
      { label: "General Settings", href: "/temple-admin/settings/general", icon: Building2 },
      { label: "Org Structure", href: "/temple-admin/settings/org-structure", icon: Building2 },
      { label: "Web Settings", href: "/temple-admin/settings/web", icon: Globe },
    ]
  },
  {
    title: "App Settings",
    items: [
      { label: "Invoice & Receipts", href: "/temple-admin/settings/app/invoice", icon: Receipt },
      { label: "POS & Registers", href: "/temple-admin/settings/app/pos", icon: ShoppingCart },
      { label: "Printers", href: "/temple-admin/settings/app/printers", icon: Printer },
    ]
  },
  {
    title: "System Options",
    items: [
      { label: "Email Gateway", href: "/temple-admin/settings/system/email", icon: Mail },
      { label: "Finance & Taxes", href: "/temple-admin/settings/system/finance", icon: PieChart },
      { label: "Inventory Alerts", href: "/temple-admin/settings/system/inventory", icon: Package },
    ]
  }
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Settings Header */}
      <div className="flex flex-col gap-1 px-4 sm:px-0">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
          <Settings2 className="w-6 h-6 text-brand" />
          Settings
        </h1>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Manage your temple's global configuration, hardware, and compliance settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Secondary Sidebar */}
        <nav className="w-full md:w-64 shrink-0 space-y-6">
          {SETTINGS_GROUPS.map((group, i) => (
            <div key={i} className="space-y-1.5">
              <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, j) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={j} 
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all
                        ${isActive 
                          ? "bg-brand-50 text-brand dark:bg-brand-950/20 shadow-sm" 
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"}
                      `}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? "text-brand" : "text-zinc-400"}`} />
                      {item.label}
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(255,72,0,0.5)]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Form Content Area */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-10 min-h-[600px] animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
