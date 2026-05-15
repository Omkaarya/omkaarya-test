"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import GuardedBackLink from "@/app/components/admin/GuardedBackLink";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";
import { usePostSaveSuccess } from "@/lib/use-post-save-success";
import { useUnsavedFormGuard } from "@/lib/use-unsaved-form-guard";
import {
  ArrowLeft,
  Save,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import { Button } from "@/app/components/ds/atoms/Button";

// ── Types ──────────────────────────────────────────────────────────

type PlanFeatureConfig = {
  featureId: string;
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
  pricing_tier: "Subscription plans",
};

const PLAN_META: Record<string, { label: string; tierColor: string }> = {
  Prarambha: { label: "Prarambha (Starter)", tierColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  Sankalpa: { label: "Sankalpa (Premium)", tierColor: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" },
  Aaradhana: { label: "Aaradhana (Advanced)", tierColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300" },
};

function isUuidString(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

const LIST_PATH = "/super-admin/pricing-plans";

// ── Main Page ──────────────────────────────────────────────────────

export default function PlanFeaturesPage() {
  const router = useRouter();
  const params = useParams();
  const planId = decodeURIComponent(params.planId as string);
  const legacyMeta = PLAN_META[planId];

  const [features, setFeatures] = useState<PlanFeatureConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [fetchedPlanName, setFetchedPlanName] = useState<string | null>(null);
  const visGuardRef = useRef<number>(Date.now());
  const postSave = usePostSaveSuccess({ router });
  const formGuard = useUnsavedFormGuard({ isDirty: dirty, enabled: !postSave.isLocked });

  const displayPlanName = legacyMeta?.label ?? fetchedPlanName ?? planId;
  const meta = legacyMeta ?? {
    label: displayPlanName,
    tierColor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  };

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/plan-features?planId=${encodeURIComponent(planId)}`, { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as
        | { success?: boolean; data?: PlanFeatureConfig[]; error?: { message?: string; reason?: string } }
        | PlanFeatureConfig[];
      if (res.ok) {
        const rows = Array.isArray(body)
          ? body
          : body && typeof body === "object" && body.success && Array.isArray(body.data)
            ? body.data
            : null;
        if (rows) setFeatures(rows);
        else setError("Unexpected plan features response.");
      } else {
        setError(
          body && typeof body === "object" && "error" in body && (body as { error?: { message?: string } }).error
            ? String((body as { error: { message: string } }).error.message)
            : "Failed to load plan features"
        );
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

  useEffect(() => {
    const onVis = () => {
      // Avoid an immediate duplicate refetch right after mount.
      if (Date.now() - visGuardRef.current < 750) return;
      if (document.visibilityState === "visible" && !dirty) {
        void loadFeatures();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadFeatures, dirty]);

  useEffect(() => {
    setFetchedPlanName(null);
    if (legacyMeta || !isUuidString(planId)) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/pricing-plans/${encodeURIComponent(planId)}`);
      if (cancelled || !res.ok) return;
      const json: { success?: boolean; data?: { name?: string } } = await res.json().catch(() => ({}));
      if (json.success && json.data?.name) {
        setFetchedPlanName(json.data.name);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planId, legacyMeta]);

  // ── Handlers ────────────────────────────────────────────────────

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.featureId === featureId ? { ...f, isEnabled: !f.isEnabled } : f
      )
    );
    setDirty(true);
    setSaved(false);
  };

  const setLimit = (featureId: string, value: string) => {
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
      const res = await fetch("/api/plan-features", {
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
      const j = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!res.ok || j.success === false) {
        throw new Error(j.error?.message ?? "Failed to save");
      }
      setSaved(true);
      setDirty(false);
      formGuard.markClean();
      postSave.triggerSuccess({
        message: `Feature configuration saved for ${displayPlanName}.`,
        redirectTo: LIST_PATH,
      });
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
        <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
          <DashboardPageHeader
            breadcrumb={
              <GuardedBackLink
                href={LIST_PATH}
                onNavigate={formGuard.requestNavigate}
                className="inline-flex items-center gap-1.5 font-medium text-[var(--brand-primary)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to pricing plans
              </GuardedBackLink>
            }
            title="Feature configuration"
            titleAccessory={
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${meta.tierColor}`}>{meta.label}</span>
            }
            description={`Enable or disable features · Set limits for metered features · ${enabledCount}/${features.length} enabled`}
            actions={
              <>
                <Button type="button" variant="outline" size="sm" onClick={enableAll}>
                  Enable all
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="gap-2"
                  loading={saving}
                  disabled={!dirty || postSave.isLocked}
                  onClick={handleSave}
                  leadingIcon={!saving ? <Save className="h-4 w-4" /> : undefined}
                >
                  {saving ? "Saving…" : "Save configuration"}
                </Button>
              </>
            }
          />
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <PostSaveSuccessBanner text={postSave.bannerText} className="mx-6 mt-4" />

        {/* Feature Groups */}
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : error && features.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-500">
            <p>Could not load this plan’s feature configuration. Check the database and try again, or add features in the{" "}
            <Link href="/super-admin/system-settings/feature-registry" className="font-medium text-[var(--brand-primary)] hover:underline">Feature Registry</Link>.
            </p>
          </div>
        ) : !error && features.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-500">
            <p>No active features in the registry. Add features in the <Link href="/super-admin/system-settings/feature-registry" className="font-medium text-[var(--brand-primary)] hover:underline">Feature Registry</Link> first.</p>
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

      <UnsavedChangesDialog
        dialogRef={formGuard.dialogRef}
        onStay={formGuard.closeDialog}
        onLeave={formGuard.confirmLeave}
      />
    </div>
  );
}
