"use client";

import { useEffect, useState } from "react";
import {
  Zap,
  Lock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Info,
  ShoppingBag,
  CreditCard,
  Star,
  Users,
  Calendar,
  Image,
  Globe,
  Phone,
  MapPin,
  MessageSquare,
  BarChart3,
  Bell,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { ElementType } from "react";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Button } from "@/app/components/ds/atoms/Button";
import { Switch } from "@/app/components/ds/atoms/Switch";
import { useTempleSettings } from "@/lib/use-temple-settings";
type Plan = "prarambha" | "sankalpa" | "aaradhana";

interface Feature {
  id: string;
  label: string;
  description: string;
  icon: ElementType;
  category: string;
  availableFrom: Plan | null; // null = all plans
  enabled: boolean;
  locked: boolean; // locked because current plan insufficient
}

// ─── Plan Info ───────────────────────────────────────────────────────────────
const PLANS: Record<Plan, { label: string; color: string; order: number }> = {
  prarambha: { label: "Prarambha", color: "bg-zinc-400", order: 0 },
  sankalpa: { label: "Sankalpa", color: "bg-brand", order: 1 },
  aaradhana: { label: "Aaradhana", color: "bg-purple-600", order: 2 },
};

const PLAN_ORDER: Plan[] = ["prarambha", "sankalpa", "aaradhana"];

function normalizePlanName(raw: string | null | undefined): Plan {
  const s = (raw ?? "").trim().toLowerCase();
  if (s.includes("aaradhana")) return "aaradhana";
  if (s.includes("sankalpa")) return "sankalpa";
  return "prarambha";
}

function isPlanSufficient(currentPlan: Plan, featurePlan: Plan | null): boolean {
  if (featurePlan === null) return true;
  return PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(featurePlan);
}

function applyPlanLocks(features: Feature[], currentPlan: Plan): Feature[] {
  return features.map((f) => ({
    ...f,
    locked: f.availableFrom ? !isPlanSufficient(currentPlan, f.availableFrom) : false,
  }));
}

// ─── Feature Definitions ─────────────────────────────────────────────────────
const BASE_FEATURES: Omit<Feature, "locked">[] = [
  // ── Core Pages ──────────────────────────────────────────
  {
    id: "homepage",
    label: "Homepage / Hero Section",
    description: "Display a public-facing homepage with hero banner and highlights.",
    icon: Globe,
    category: "Core Pages",
    availableFrom: null,
    enabled: true,
  },
  {
    id: "about",
    label: "About & History Page",
    description: "Dedicated page for temple history, deity info and mission statement.",
    icon: Globe,
    category: "Core Pages",
    availableFrom: null,
    enabled: true,
  },
  {
    id: "contact",
    label: "Contact & Directions",
    description: "Contact form, phone number, address and Google Maps embed.",
    icon: Phone,
    category: "Core Pages",
    availableFrom: null,
    enabled: true,
  },
  {
    id: "gallery",
    label: "Photo & Video Gallery",
    description: "Public media gallery for festivals, events and temple photographs.",
    icon: Image,
    category: "Core Pages",
    availableFrom: null,
    enabled: true,
  },
  // ── Events & Schedule ───────────────────────────────────
  {
    id: "event_listing",
    label: "Events Listing",
    description: "Public calendar of upcoming poojas, festivals and special events.",
    icon: Calendar,
    category: "Events & Schedule",
    availableFrom: null,
    enabled: true,
  },
  {
    id: "pooja_schedule",
    label: "Daily Pooja Schedule",
    description: "Time-based daily schedule of all temple rituals.",
    icon: Calendar,
    category: "Events & Schedule",
    availableFrom: "sankalpa",
    enabled: true,
  },
  {
    id: "live_stream",
    label: "Live Stream Embed",
    description: "Embed YouTube/Zoom live stream links for major events.",
    icon: Bell,
    category: "Events & Schedule",
    availableFrom: "aaradhana",
    enabled: false,
  },
  {
    id: "online_booking",
    label: "Online Pooja Booking",
    description: "Allow devotees to book poojas and events online with payment.",
    icon: ShoppingBag,
    category: "Online Services",
    availableFrom: "sankalpa",
    enabled: true,
  },
  {
    id: "donations",
    label: "Donations Portal",
    description: "Accept online donations with payment gateway and receipts.",
    icon: CreditCard,
    category: "Online Services",
    availableFrom: null,
    enabled: true,
  },
  {
    id: "prasadam_delivery",
    label: "Prasadam Delivery Requests",
    description: "Allow devotees to request prasadam delivery to their location.",
    icon: MapPin,
    category: "Online Services",
    availableFrom: "aaradhana",
    enabled: false,
  },
  {
    id: "staff_directory",
    label: "Priests & Staff Directory",
    description: "Public listing of temple priests and administrative staff.",
    icon: Users,
    category: "Community",
    availableFrom: "sankalpa",
    enabled: true,
  },
  {
    id: "reviews",
    label: "Devotee Reviews & Ratings",
    description: "Allow verified devotees to leave public reviews and star ratings.",
    icon: Star,
    category: "Community",
    availableFrom: "aaradhana",
    enabled: false,
  },
  {
    id: "forum",
    label: "Community Forum",
    description: "Discussion board for devotees to connect and share.",
    icon: MessageSquare,
    category: "Community",
    availableFrom: "aaradhana",
    enabled: false,
  },
  {
    id: "site_analytics",
    label: "Site Analytics Dashboard",
    description: "View visitor count, page views and bounce rate for the public site.",
    icon: BarChart3,
    category: "Analytics",
    availableFrom: "sankalpa",
    enabled: true,
  },
  {
    id: "conversion_tracking",
    label: "Booking Conversion Tracking",
    description: "Track how many visitors convert to bookings or donations.",
    icon: BarChart3,
    category: "Analytics",
    availableFrom: "aaradhana",
    enabled: false,
  },
];

const PLAN_BADGE_COLOR: Record<Plan, "gray" | "brand" | "purple"> = {
  prarambha: "gray",
  sankalpa: "brand",
  aaradhana: "purple",
};

export default function FeatureManagementPage() {
  const { payload, loading, saving, error, replace, reload } = useTempleSettings<Record<string, unknown>>(
    "public_features",
    {}
  );
  const [currentPlan, setCurrentPlan] = useState<Plan>("prarambha");
  const [features, setFeatures] = useState<Feature[]>(() => applyPlanLocks(BASE_FEATURES as Feature[], "prarambha"));
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    const toggles = (payload.toggles as Record<string, boolean> | undefined) ?? {};
    const savedPlan = normalizePlanName(typeof payload.currentPlan === "string" ? payload.currentPlan : null);
    setCurrentPlan(savedPlan);
    setFeatures(
      applyPlanLocks(
        BASE_FEATURES.map((f) => ({
          ...f,
          enabled: toggles[f.id] !== undefined ? toggles[f.id]! : f.enabled,
        })) as Feature[],
        savedPlan
      )
    );
  }, [loading, payload]);

  const categories = [...new Set(BASE_FEATURES.map((f) => f.category))];

  function toggleFeature(id: string) {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id && !f.locked ? { ...f, enabled: !f.enabled } : f
      )
    );
  }

  const enabledCount = features.filter((f) => f.enabled && !f.locked).length;
  const lockedCount = features.filter((f) => f.locked).length;

  const saveConfiguration = async () => {
    const toggles = Object.fromEntries(features.filter((f) => !f.locked).map((f) => [f.id, f.enabled]));
    await replace({ toggles, currentPlan } as Record<string, unknown>);
  };

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              Feature Management
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Control which sections and capabilities are active on your public microsite. Changes are saved to{" "}
              <code className="text-xs">public_features</code>.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={() => reload()}>
            Reload
          </Button>
          <Button variant="primary" size="lg" onClick={saveConfiguration} disabled={saving || loading}>
            {saving ? "Saving…" : "Save Configuration"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading feature flags…
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-[22px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center space-y-1">
          <p className="text-2xl font-black text-brand">{enabledCount}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Features Active</p>
        </div>
        <div className="p-5 rounded-[22px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center space-y-1">
          <p className="text-2xl font-black text-zinc-900 dark:text-white">{features.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Features</p>
        </div>
        <div className="p-5 rounded-[22px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center space-y-1">
          <p className="text-2xl font-black text-purple-600">{lockedCount}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Locked (Upgrade)</p>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="flex items-center justify-between p-5 rounded-[22px] bg-gradient-to-r from-brand/5 to-transparent border border-brand/10 dark:border-brand/20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Current Plan: {PLANS[currentPlan].label}
          </span>
        </div>
        <button className="text-xs font-bold text-brand hover:underline">
          Upgrade to Aaradhana to unlock 5 more features →
        </button>
      </div>

      {/* Feature Groups */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryFeatures = features.filter((f) => f.category === category);
          return (
            <section key={category} className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 px-1">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryFeatures.map((feature) => {
                  const Icon = feature.icon;
                  const isExpanded = expandedInfo === feature.id;
                  return (
                    <div
                      key={feature.id}
                      className={`rounded-[20px] border-2 transition-all duration-200 ${
                        feature.locked
                          ? "border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20"
                          : feature.enabled
                          ? "border-brand/20 bg-white dark:bg-zinc-950 shadow-sm shadow-brand/5"
                          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                      }`}
                    >
                      <div className="flex items-center gap-4 p-5">
                        {/* Status Dot */}
                        <div className="shrink-0">
                          {feature.locked ? (
                            <Lock className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                          ) : feature.enabled ? (
                            <CheckCircle2 className="w-4 h-4 text-brand" />
                          ) : (
                            <XCircle className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                          )}
                        </div>

                        {/* Icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            feature.locked
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                              : "bg-brand/10 text-brand"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Label & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[13px] font-black uppercase tracking-tight ${
                                feature.locked
                                  ? "text-zinc-400 dark:text-zinc-600"
                                  : "text-zinc-900 dark:text-white"
                              }`}
                            >
                              {feature.label}
                            </span>
                            {feature.availableFrom && (
                              <Badge
                                color={PLAN_BADGE_COLOR[feature.availableFrom]}
                                size="sm"
                                variant="subtle"
                              >
                                {PLANS[feature.availableFrom].label}+
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>

                        {/* Info Toggle */}
                        <button
                          onClick={() =>
                            setExpandedInfo(isExpanded ? null : feature.id)
                          }
                          className="text-zinc-300 hover:text-brand transition-colors shrink-0"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        {/* Toggle */}
                        {feature.locked ? (
                          <button className="text-xs font-bold text-brand hover:underline whitespace-nowrap shrink-0">
                            Upgrade
                          </button>
                        ) : (
                          <Switch
                            checked={feature.enabled}
                            onChange={() => toggleFeature(feature.id)}
                          />
                        )}
                      </div>

                      {/* Expanded Info Panel */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-zinc-50 dark:border-zinc-900 pt-4 animate-in slide-in-from-top-2 duration-200">
                          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            <span className="font-black text-zinc-700 dark:text-zinc-300">How it works: </span>
                            {feature.description} This feature is visible to all site visitors. Disabling it will immediately hide it from the live site without affecting any stored data.
                          </p>
                          {feature.availableFrom && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-zinc-500">
                              <Lock className="w-3 h-3" />
                              Available from{" "}
                              <span className="text-brand">
                                {PLANS[feature.availableFrom].label} plan
                              </span>{" "}
                              and above
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer Save */}
      <div className="flex justify-end pt-8 border-t border-zinc-100 dark:border-zinc-800">
        <Button variant="primary" size="lg" onClick={saveConfiguration} disabled={saving || loading}>
          {saving ? "Saving…" : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
