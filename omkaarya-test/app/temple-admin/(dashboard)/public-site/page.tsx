"use client";

import { useState } from "react";
import {
  Globe, Layers, Palette, Search, Settings2, Eye, ExternalLink,
  Sparkles, Lock, ChevronRight, Monitor, Smartphone, Tablet,
  LayoutDashboard, Image, AlignLeft, Star, Calendar, ShoppingBag,
  CreditCard, Phone, Users, MapPin, Zap
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Button } from "@/app/components/ds/atoms/Button";

const PUBLIC_SITE_MODULES = [
  {
    group: "Appearance",
    items: [
      {
        label: "Branding & Theme",
        description: "Logo, colors, fonts and overall visual identity",
        href: "/temple-admin/public-site/branding",
        icon: Palette,
        status: "active",
        plan: null,
      },
      {
        label: "Homepage Builder",
        description: "Hero, sections, and page layout configuration",
        href: "/temple-admin/public-site/homepage",
        icon: LayoutDashboard,
        status: "active",
        plan: null,
      },
      {
        label: "Media & Gallery",
        description: "Upload photos, videos and manage media library",
        href: "/temple-admin/public-site/media",
        icon: Image,
        status: "active",
        plan: null,
      },
    ],
  },
  {
    group: "Content Modules",
    items: [
      {
        label: "Events & Poojas",
        description: "Display upcoming rituals, events and pooja schedules",
        href: "/temple-admin/public-site/events",
        icon: Calendar,
        status: "active",
        plan: null,
      },
      {
        label: "About & History",
        description: "Temple story, history and about the deity",
        href: "/temple-admin/public-site/about",
        icon: AlignLeft,
        status: "active",
        plan: null,
      },
      {
        label: "Priests & Staff",
        description: "Public directory of priests and key personnel",
        href: "/temple-admin/public-site/staff",
        icon: Users,
        status: "active",
        plan: "sankalpa",
      },
      {
        label: "Reviews & Ratings",
        description: "Allow devotees to leave public testimonials",
        href: "/temple-admin/public-site/reviews",
        icon: Star,
        status: "locked",
        plan: "aaradhana",
      },
    ],
  },
  {
    group: "Online Services",
    items: [
      {
        label: "Online Bookings",
        description: "Accept pooja and event bookings via the public site",
        href: "/temple-admin/public-site/bookings",
        icon: ShoppingBag,
        status: "active",
        plan: "sankalpa",
      },
      {
        label: "Donations Portal",
        description: "Online donation forms with payment gateway integration",
        href: "/temple-admin/public-site/donations",
        icon: CreditCard,
        status: "active",
        plan: null,
      },
      {
        label: "Contact & Location",
        description: "Contact form, directions and Google Maps embed",
        href: "/temple-admin/public-site/contact",
        icon: MapPin,
        status: "active",
        plan: null,
      },
    ],
  },
  {
    group: "Technical",
    items: [
      {
        label: "Feature Management",
        description: "Enable or disable individual site features per plan",
        href: "/temple-admin/public-site/features",
        icon: Zap,
        status: "active",
        plan: null,
      },
      {
        label: "SEO & Domain",
        description: "Title tags, meta descriptions and custom domain routing",
        href: "/temple-admin/public-site/seo",
        icon: Search,
        status: "active",
        plan: null,
      },
    ],
  },
];

const PLAN_COLORS: Record<string, "brand" | "orange" | "purple"> = {
  sankalpa: "brand",
  aaradhana: "purple",
};

const PLAN_LABELS: Record<string, string> = {
  sankalpa: "Sankalpa+",
  aaradhana: "Aaradhana",
};

const PREVIEW_TABS = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export default function PublicSiteIndexPage() {
  const [previewTab, setPreviewTab] = useState("desktop");

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20 shrink-0">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              Public Site
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Your temple&#39;s microsite — live at{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg font-mono text-brand">
                sivatemple.site.omkaarya.com
              </code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            leadingIcon={<Eye className="w-4 h-4" />}
          >
            Preview Site
          </Button>
          <Button
            variant="primary"
            size="md"
            leadingIcon={<ExternalLink className="w-4 h-4" />}
          >
            View Live Site
          </Button>
        </div>
      </div>

      {/* ─── Status Banner ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-[28px] bg-gradient-to-r from-brand/5 via-orange-50/50 to-transparent dark:from-brand/10 dark:via-zinc-900/50 border border-brand/10 dark:border-brand/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 opacity-30 scale-150" />
          </div>
          <div>
            <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Site is Live
            </p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              Last published 2 hours ago · 1,240 visitors this month
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs font-bold text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            <span>SSL Active</span>
          </div>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-brand">Sankalpa Plan</span>
          </div>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <button className="text-brand hover:underline flex items-center gap-1">
            Upgrade to Aaradhana <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ─── Main Grid: Module Cards + Quick Preview ─────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-10 items-start">
        {/* Left: Module Groups */}
        <div className="space-y-10">
          {PUBLIC_SITE_MODULES.map((group) => (
            <div key={group.group} className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 px-1">
                {group.group}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isLocked = item.status === "locked";
                  return (
                    <Link
                      key={item.href}
                      href={isLocked ? "#" : item.href}
                      className={`group relative flex items-start gap-4 p-5 rounded-[22px] border-2 transition-all duration-200 ${
                        isLocked
                          ? "border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 cursor-not-allowed opacity-70"
                          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-brand/30 hover:shadow-md hover:shadow-brand/5 cursor-pointer"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isLocked
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                            : "bg-brand-50/50 dark:bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white"
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                            {item.label}
                          </span>
                          {item.plan && (
                            <Badge
                              color={PLAN_COLORS[item.plan] || "gray"}
                              size="sm"
                              variant="subtle"
                            >
                              {PLAN_LABELS[item.plan]}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      {!isLocked && (
                        <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-brand transition-colors shrink-0 mt-0.5" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Quick Preview Panel */}
        <div className="sticky top-6 space-y-4">
          <div className="rounded-[28px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50 dark:border-zinc-900">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Site Preview
              </span>
              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 p-1 rounded-xl">
                {PREVIEW_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPreviewTab(tab.id)}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                        previewTab === tab.id
                          ? "bg-white dark:bg-zinc-800 text-brand shadow-sm"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                      title={tab.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Browser Chrome */}
            <div className="px-4 pt-4">
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                {/* Browser Bar */}
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-800 rounded-md px-3 py-1 text-[9px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    sivatemple.site.omkaarya.com
                  </div>
                </div>
                {/* Preview Content Mockup */}
                <div className="aspect-[3/4] bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden">
                  {/* Hero */}
                  <div className="h-24 bg-gradient-to-br from-orange-800 via-orange-900 to-zinc-900 relative flex items-end p-3">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600147131759-880e94a6185f?w=400')] bg-cover bg-center" />
                    <div className="relative z-10">
                      <div className="h-2 w-20 bg-white/80 rounded-full mb-1" />
                      <div className="h-1.5 w-12 bg-white/40 rounded-full" />
                    </div>
                  </div>
                  {/* Content Sections */}
                  <div className="p-3 space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-14 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                          <div className="h-1.5 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                        </div>
                      </div>
                    ))}
                    <div className="h-8 w-full rounded-lg bg-brand/20 border border-brand/20 flex items-center justify-center">
                      <div className="h-1.5 w-16 bg-brand/60 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="text-[10px] font-medium text-zinc-400">
                Last updated: 2 hrs ago
              </div>
              <Button variant="ghost" size="sm" trailingIcon={<ExternalLink className="w-3 h-3" />}>
                Open
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Monthly Visitors", value: "1,240", trend: "+12%" },
              { label: "Bookings via Site", value: "89", trend: "+5%" },
              { label: "Avg. Session", value: "3m 22s", trend: null },
              { label: "Bounce Rate", value: "34%", trend: "-8%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-[18px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-1"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  {stat.label}
                </p>
                <p className="text-xl font-black text-zinc-900 dark:text-white">
                  {stat.value}
                </p>
                {stat.trend && (
                  <p
                    className={`text-[10px] font-bold ${
                      stat.trend.startsWith("-")
                        ? stat.label === "Bounce Rate"
                          ? "text-emerald-500"
                          : "text-red-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {stat.trend} this month
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
