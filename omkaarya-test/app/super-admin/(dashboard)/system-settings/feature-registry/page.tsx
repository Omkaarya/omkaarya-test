"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  X,
  Trash2,
} from "lucide-react";
// ── Types ──────────────────────────────────────────────────────────

type LimitType = "none" | "boolean" | "number";

type Feature = {
  id: number;
  name: string;
  key: string;
  desc: string;
  lt: LimitType;
  vis: boolean;
  active: boolean;
  plans: number;
  editOpen: boolean;
};

type Module = {
  key: string;
  name: string;
  desc: string;
  open: boolean;
  editOpen: boolean;
  features: Feature[];
};

const MODULE_OPTIONS = [
  "pooja", "donation", "inventory", "finance", "device", "staff",
  "pos", "events", "devotee", "notification", "domain", "integration",
  "pricing_tier",
];

// ── Helpers ─────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function ltPill(lt: LimitType) {
  if (lt === "number") return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">Number</span>;
  if (lt === "boolean") return <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">Boolean</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">None</span>;
}

function PlanDots({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1" title={`${count} of 3 plans`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`h-2.5 w-2.5 rounded-full ${i < count ? "bg-[var(--brand-primary)]" : "bg-zinc-200 dark:bg-zinc-700"}`} />
      ))}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onChange(); }} className={`relative h-[18px] w-8 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}>
      <span className={`absolute top-[2px] left-[2px] h-[14px] w-[14px] rounded-full bg-white transition-transform shadow-sm ${on ? "translate-x-[14px]" : ""}`} />
    </button>
  );
}

// ── Toast ────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 dark:bg-zinc-100 dark:text-zinc-900">
      {message}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────

export default function FeatureRegistryPage() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [toast, setToast] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [modFilter, setModFilter] = useState("");
  const [ltFilter, setLtFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [addFeatureOpen, setAddFeatureOpen] = useState(false);
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addL2ModKey, setAddL2ModKey] = useState<string | null>(null);

  // ── Add Feature form ────────────
  const [nfMod, setNfMod] = useState("");
  const [nfName, setNfName] = useState("");
  const [nfKey, setNfKey] = useState("");
  const [nfDesc, setNfDesc] = useState("");
  const [nfLt, setNfLt] = useState<LimitType>("none");
  const [nfVis, setNfVis] = useState(true);

  // ── Add Module form ─────────────
  const [nmName, setNmName] = useState("");
  const [nmKey, setNmKey] = useState("");
  const [nmDesc, setNmDesc] = useState("");

  // ── Quick Add L2 ────────────────
  const [quickName, setQuickName] = useState("");
  const [quickKey, setQuickKey] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }, []);

  // ── Stats ──────────────────────
  const totalFeatures = modules.reduce((s, m) => s + m.features.length, 0);
  const activeFeatures = modules.reduce((s, m) => s + m.features.filter((f) => f.active).length, 0);

  // ── Filter ─────────────────────
  const matchesFilter = (f: Feature, m: Module) => {
    if (searchQ) {
      const q = searchQ.toLowerCase();
      if (!f.name.toLowerCase().includes(q) && !f.key.includes(q) && !m.key.includes(q)) return false;
    }
    if (modFilter && m.key !== modFilter) return false;
    if (ltFilter && f.lt !== ltFilter) return false;
    if (activeFilter === "active" && !f.active) return false;
    if (activeFilter === "inactive" && f.active) return false;
    return true;
  };

  const visibleModules = modules.filter((m) => {
    if (!searchQ && !modFilter && !ltFilter && !activeFilter) return true;
    return m.features.some((f) => matchesFilter(f, m));
  });

  // ── Module actions ─────────────
  const toggleMod = (key: string) => {
    setModules((prev) => prev.map((m) => m.key === key ? { ...m, open: !m.open } : m));
  };
  const expandAll = () => setModules((prev) => prev.map((m) => ({ ...m, open: true })));
  const collapseAll = () => setModules((prev) => prev.map((m) => ({ ...m, open: false })));
  const toggleModEdit = (key: string) => {
    setModules((prev) => prev.map((m) => m.key === key ? { ...m, editOpen: !m.editOpen, open: true } : m));
  };
  const updateModField = (key: string, field: "name" | "desc", value: string) => {
    setModules((prev) => prev.map((m) => m.key === key ? { ...m, [field]: value } : m));
  };
  const saveModEdit = (key: string) => {
    setModules((prev) => prev.map((m) => m.key === key ? { ...m, editOpen: false } : m));
    showToast("Module saved!");
  };

  // ── Feature actions ────────────
  const toggleActive = (id: number) => {
    setModules((prev) => prev.map((m) => ({
      ...m,
      features: m.features.map((f) => f.id === id ? { ...f, active: !f.active } : f),
    })));
    const feat = modules.flatMap((m) => m.features).find((f) => f.id === id);
    showToast(`${feat?.name} ${feat?.active ? "deactivated" : "activated"}`);
  };

  const toggleL2Edit = (id: number) => {
    setModules((prev) => prev.map((m) => ({
      ...m,
      features: m.features.map((f) => f.id === id ? { ...f, editOpen: !f.editOpen } : f),
    })));
  };

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
        const data = await res.json();
        if (Array.isArray(data)) {
          setFeatures(data);
        } else {
          setLoadError("Unexpected response from server.");
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setLoadError(err.error || `Failed to load features (${res.status})`);
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
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Failed to save feature");
    }
    setModules((prev) => prev.map((m) => ({
      ...m,
      features: m.features.filter((f) => f.id !== id),
    })));
    showToast("Feature deleted");
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

  // ── Add Module ─────────────────
  const addModule = () => {
    if (!nmName.trim() || !nmKey.trim()) { showToast("Fill module name and key"); return; }
    setModules((prev) => [...prev, { key: nmKey, name: nmName, desc: nmDesc, open: true, editOpen: false, features: [] }]);
    setAddModuleOpen(false);
    setNmName(""); setNmKey(""); setNmDesc("");
    showToast(`Module "${nmName}" added!`);
  };

  // ── Quick Add L2 ───────────────
  const quickAddFeature = (modKey: string) => {
    if (!quickName.trim()) { showToast("Enter a feature name"); return; }
    const key = quickKey.trim() || slugify(quickName);
    const newFeat: Feature = { id: nextId++, name: quickName, key, desc: "", lt: "none", vis: true, active: true, plans: 0, editOpen: false };
    setModules((prev) => prev.map((m) => m.key === modKey ? { ...m, features: [...m.features, newFeat] } : m));
    setQuickName(""); setQuickKey("");
    setAddL2ModKey(null);
    showToast(`Feature "${quickName}" added to ${modules.find((m) => m.key === modKey)?.name}`);
  };

  // ── Open add feature for specific module ───
  const openAddForMod = (modKey: string) => {
    setNfMod(modKey);
    setAddFeatureOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))]">
      {/* ─── Page Header ────────────────────────────────────── */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Feature Registry{" "}
            <span className="ml-2 text-sm font-normal text-zinc-400">
              {modules.length} modules · {totalFeatures} features
            </span>
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            All system features grouped by module — configurable per pricing plan · DB-driven · Never hardcoded in frontend
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAddModuleOpen(!addModuleOpen)} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Plus className="h-3.5 w-3.5" /> Add Module
          </button>
          <button type="button" onClick={() => setAddFeatureOpen(!addFeatureOpen)} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--brand-primary-hover)]">
            <Plus className="h-3.5 w-3.5" /> Add Feature
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────── */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        {[
          { val: modules.length, lbl: "Modules (L1)", sub: "groups of features" },
          { val: totalFeatures, lbl: "Features (L2)", sub: "individual feature keys" },
          { val: activeFeatures, lbl: "Active features", sub: "visible to plan config" },
          { val: 3, lbl: "Pricing plans", sub: "using this registry" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{s.val}</div>
            <div className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.lbl}</div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Info Banner ─────────────────────────────────────── */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 leading-relaxed dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <strong>L1 = Module</strong> (e.g. Pooja Management) · <strong>L2 = Feature</strong> (e.g. pooja_booking_online). Click ▸ on any module to expand its features. Feature keys are <strong>permanent</strong> once saved — used across sidebar, route protection, and API enforcement in the tenant portal.
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
          <div className="mb-3 grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Module (L1) *</label>
              <select value={nfMod} onChange={(e) => setNfMod(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                <option value="">Select module...</option>
                {modules.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Feature name *</label>
              <input value={nfName} onChange={(e) => { setNfName(e.target.value); setNfKey(slugify(e.target.value)); }} placeholder="e.g. Archana Ticket Printing" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Feature key * <span className="text-zinc-300">(permanent)</span></label>
              <input value={nfKey} onChange={(e) => setNfKey(e.target.value)} placeholder="e.g. archana_ticket_printing" className="w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description</label>
              <input value={nfDesc} onChange={(e) => setNfDesc(e.target.value)} placeholder="What does this feature enable in tenant portal?" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Limit type</label>
              <select value={nfLt} onChange={(e) => setNfLt(e.target.value as LimitType)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                <option value="none">None (on/off toggle)</option>
                <option value="boolean">Boolean (sub-option)</option>
                <option value="number">Number (has limit)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Show in plan config?</label>
              <select value={nfVis ? "true" : "false"} onChange={(e) => setNfVis(e.target.value === "true")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                <option value="true">Yes — visible in Create Plan</option>
                <option value="false">No — internal only</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addFeature} className="rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)]">Save feature</button>
            <button type="button" onClick={() => setAddFeatureOpen(false)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-500 hover:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      {/* ─── Add Module Panel ────────────────────────────────── */}
      {addModuleOpen && (
        <div className="mb-4 rounded-xl border-2 border-[var(--brand-primary)] bg-white p-5 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--brand-primary)]">Add new module (L1)</span>
            <button type="button" onClick={() => setAddModuleOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Module name *</label>
              <input value={nmName} onChange={(e) => { setNmName(e.target.value); setNmKey(slugify(e.target.value)); }} placeholder="e.g. Events Management" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Module key *</label>
              <input value={nmKey} onChange={(e) => setNmKey(e.target.value)} placeholder="e.g. events" className="w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description</label>
              <input value={nmDesc} onChange={(e) => setNmDesc(e.target.value)} placeholder="What this module covers" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addModule} className="rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)]">Save module</button>
            <button type="button" onClick={() => setAddModuleOpen(false)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-500 hover:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      {/* ─── Toolbar ─────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search features or keys..." className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
        <select value={modFilter} onChange={(e) => setModFilter(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <option value="">All modules</option>
          {modules.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
        </select>
        <select value={ltFilter} onChange={(e) => setLtFilter(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <option value="">All limit types</option>
          <option value="none">None</option>
          <option value="boolean">Boolean</option>
          <option value="number">Number</option>
        </select>
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="ml-auto flex gap-1.5">
          <button type="button" onClick={expandAll} className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-[11px] text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] dark:border-zinc-700">Expand all</button>
          <button type="button" onClick={collapseAll} className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-[11px] text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] dark:border-zinc-700">Collapse all</button>
        </div>
      </div>

      {/* ─── Registry Table ──────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Table Header */}
        <div className="grid grid-cols-[44px_1fr_44px] items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
          <div />
          <div className="grid grid-cols-[200px_110px_90px_90px_70px_70px_110px] items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Feature / Module</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Module key</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Limit type</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Plan config</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Plans</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Actions</span>
          </div>
          <div />
        </div>

        {/* Module Rows */}
        {visibleModules.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-400">No features match your filters</div>
        ) : (
          visibleModules.map((m) => {
            const activeCount = m.features.filter((f) => f.active).length;
            const visFeats = (searchQ || modFilter || ltFilter || activeFilter) ? m.features.filter((f) => matchesFilter(f, m)) : m.features;
            return (
              <div key={m.key}>
                {/* L1 Module Row */}
                <div
                  className={`grid cursor-pointer grid-cols-[44px_1fr_44px] items-center border-b transition-colors ${m.open ? "border-[#ffd5c4] bg-[#fff4ef] dark:border-orange-900/30 dark:bg-orange-950/10" : "border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/30"}`}
                  onClick={() => toggleMod(m.key)}
                >
                  <div className="flex items-center justify-center py-3">
                    <button type="button" className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-colors ${m.open ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"}`}>
                      {m.open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-[200px_110px_90px_90px_70px_70px_110px] items-center gap-2 py-3">
                    <div>
                      <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50">{m.name}</div>
                      <div className="text-[10px] text-zinc-400">{activeCount}/{m.features.length} features active</div>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{m.key}</span>
                    <span className="text-xs text-zinc-300">—</span>
                    <span className="text-xs text-zinc-300">—</span>
                    <span className="text-xs text-zinc-300">—</span>
                    <span className="text-xs text-zinc-300">—</span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => openAddForMod(m.key)} className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] dark:border-zinc-700">+ Feature</button>
                      <button type="button" onClick={() => toggleModEdit(m.key)} className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] dark:border-zinc-700">Edit</button>
                    </div>
                  </div>
                  <div />
                </div>

                {/* L1 Edit Panel */}
                {m.editOpen && (
                  <div className="border-b border-zinc-100 bg-[#fdfcfb] px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="mb-3 grid grid-cols-4 gap-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Module name</label>
                        <input value={m.name} onChange={(e) => updateModField(m.key, "name", e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Module key (read-only)</label>
                        <input value={m.key} readOnly className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-400 outline-none dark:border-zinc-700 dark:bg-zinc-800" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description</label>
                        <input value={m.desc} onChange={(e) => updateModField(m.key, "desc", e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</label>
                        <select className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => saveModEdit(m.key)} className="rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)]">Save changes</button>
                      <button type="button" onClick={() => toggleModEdit(m.key)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">Cancel</button>
                    </div>
                  </div>
                )}

                {/* L2 Features Body */}
                {m.open && (
                  <div className="border-b border-zinc-200 bg-[#fdfcfb] dark:border-zinc-800 dark:bg-zinc-900/30">
                    {visFeats.map((f) => (
                      <div key={f.id}>
                        {/* L2 Feature Row */}
                        <div className="grid grid-cols-[44px_1fr_44px] items-center border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/20" onClick={() => toggleL2Edit(f.id)}>
                          <div className="flex items-center justify-center py-2.5">
                            <div className="mr-0 flex items-center gap-1.5">
                              <div className="h-8 w-[3px] rounded bg-[var(--brand-primary)] opacity-25" />
                              <div className="h-1.5 w-1.5 rounded-full bg-[#ffd5c4]" />
                            </div>
                          </div>
                          <div className="grid grid-cols-[200px_110px_90px_90px_70px_70px_110px] items-center gap-2 py-2.5">
                            <div>
                              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{f.name}</div>
                              <div className="font-mono text-[10px] text-zinc-400">{f.key}</div>
                            </div>
                            <span className="font-mono text-[11px] text-zinc-400">{m.key}</span>
                            <div>{ltPill(f.lt)}</div>
                            <div>{f.vis ? <span className="text-sm font-bold text-emerald-500">✓</span> : <span className="text-zinc-300">—</span>}</div>
                            <Toggle on={f.active} onChange={() => toggleActive(f.id)} />
                            <PlanDots count={f.plans} />
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => toggleL2Edit(f.id)} className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] dark:border-zinc-700">Edit</button>
                              <button type="button" onClick={() => deleteFeature(f.id)} className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 hover:border-red-400 hover:text-red-500 dark:border-zinc-700">Del</button>
                            </div>
                          </div>
                          <div />
                        </div>

                        {/* L2 Inline Edit */}
                        {f.editOpen && (
                          <L2EditRow feature={f} moduleKey={m.key} onSave={saveL2Edit} onCancel={() => toggleL2Edit(f.id)} />
                        )}
                      </div>
                    ))}

                    {/* Quick Add Row */}
                    {addL2ModKey === m.key ? (
                      <div className="flex items-center gap-2 border-t border-dashed border-zinc-200 bg-[#fdfcfb] px-5 py-2.5 pl-[68px] dark:border-zinc-700 dark:bg-zinc-900/30">
                        <div className="h-8 w-[3px] rounded bg-[var(--brand-primary)] opacity-15" />
                        <div className="h-1.5 w-1.5 rounded-full bg-[#ffd5c4] opacity-40" />
                        <input value={quickName} onChange={(e) => { setQuickName(e.target.value); setQuickKey(slugify(e.target.value)); }} placeholder="New feature name..." className="flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                        <input value={quickKey} onChange={(e) => setQuickKey(e.target.value)} placeholder="feature_key..." className="max-w-[160px] rounded-md border border-zinc-200 px-3 py-1.5 font-mono text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                        <button type="button" onClick={() => quickAddFeature(m.key)} className="rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-white">Add</button>
                        <button type="button" onClick={() => { setAddL2ModKey(null); setQuickName(""); setQuickKey(""); }} className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-700">Cancel</button>
                      </div>
                    ) : (
                      <div className="border-t border-dashed border-zinc-200 px-5 py-2.5 pl-[68px] dark:border-zinc-700">
                        <button type="button" onClick={() => setAddL2ModKey(m.key)} className="rounded-md border border-[#ffd5c4] bg-[#fff4ef] px-3 py-1.5 text-xs font-medium text-[var(--brand-primary)] hover:bg-[#ffeee4] dark:border-orange-900/30 dark:bg-orange-950/10">
                          + Add feature to {m.name}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="py-5 text-center text-[10px] text-zinc-400">
        2024–2026 © Om Kaaryaa. All Rights Reserved. · Powered by Pepulux. All Rights Reserved.
      </div>

      <Toast message={toast} />
    </div>
  );
}

// ── L2 Edit Row (extracted) ─────────────────────────────────────────

function L2EditRow({ feature, moduleKey, onSave, onCancel }: {
  feature: Feature;
  moduleKey: string;
  onSave: (id: number, updates: Partial<Feature>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(feature.name);
  const [lt, setLt] = useState(feature.lt);
  const [desc, setDesc] = useState(feature.desc);
  const [vis, setVis] = useState(feature.vis);

  return (
    <div className="border-b border-zinc-100 bg-[#fff8f5] px-5 py-3 pl-[68px] dark:border-zinc-800 dark:bg-orange-950/5" onClick={(e) => e.stopPropagation()}>
      <div className="mb-3 grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Feature name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Feature key (read-only)</label>
          <input value={feature.key} readOnly className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-400 outline-none dark:border-zinc-700 dark:bg-zinc-800" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Limit type</label>
          <select value={lt} onChange={(e) => setLt(e.target.value as LimitType)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            <option value="none">None</option>
            <option value="boolean">Boolean</option>
            <option value="number">Number</option>
          </select>
        </div>
      </div>
      <div className="mb-3 grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Visible in plan config</label>
          <select value={vis ? "true" : "false"} onChange={(e) => setVis(e.target.value === "true")} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onSave(feature.id, { name, lt, desc, vis })} className="rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)]">Save</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">Cancel</button>
        <span className="ml-2 text-[11px] text-[var(--brand-primary)]">⚠ Feature key is permanent</span>
      </div>
    </div>
  );
}
