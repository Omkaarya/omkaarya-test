"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe, Palette, LayoutDashboard, Zap, Search,
  Image, AlignLeft, Calendar, Users, Star,
  ShoppingBag, CreditCard, MapPin, MessageSquare, BarChart3
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      { label: "Site Dashboard", href: "/temple-admin/public-site", icon: Globe },
    ],
  },
  {
    title: "Appearance",
    items: [
      { label: "Branding & Theme", href: "/temple-admin/public-site/branding", icon: Palette },
      { label: "Homepage Builder", href: "/temple-admin/public-site/homepage", icon: LayoutDashboard },
      { label: "Media & Gallery", href: "/temple-admin/public-site/media", icon: Image },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Events & Poojas", href: "/temple-admin/public-site/events", icon: Calendar },
      { label: "About & History", href: "/temple-admin/public-site/about", icon: AlignLeft },
      { label: "Staff Directory", href: "/temple-admin/public-site/staff", icon: Users },
      { label: "Reviews", href: "/temple-admin/public-site/reviews", icon: Star },
    ],
  },
  {
    title: "Online Services",
    items: [
      { label: "Online Bookings", href: "/temple-admin/public-site/bookings", icon: ShoppingBag },
      { label: "Donations", href: "/temple-admin/public-site/donations", icon: CreditCard },
      { label: "Contact & Map", href: "/temple-admin/public-site/contact", icon: MapPin },
    ],
  },
  {
    title: "Technical",
    items: [
      { label: "Feature Manager", href: "/temple-admin/public-site/features", icon: Zap },
      { label: "SEO & Domain", href: "/temple-admin/public-site/seo", icon: Search },
    ],
  },
];

export default function PublicSiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Section Header */}
      <div className="flex flex-col gap-1 px-4 sm:px-0">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
          <Globe className="w-6 h-6 text-brand" />
          Public Site
        </h1>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Configure and publish your temple&#39;s public-facing microsite.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Secondary Sidebar */}
        <nav className="w-full md:w-64 shrink-0 space-y-5">
          {NAV_GROUPS.map((group, i) => (
            <div key={i} className="space-y-1">
              <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                {group.title}
              </h3>
              <div className="space-y-0.5">
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
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(255,72,0,0.5)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Main Content */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-10 min-h-[600px] animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
