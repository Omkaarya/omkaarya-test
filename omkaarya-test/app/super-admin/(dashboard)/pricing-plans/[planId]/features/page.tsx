"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import GuardedBackLink from "@/app/components/admin/GuardedBackLink";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";
import { usePostSaveSuccess } from "@/lib/use-post-save-success";
import { useUnsavedFormGuard } from "@/lib/use-unsaved-form-guard";
import { formSnapshot } from "@/lib/form-snapshot";
import {
  ArrowLeft,
  Save,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import { Button } from "@/app/components/ds/atoms/Button";
import PlanFeatureRow from "@/app/super-admin/_components/PlanFeatureRow";
import PricingTierForm, {
  PRICING_TIER_INITIAL_FORM,
  type PricingTierFormData,
  pricingTierFormFromApiPlan,
  pricingTierFormToPayload,
} from "@/app/super-admin/_components/PricingTierForm";

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

function isUuidString(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

const LIST_PATH = "/super-admin/pricing-plans";

export default function PlanFeaturesPage() {
  const router = useRouter();
  const params = useParams();
  const planId = decodeURIComponent(params.planId as string);

  const [features, setFeatures] = useState<PlanFeatureConfig[]>([]);
  const [tierForm, setTierForm] = useState<PricingTierFormData>(PRICING_TIER_INITIAL_FORM);
  const [tierBaseline, setTierBaseline] = useState(formSnapshot(PRICING_TIER_INITIAL_FORM));
  const [loading, setLoading] = useState(true);
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [savingTier, setSavingTier] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [featuresDirty, setFeaturesDirty] = useState(false);
  const visGuardRef = useRef<number>(Date.now());
  const postSave = usePostSaveSuccess({ router });

  const tierDirty = useMemo(() => formSnapshot(tierForm) !== tierBaseline, [tierForm, tierBaseline]);
  const dirty = featuresDirty || tierDirty;
  const formGuard = useUnsavedFormGuard({ isDirty: dirty, enabled: !postSave.isLocked });

  const loadFeatures = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`/api/plan-features?planId=${encodeURIComponent(planId)}`, { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as
        | { success?: boolean; data?: PlanFeatureConfig[]; error?: { message?: string } }
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
    }
  }, [planId]);

  const loadPlanDetails = useCallback(async () => {
    if (!isUuidString(planId)) return;
    try {
      const res = await fetch(`/api/pricing-plans/${encodeURIComponent(planId)}`, { cache: "no-store" });
      if (!res.ok) return;
      const json: { success?: boolean; data?: Record<string, unknown> } = await res.json().catch(() => ({}));
      if (json.success && json.data) {
        const next = pricingTierFormFromApiPlan(json.data);
        setTierForm(next);
        setTierBaseline(formSnapshot(next));
      }
    } catch {
      /* tier metadata optional for legacy ids */
    }
  }, [planId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadFeatures(), loadPlanDetails()]);
    setLoading(false);
  }, [loadFeatures, loadPlanDetails]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    const onVis = () => {
      if (Date.now() - visGuardRef.current < 750) return;
      if (document.visibilityState === "visible" && !dirty) {
        void loadAll();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadAll, dirty]);

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.featureId === featureId ? { ...f, isEnabled: !f.isEnabled } : f))
    );
    setFeaturesDirty(true);
    setSaved(false);
  };

  const setLimit = (featureId: string, value: string) => {
    const numValue = value === "" ? null : parseInt(value, 10);
    setFeatures((prev) =>
      prev.map((f) =>
        f.featureId === featureId ? { ...f, limitValue: Number.isNaN(numValue as number) ? null : numValue } : f
      )
    );
    setFeaturesDirty(true);
    setSaved(false);
  };

  const enableAll = () => {
    setFeatures((prev) => prev.map((f) => ({ ...f, isEnabled: true })));
    setFeaturesDirty(true);
    setSaved(false);
  };

  const handleSaveTierDetails = async () => {
    if (!isUuidString(planId)) return;
    setSavingTier(true);
    setError("");
    try {
      const res = await fetch(`/api/pricing-plans/${encodeURIComponent(planId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingTierFormToPayload(tierForm)),
      });
      const j = (await res.json().catch(() => ({}))) as { success?: boolean; error?: { message?: string } };
      if (!res.ok || j.success === false) {
        throw new Error(j.error?.message ?? "Failed to save tier details");
      }
      setTierBaseline(formSnapshot(tierForm));
      if (!featuresDirty) {
        formGuard.markClean();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save tier details");
    } finally {
      setSavingTier(false);
    }
  };

  const handleSaveFeatures = async () => {
    setSavingFeatures(true);
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
      setFeaturesDirty(false);
      if (!tierDirty) {
        formGuard.markClean();
      }
      postSave.triggerSuccess({
        message: `Configuration saved for ${tierForm.name || planId}.`,
        redirectTo: LIST_PATH,
      });
    } catch {
      setError("Failed to save feature configuration");
    } finally {
      setSavingFeatures(false);
    }
  };

  const grouped = groupByModule(features);
  const enabledCount = features.filter((f) => f.isEnabled).length;

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))] space-y-6">
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
            title="Configure pricing tier"
            description={
              tierForm.description.trim()
                ? tierForm.description
                : "Edit tier details, enable features, and set limits for this subscription plan."
            }
            actions={
              <>
                {isUuidString(planId) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={savingTier}
                    disabled={!tierDirty || postSave.isLocked}
                    onClick={() => void handleSaveTierDetails()}
                  >
                    Save tier details
                  </Button>
                ) : null}
                <Button type="button" variant="outline" size="sm" onClick={enableAll}>
                  Enable all features
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="gap-2"
                  loading={savingFeatures}
                  disabled={!featuresDirty || postSave.isLocked}
                  onClick={handleSaveFeatures}
                  leadingIcon={!savingFeatures ? <Save className="h-4 w-4" /> : undefined}
                >
                  {savingFeatures ? "Saving…" : "Save features"}
                </Button>
              </>
            }
          />
        </div>

        {error ? (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}
        {saved ? (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Feature configuration saved.
          </div>
        ) : null}
        <PostSaveSuccessBanner text={postSave.bannerText} className="mx-6 mt-4" />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : (
        <>
          {isUuidString(planId) ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">Tier details</h2>
              <PricingTierForm
                formData={tierForm}
                onChange={setTierForm}
                registryFeatures={[]}
                showFeatureMatrix={false}
                disabled={postSave.isLocked}
              />
            </div>
          ) : null}

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Feature configuration</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {enabledCount}/{features.length} features enabled
              </p>
            </div>

            {error && features.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-500">
                <p>
                  Could not load this plan&apos;s feature configuration. Add features in the{" "}
                  <Link
                    href="/super-admin/system-settings/feature-registry"
                    className="font-medium text-[var(--brand-primary)] hover:underline"
                  >
                    Feature Registry
                  </Link>
                  .
                </p>
              </div>
            ) : !error && features.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-500">
                <p>
                  No active features in the registry. Add features in the{" "}
                  <Link
                    href="/super-admin/system-settings/feature-registry"
                    className="font-medium text-[var(--brand-primary)] hover:underline"
                  >
                    Feature Registry
                  </Link>{" "}
                  first.
                </p>
              </div>
            ) : (
              <div className="space-y-6 p-6">
                {Object.entries(grouped)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([moduleKey, feats]) => (
                    <div key={moduleKey} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                          {MODULE_LABELS[moduleKey] || moduleKey}
                        </h3>
                      </div>
                      <div className="divide-y divide-zinc-100 p-2 dark:divide-zinc-800">
                        {feats.map((f) => (
                          <PlanFeatureRow
                            key={f.featureId}
                            title={f.featureName}
                            description={f.description}
                            muted={!f.isEnabled}
                            leading={
                              <button
                                type="button"
                                onClick={() => toggleFeature(f.featureId)}
                                className={`transition-colors ${
                                  f.isEnabled
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-zinc-300 dark:text-zinc-600"
                                }`}
                                title={f.isEnabled ? "Disable" : "Enable"}
                              >
                                {f.isEnabled ? (
                                  <ToggleRight className="h-7 w-7" />
                                ) : (
                                  <ToggleLeft className="h-7 w-7" />
                                )}
                              </button>
                            }
                            trailing={
                              <>
                                <code className="hidden rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-500 sm:inline-block dark:bg-zinc-800 dark:text-zinc-400">
                                  {f.featureKey}
                                </code>
                                {f.hasLimit && f.isEnabled ? (
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-zinc-500">Limit:</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={f.limitValue ?? ""}
                                      onChange={(e) => setLimit(f.featureId, e.target.value)}
                                      placeholder="∞"
                                      className="w-24 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-right outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    />
                                  </div>
                                ) : f.hasLimit ? (
                                  <span className="text-xs text-zinc-400">—</span>
                                ) : null}
                              </>
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {dirty ? (
              <div className="border-t border-zinc-100 px-6 py-3 dark:border-zinc-800">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  You have unsaved changes. Save tier details and/or features to apply.
                </p>
              </div>
            ) : null}
          </div>
        </>
      )}

      <UnsavedChangesDialog
        dialogRef={formGuard.dialogRef}
        onStay={formGuard.closeDialog}
        onLeave={formGuard.confirmLeave}
      />
    </div>
  );
}
