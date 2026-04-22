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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-zinc-400" />
          System Settings
        </h1>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1.5">
          Manage your temple's global configuration, hardware, and compliance settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Secondary Sidebar */}
        <nav className="w-full md:w-64 shrink-0 space-y-6">
          {SETTINGS_GROUPS.map((group, i) => (
            <div key={i}>
              <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, j) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={j} 
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isActive 
                          ? "bg-[var(--brand-primary)] text-white shadow-md shadow-orange-500/20" 
                          : "text-[var(--text-secondary)] hover:bg-zinc-100 hover:text-[var(--text-primary)] dark:hover:bg-zinc-900"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-70"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Form Content Area */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-8 min-h-[500px]">
          {children}
        </div>
      </div>
    </div>
  );
}
