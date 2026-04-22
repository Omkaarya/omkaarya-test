"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { apiUrl } from "@/lib/api-base";

// ── Types ──────────────────────────────────────────────────────────

type PlanFeatureConfig = {
  featureId: number;
  featureName: string;
  featureKey: string;
  moduleKey: string;
  hasLimit: boolean;
  limitType: string | null;
  description: string;
  isEnabled: boolean;
  limitValue: number | null;
};

// ── Helpers ────────────────────────────────────────────────────────

function groupByModule(features: PlanFeatureConfig[]): Record<string, PlanFeatureConfig[]> {
  return features.reduce<Record<string, PlanFeatureConfig[]>>((acc, f) => {
    (acc[f.moduleKey] = acc[f.moduleKey] || []).push(f);
    return acc;
  }, {});
}

const MODULE_LABELS: Record<string, string> = {
  pooja: "🛕 Pooja & Rituals",
  donation: "🎁 Donations",
  inventory: "📦 Inventory",
  finance: "💰 Finance",
  device: "📱 Devices",
  staff: "👥 Staff",
  pos: "🏪 Point of Sale",
  events: "🎪 Events & Festivals",
  devotee: "🙏 Devotee CRM",
  notification: "🔔 Notifications",
  domain: "🌐 Domain",
  integration: "🔌 Integrations",
};

const PLAN_META: Record<string, { label: string; tierColor: string }> = {
  Aaaradhana: { label: "Prarambha (Basic)", tierColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  Sankalpa: { label: "Sankalpa (Business)", tierColor: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" },
  Mandala: { label: "Aaaradhana (Enterprise)", tierColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300" },
};

// ── Main Page ──────────────────────────────────────────────────────

export default function PlanFeaturesPage() {
  const params = useParams();
  const router = useRouter();
  const planId = decodeURIComponent(params.planId as string);
  const meta = PLAN_META[planId] || { label: planId, tierColor: "bg-zinc-100 text-zinc-700" };

  const [features, setFeatures] = useState<PlanFeatureConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  const loadFeatures = useCallback(async () => {
    try {
      const res = await fetch(apiUrl(`/api/plan-features?planId=${encodeURIComponent(planId)}`));
      if (res.ok) {
        setFeatures(await res.json());
      }
    } catch {
      setError("Failed to load features");
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  // ── Handlers ────────────────────────────────────────────────────

  const toggleFeature = (featureId: number) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.featureId === featureId ? { ...f, isEnabled: !f.isEnabled } : f
      )
    );
    setDirty(true);
    setSaved(false);
  };

  const setLimit = (featureId: number, value: string) => {
    const numValue = value === "" ? null : parseInt(value, 10);
    setFeatures((prev) =>
      prev.map((f) =>
        f.featureId === featureId ? { ...f, limitValue: isNaN(numValue as number) ? null : numValue } : f
      )
    );
    setDirty(true);
    setSaved(false);
  };

  const enableAll = () => {
    setFeatures((prev) => prev.map((f) => ({ ...f, isEnabled: true })));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/plan-features"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          features: features.map((f) => ({
            featureId: f.featureId,
            isEnabled: f.isEnabled,
            limitValue: f.limitValue,
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setDirty(false);
    } catch {
      setError("Failed to save feature configuration");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────

  const grouped = groupByModule(features);
  const enabledCount = features.filter((f) => f.isEnabled).length;

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))]">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/super-admin/pricing-plans"
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Pricing Plans
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Feature Configuration
              </h1>
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${meta.tierColor}`}>
                {meta.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Enable or disable features · Set limits for metered features · {enabledCount}/{features.length} enabled
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={enableAll}
              className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save Configuration"}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {saved && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Feature configuration saved successfully for <strong>{planId}</strong> plan.
          </div>
        )}

        {/* Feature Groups */}
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : features.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-500">
            <p>No features available. Add features in the <Link href="/super-admin/system-settings/feature-registry" className="font-medium text-[var(--brand-primary)] hover:underline">Feature Registry</Link> first.</p>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([moduleKey, feats]) => (
              <div key={moduleKey} className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                {/* Module Header */}
                <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                    {MODULE_LABELS[moduleKey] || moduleKey}
                  </h3>
                </div>

                {/* Feature Rows */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {feats.map((f) => (
                    <div
                      key={f.featureId}
                      className={`flex flex-wrap items-center gap-4 px-5 py-4 transition-colors ${
                        f.isEnabled ? "" : "bg-zinc-50/50 dark:bg-zinc-900/50"
                      }`}
                    >
                      {/* Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleFeature(f.featureId)}
                        className={`shrink-0 transition-colors ${
                          f.isEnabled
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-300 dark:text-zinc-600"
                        }`}
                        title={f.isEnabled ? "Disable" : "Enable"}
                      >
                        {f.isEnabled ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                      </button>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${f.isEnabled ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}`}>
                          {f.featureName}
                        </p>
                        {f.description && (
                          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{f.description}</p>
                        )}
                      </div>

                      {/* Key badge */}
                      <code className="hidden rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-500 sm:inline-block dark:bg-zinc-800 dark:text-zinc-400">
                        {f.featureKey}
                      </code>

                      {/* Limit input */}
                      {f.hasLimit && f.isEnabled && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Limit:</label>
                          <input
                            type="number"
                            min={0}
                            value={f.limitValue ?? ""}
                            onChange={(e) => setLimit(f.featureId, e.target.value)}
                            placeholder="∞"
                            className="w-24 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-right outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      )}

                      {f.hasLimit && !f.isEnabled && (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dirty indicator */}
        {dirty && (
          <div className="border-t border-zinc-100 px-6 py-3 dark:border-zinc-800">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠ You have unsaved changes. Click &quot;Save Configuration&quot; to apply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
