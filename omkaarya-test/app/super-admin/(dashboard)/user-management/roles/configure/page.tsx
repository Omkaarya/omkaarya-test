"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { ArrowLeft, Save, Info, AlertTriangle, Loader2, Check, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────

type AccessLevel = "none" | "view" | "full";

type PermissionEntry = {
  featureKey: string;
  accessLevel: AccessLevel;
};

type Feature = {
  id: number;
  name: string;
  key: string;
  moduleKey: string;
  isActive: boolean;
};

type ModuleGroup = {
  moduleKey: string;
  module: string;
  features: Feature[];
};

// ── Module display name map ────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  devotee: "Devotee Management",
  pooja: "Pooja Management",
  donation: "Donations Management",
  inventory: "Inventory Management",
  finance: "Finance Module",
  pos: "POS — Counter Sales",
  system: "System & Site Features",
  settings: "Temple Settings",
};

function getModuleLabel(key: string): string {
  return MODULE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

// ── Access Level Pill ──────────────────────────────────────────────

const LEVEL_STYLES: Record<AccessLevel, string> = {
  none: "bg-white dark:bg-zinc-700 text-zinc-500 shadow-sm",
  view: "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm",
  full: "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm",
};

// ── Main Configure Page ────────────────────────────────────────────

function ConfigureContent() {
  const searchParams = useSearchParams();
  const roleId = searchParams.get("role");
  const roleName = searchParams.get("name") ?? "Selected Role";

  const [features, setFeatures] = useState<Feature[]>([]);
  const [permissions, setPermissions] = useState<Record<string, AccessLevel>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [featRes, permRes] = await Promise.all([
        fetch("/api/features"),
        roleId ? fetch(`/api/admin-roles/${roleId}/permissions`) : Promise.resolve(null),
      ]);

      const featJson = await featRes.json();
      if (featJson.success) setFeatures(featJson.data.filter((f: Feature) => f.isActive));

      if (permRes) {
        const permJson = await permRes.json();
        if (permJson.success) {
          const map: Record<string, AccessLevel> = {};
          permJson.data.forEach((p: PermissionEntry) => {
            map[p.featureKey] = p.accessLevel;
          });
          setPermissions(map);
        }
      }
    } catch {
      setError("Failed to load data. Check your database connection.");
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => { load(); }, [load]);

  const setPermLevel = (key: string, level: AccessLevel) => {
    setSaved(false);
    setPermissions((prev) => ({ ...prev, [key]: level }));
  };

  const handleSave = async () => {
    if (!roleId) return;
    setSaving(true);
    setError(null);
    try {
      const permsArray = features
        .filter((f) => permissions[f.key] && permissions[f.key] !== "none")
        .map((f) => ({ featureKey: f.key, accessLevel: permissions[f.key] }));

      const res = await fetch(`/api/admin-roles/${roleId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: permsArray }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to save permissions");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Group features by module
  const groups: ModuleGroup[] = [];
  const moduleMap = new Map<string, ModuleGroup>();
  features.forEach((f) => {
    if (!moduleMap.has(f.moduleKey)) {
      const g: ModuleGroup = { moduleKey: f.moduleKey, module: getModuleLabel(f.moduleKey), features: [] };
      moduleMap.set(f.moduleKey, g);
      groups.push(g);
    }
    moduleMap.get(f.moduleKey)!.features.push(f);
  });

  const totalGranted = features.filter((f) => permissions[f.key] && permissions[f.key] !== "none").length;

  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/super-admin/user-management/roles">
          <button className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Configure Permissions</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Setting access levels for:{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">"{roleName}"</span>
            {totalGranted > 0 && (
              <span className="ml-2 text-[11px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800 font-semibold">
                {totalGranted} granted
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave} className="gap-2 px-5" disabled={!roleId}>
            {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
        <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          <strong>Permissions Inheritance:</strong> Users assigned to "{roleName}" inherit these settings.
          A feature set to <strong>None</strong> is hidden from users regardless of their pricing plan.{" "}
          <strong>View Only</strong> gives read access; <strong>Full Access</strong> allows all operations.
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
          <span className="text-sm">Loading features…</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-zinc-400">
          <AlertCircle className="w-8 h-8 text-amber-400" />
          <span className="text-sm text-amber-600">No features found in the Feature Registry</span>
          <Link href="/super-admin/system-settings/feature-registry">
            <Button variant="outline" size="sm">Go to Feature Registry</Button>
          </Link>
        </div>
      ) : (
        /* Feature Matrix */
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.moduleKey} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              {/* Module Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{group.module}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    {group.features.filter((f) => permissions[f.key] && permissions[f.key] !== "none").length}/{group.features.length} granted
                  </span>
                  <button
                    onClick={() => {
                      const allFull = group.features.every((f) => permissions[f.key] === "full");
                      setSaved(false);
                      setPermissions((prev) => {
                        const next = { ...prev };
                        group.features.forEach((f) => { next[f.key] = allFull ? "none" : "full"; });
                        return next;
                      });
                    }}
                    className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider hover:underline"
                  >
                    {group.features.every((f) => permissions[f.key] === "full") ? "Clear All" : "Grant All"}
                  </button>
                </div>
              </div>

              {/* Feature Rows */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {group.features.map((feat) => {
                  const current: AccessLevel = permissions[feat.key] ?? "none";
                  return (
                    <div key={feat.key} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{feat.name}</div>
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">{feat.key}</div>
                      </div>
                      {/* Toggle Pills */}
                      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg shrink-0">
                        {(["none", "view", "full"] as AccessLevel[]).map((level) => (
                          <button
                            key={level}
                            onClick={() => setPermLevel(feat.key, level)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                              current === level
                                ? LEVEL_STYLES[level]
                                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                            }`}
                          >
                            {level === "none" ? "None" : level === "view" ? "View" : "Full"}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Warning */}
      {!loading && groups.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-[11px] text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Changes take effect on the user's next login session. Save before navigating away.
        </div>
      )}
    </div>
  );
}

export default function ConfigureRolePermissionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    }>
      <ConfigureContent />
    </Suspense>
  );
}
