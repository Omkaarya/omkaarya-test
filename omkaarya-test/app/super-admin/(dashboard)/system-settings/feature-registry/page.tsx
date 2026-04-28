"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  CheckCircle2,
  Settings2,
  LayoutGrid,
  HeartHandshake,
  Package,
  Calculator,
  Smartphone,
  Users,
  CreditCard,
  CalendarDays,
  UserCircle,
  Bell,
  Globe,
  Settings,
  Zap,
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

const MODULE_META: Record<string, { label: string; icon: any; color: string }> = {
  pooja: { label: "Pooja Management", icon: LayoutGrid, color: "text-orange-500" },
  donation: { label: "Donations Management", icon: HeartHandshake, color: "text-pink-500" },
  inventory: { label: "Inventory Management", icon: Package, color: "text-blue-500" },
  finance: { label: "Finance Module", icon: Calculator, color: "text-emerald-500" },
  device: { label: "Device Configuration", icon: Smartphone, color: "text-zinc-500" },
  staff: { label: "Staff & RBAC", icon: Users, color: "text-indigo-500" },
  pos: { label: "Point of Sale (POS)", icon: CreditCard, color: "text-amber-500" },
  events: { label: "Events & Festivals", icon: CalendarDays, color: "text-rose-500" },
  devotee: { label: "Devotee Management", icon: UserCircle, color: "text-cyan-500" },
  notification: { label: "Notifications", icon: Bell, color: "text-yellow-500" },
  domain: { label: "Domain Management", icon: Globe, color: "text-violet-500" },
  integration: { label: "Integrations", icon: Zap, color: "text-sky-500" },
  pricing_tier: { label: "Pricing Tiers", icon: Settings, color: "text-slate-500" },
};

const MODULE_OPTIONS = Object.keys(MODULE_META);

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
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {isEdit ? "Edit Feature" : "Add Feature"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
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
                  <option key={mod} value={mod}>{MODULE_META[mod]?.label || mod}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={form.hasLimit}
                onChange={(e) => setForm({ ...form, hasLimit: e.target.checked })}
                className="accent-[var(--brand-primary)]"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Has Limit</span>
            </label>

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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadFeatures = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch("/api/features", { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        const data = j?.success && Array.isArray(j.data) ? j.data : Array.isArray(j) ? j : null;
        if (data) setFeatures(data);
        else setLoadError("Unexpected response from server.");
      } else {
        setLoadError(`Failed to load features (${res.status})`);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeatures(); }, [loadFeatures]);

  const handleSave = async (data: FeatureFormData, id?: number) => {
    const url = id ? `/api/features/${id}` : "/api/features";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save feature");
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

  const toggleGroup = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Filter & Group ──────────────────────────────────────────────

  const modulesFound = [...new Set(features.map(f => f.moduleKey))].sort();
  const filtered = features.filter(f => {
    if (moduleFilter !== "all" && f.moduleKey !== moduleFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.key.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, Feature[]>>((acc, f) => {
    (acc[f.moduleKey] = acc[f.moduleKey] || []).push(f);
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Feature Registry</h1>
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">{features.length} total</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">System-level feature definitions · Controls what appears in Pricing Plan configuration</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditFeature(null); setModalOpen(true); }}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)]"
        >
          <Plus className="h-4 w-4" /> Add Feature
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest"><Layers className="w-3.5 h-3.5 text-[var(--brand-primary)]" /> Modules</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{modulesFound.length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest"><Settings2 className="w-3.5 h-3.5 text-blue-500" /> Features</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{features.length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{features.filter(f => f.isActive).length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest"><Smartphone className="w-3.5 h-3.5 text-purple-500" /> Plan-visible</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{features.filter(f => f.isVisibleInPlanConfig).length}</div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              placeholder="Search features..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="all">All Modules</option>
            {modulesFound.map(m => <option key={m} value={m}>{MODULE_META[m]?.label || m}</option>)}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-full" />
            <div className="h-20 bg-zinc-50 dark:bg-zinc-900 rounded-lg w-full" />
            <div className="h-20 bg-zinc-50 dark:bg-zinc-900 rounded-lg w-full" />
          </div>
        ) : loadError ? (
          <div className="p-10 text-center text-red-500 flex flex-col items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            <p className="font-semibold">{loadError}</p>
            <button onClick={loadFeatures} className="text-xs text-blue-500 hover:underline">Retry</button>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="p-20 text-center text-zinc-400">
            <Layers className="w-12 h-12 mx-auto opacity-20 mb-4" />
            <p>No features found matching your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Object.keys(grouped).map(mKey => {
              const isOpen = expanded[mKey] ?? true;
              const meta = MODULE_META[mKey] || { label: mKey, icon: LayoutGrid, color: "text-zinc-400" };
              const Icon = meta.icon;
              return (
                <div key={mKey} className="group/module">
                  {/* Module Header */}
                  <div
                    onClick={() => toggleGroup(mKey)}
                    className="flex items-center px-6 py-3.5 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/50 transition-colors"
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mx-2 shadow-sm ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{meta.label}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{mKey} · {grouped[mKey].length} features</div>
                    </div>
                  </div>

                  {/* Features List */}
                  {isOpen && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                            {["Feature", "Key", "Visible", "Limit", "Status", "Actions"].map(h => (
                              <th key={h} className="px-6 py-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider first:pl-[72px]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                          {grouped[mKey].map(f => (
                            <tr key={f.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group/row">
                              <td className="px-6 py-3.5 pl-[72px]">
                                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{f.name}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{f.description || "No description provided."}</div>
                              </td>
                              <td className="px-6 py-3.5"><code className="text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">{f.key}</code></td>
                              <td className="px-6 py-3.5">
                                {f.isVisibleInPlanConfig ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">Enabled</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800/30 px-2 py-0.5 rounded-full border border-zinc-100 dark:border-zinc-800">Hidden</span>
                                )}
                              </td>
                              <td className="px-6 py-3.5">
                                {f.hasLimit ? (
                                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{f.limitType === "number" ? "Numeric" : "Boolean"}</span>
                                ) : (
                                  <span className="text-[11px] text-zinc-400">None</span>
                                )}
                              </td>
                              <td className="px-6 py-3.5">
                                <button
                                  onClick={() => handleToggle(f.id)}
                                  disabled={togglingId === f.id}
                                  className={`p-1 transition-colors ${f.isActive ? "text-emerald-500 hover:text-emerald-600" : "text-zinc-300 hover:text-zinc-400"}`}
                                >
                                  {f.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                </button>
                              </td>
                              <td className="px-6 py-3.5">
                                <button
                                  onClick={() => { setEditFeature(f); setModalOpen(true); }}
                                  className="p-2 text-zinc-400 hover:text-[var(--brand-primary)] hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-all opacity-0 group-hover/row:opacity-100"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
