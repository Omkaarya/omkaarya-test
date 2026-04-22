"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Database,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
// ── Types ──────────────────────────────────────────────────────────

type Feature = {
  id: number;
  name: string;
  key: string;
  moduleKey: string;
  description: string;
  hasLimit: boolean;
  limitType: string | null;
  isActive: boolean;
  isVisibleInPlanConfig: boolean;
  createdAt: string;
};

type FeatureFormData = {
  name: string;
  key: string;
  moduleKey: string;
  description: string;
  hasLimit: boolean;
  limitType: string;
  isVisibleInPlanConfig: boolean;
};

const MODULE_OPTIONS = [
  "pooja", "donation", "inventory", "finance", "device", "staff",
  "pos", "events", "devotee", "notification", "domain", "integration",
  "pricing_tier",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// ── Modal ──────────────────────────────────────────────────────────

function FeatureModal({
  feature,
  onClose,
  onSave,
}: {
  feature: Feature | null;
  onClose: () => void;
  onSave: (data: FeatureFormData, id?: number) => Promise<void>;
}) {
  const isEdit = feature !== null;
  const [form, setForm] = useState<FeatureFormData>({
    name: feature?.name || "",
    key: feature?.key || "",
    moduleKey: feature?.moduleKey || MODULE_OPTIONS[0],
    description: feature?.description || "",
    hasLimit: feature?.hasLimit || false,
    limitType: feature?.limitType || "number",
    isVisibleInPlanConfig: feature?.isVisibleInPlanConfig ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate key from name (only when creating)
  useEffect(() => {
    if (!isEdit) {
      setForm((prev) => ({ ...prev, key: slugify(prev.name) }));
    }
  }, [form.name, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.key.trim() || !form.moduleKey.trim()) {
      setError("Name, key, and module are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form, feature?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {isEdit ? "Edit Feature" : "Add Feature"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Warning for edit */}
          {isEdit && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Feature key is immutable after creation and cannot be changed.</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Feature Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Feature Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="e.g. Pooja Management"
            />
          </div>

          {/* Feature Key */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Feature Key * {isEdit && <span className="text-amber-600">(read-only)</span>}
            </label>
            <input
              type="text"
              value={form.key}
              onChange={(e) => !isEdit && setForm({ ...form, key: e.target.value })}
              readOnly={isEdit}
              className={`w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${isEdit ? "cursor-not-allowed opacity-60" : ""}`}
              placeholder="auto_generated_from_name"
            />
          </div>

          {/* Module Key */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Module Key *
            </label>
            <div className="relative">
              <select
                value={form.moduleKey}
                onChange={(e) => setForm({ ...form, moduleKey: e.target.value })}
                className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 pr-8 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {MODULE_OPTIONS.map((mod) => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Brief description of the feature"
            />
          </div>

          {/* Toggles row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Has Limit */}
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={form.hasLimit}
                onChange={(e) => setForm({ ...form, hasLimit: e.target.checked })}
                className="accent-[var(--brand-primary)]"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Has Limit</span>
            </label>

            {/* Visible in Plan Config */}
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={form.isVisibleInPlanConfig}
                onChange={(e) => setForm({ ...form, isVisibleInPlanConfig: e.target.checked })}
                className="accent-[var(--brand-primary)]"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Visible in Plans</span>
            </label>
          </div>

          {/* Limit Type (only if hasLimit) */}
          {form.hasLimit && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Limit Type
              </label>
              <div className="relative">
                <select
                  value={form.limitType}
                  onChange={(e) => setForm({ ...form, limitType: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 pr-8 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Update Feature" : "Create Feature"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function FeatureRegistryPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editFeature, setEditFeature] = useState<Feature | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");

  const loadFeatures = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch("/api/features", { cache: "no-store" });
      if (res.ok) {
        const j = (await res.json()) as
          | { success?: boolean; data?: Feature[] }
          | Feature[];
        const data = Array.isArray(j) ? j : j?.success && Array.isArray(j.data) ? j.data : null;
        if (data) {
          setFeatures(data);
        } else {
          setLoadError("Unexpected response from server.");
        }
      } else {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string | { message?: string; reason?: string };
        };
        const msg =
          typeof err.error === "string"
            ? err.error
            : err.error && typeof err.error === "object" && "message" in err.error
              ? String(err.error.message)
              : `Failed to load features (${res.status})`;
        setLoadError(msg);
        setFeatures([]);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Network error");
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  // ── Handlers ────────────────────────────────────────────────────

  const handleSave = async (data: FeatureFormData, id?: number) => {
    const url = id ? `/api/features/${id}` : "/api/features";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as {
        error?: string | { message?: string; reason?: string };
      };
      const msg =
        typeof err.error === "string"
          ? err.error
          : err.error && typeof err.error === "object" && "message" in err.error
            ? String(err.error.message)
            : "Failed to save feature";
      throw new Error(msg);
    }
    await loadFeatures();
  };

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/features/${id}`, { method: "PATCH" });
      if (res.ok) await loadFeatures();
    } finally {
      setTogglingId(null);
    }
  };

  // ── Derived data ────────────────────────────────────────────────

  const modules = [...new Set(features.map((f) => f.moduleKey))].sort();
  const filtered = features.filter((f) => {
    if (moduleFilter !== "all" && f.moduleKey !== moduleFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.key.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, Feature[]>>((acc, f) => {
    (acc[f.moduleKey] = acc[f.moduleKey] || []).push(f);
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))]">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Feature Registry
              </h1>
              <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                {features.length} features
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              System-level feature definitions · Controls what appears in Pricing Plan configuration
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditFeature(null); setModalOpen(true); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)]"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </button>
        </div>

        {/* Warning Banner */}
        <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>Internal Configuration</strong> — Changes here affect all pricing plans and tenant portals.
            Feature keys are immutable after creation. Features cannot be deleted — only deactivated.
          </div>
        </div>

        {loadError && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {loadError}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search features…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="relative">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 pr-8 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="all">All modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2 px-6 pb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="px-6 pb-8 pt-4 text-center text-sm text-zinc-500">
            <Database className="mx-auto mb-2 h-10 w-10 opacity-30" />
            <p>No features found. {search || moduleFilter !== "all" ? "Try adjusting filters." : "Click \"Add Feature\" to create one."}</p>
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-6">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([module, feats]) => (
              <div key={module}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {module}
                </h3>
                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Feature Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Key</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Has Limit</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Plan Visible</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {feats.map((f) => (
                        <tr key={f.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{f.name}</p>
                              {f.description && (
                                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{f.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <code className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {f.key}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {f.hasLimit ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                {f.limitType || "number"}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {f.isVisibleInPlanConfig ? (
                              <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                f.isActive
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                              }`}
                            >
                              {f.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => { setEditFeature(f); setModalOpen(true); }}
                                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggle(f.id)}
                                disabled={togglingId === f.id}
                                className={`rounded-lg p-2 transition-colors ${
                                  f.isActive
                                    ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                    : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                                title={f.isActive ? "Deactivate" : "Activate"}
                              >
                                {f.isActive ? (
                                  <ToggleRight className="h-5 w-5" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <FeatureModal
          feature={editFeature}
          onClose={() => { setModalOpen(false); setEditFeature(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
