"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Monitor, CheckCircle2, PauseCircle, Plus, Search, X, Info, ToggleLeft, ToggleRight, Loader2, AlertCircle,
} from "lucide-react";
import {
  fetchTempleAdminJson,
  type InventoryStore,
  type PosRegister,
} from "@/lib/temple-admin-api";

export default function RegistersPage() {
  const [registers, setRegisters] = useState<PosRegister[]>([]);
  const [stores, setStores] = useState<InventoryStore[]>([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [regs, sts] = await Promise.all([
        fetchTempleAdminJson<{ items: PosRegister[] }>("/api/temple-admin/pos/registers"),
        fetchTempleAdminJson<{ items: InventoryStore[] }>("/api/temple-admin/inventory/stores"),
      ]);
      setRegisters(regs.items ?? []);
      setStores(sts.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load registers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const activeCount = registers.filter((r) => r.is_active).length;
  const inactiveCount = registers.length - activeCount;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registers;
    return registers.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (r.store_name ?? "").toLowerCase().includes(q)
    );
  }, [registers, search]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            Sales / POS / Registers
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mt-1">POS Registers</h1>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> New Register
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat title="Total Registers" value={registers.length} Icon={Monitor} bg="bg-blue-50 text-blue-600 dark:bg-blue-950/20" />
        <Stat title="Active" value={activeCount} Icon={CheckCircle2} bg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" valueColor="text-emerald-600" />
        <Stat title="Inactive" value={inactiveCount} Icon={PauseCircle} bg="bg-zinc-100 text-zinc-500 dark:bg-zinc-800" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or code…"
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Name</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Code</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Store</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-[var(--text-tertiary)]">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-[var(--text-tertiary)]">
                    {registers.length === 0 ? "No registers configured yet." : "No registers match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-[var(--foreground)]">{reg.name}</td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)] font-mono text-xs">{reg.code}</td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)] text-xs">{reg.store_name ?? "—"}</td>
                    <td className="px-6 py-4">
                      {reg.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 text-zinc-500 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          INACTIVE
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawerOpen && (
        <RegisterDrawer
          stores={stores}
          onClose={() => setDrawerOpen(false)}
          onSaved={async () => {
            setDrawerOpen(false);
            await reload();
          }}
        />
      )}
    </div>
  );
}

function Stat({ title, value, Icon, bg, valueColor }: { title: string; value: number; Icon: React.ElementType; bg: string; valueColor?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xs font-medium text-[var(--text-tertiary)]">{title}</h3>
        <div className={`p-1.5 rounded-lg ${bg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor ?? "text-[var(--foreground)]"}`}>{value}</p>
    </div>
  );
}

function RegisterDrawer({ stores, onClose, onSaved }: { stores: InventoryStore[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [storeId, setStoreId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) {
      setError("Name and code are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/pos/registers", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          storeId: storeId || null,
          isActive,
        }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save register.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Add New Register</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              Register code must be unique. Optionally link to a store so inventory consumption is attributed correctly.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1">
                Register Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Counter 3"
                className="mt-1.5 w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1">
                Register Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. HQ-C3"
                className="mt-1.5 w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)]">Linked store</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="mt-1.5 w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors appearance-none"
              >
                <option value="">No linked store</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Active</p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Allow sessions to be opened on this register</p>
            </div>
            <button onClick={() => setIsActive(!isActive)} className="relative">
              {isActive ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-[var(--foreground)] hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" /> {saving ? "Saving…" : "Create Register"}
          </button>
        </div>
      </div>
    </>
  );
}
