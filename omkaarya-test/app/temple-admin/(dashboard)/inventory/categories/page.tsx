"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { fetchTempleAdminJson, type InventoryCategory } from "@/lib/temple-admin-api";

type CategoryNode = InventoryCategory & { children: InventoryCategory[] };

function buildTree(rows: InventoryCategory[]): CategoryNode[] {
  const byParent = new Map<string | null, InventoryCategory[]>();
  for (const r of rows) {
    const list = byParent.get(r.parent_id) ?? [];
    list.push(r);
    byParent.set(r.parent_id, list);
  }
  const roots = byParent.get(null) ?? [];
  return roots.map((r) => ({ ...r, children: byParent.get(r.id) ?? [] }));
}

export default function CategoriesPage() {
  const [items, setItems] = useState<InventoryCategory[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addingTo, setAddingTo] = useState<string | "root" | null>(null);
  const [addInput, setAddInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<{ items: InventoryCategory[] }>(
        "/api/temple-admin/inventory/categories"
      );
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load categories.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const tree = useMemo(() => buildTree(items), [items]);

  const create = async (name: string, parentId: string | null) => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/inventory/categories", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), parentId }),
      });
      await reload();
      setAddingTo(null);
      setAddInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save category.");
    } finally {
      setSaving(false);
    }
  };

  const rename = async (id: string, name: string) => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetchTempleAdminJson(`/api/temple-admin/inventory/categories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      setEditingId(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rename category.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setSaving(true);
    try {
      await fetchTempleAdminJson(`/api/temple-admin/inventory/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Categories</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage product categories and sub-categories. Saved live to the temple operational database.
          </p>
        </div>
        <button
          onClick={() => {
            setAddingTo("root");
            setAddInput("");
          }}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-60"
        >
          <Plus className="w-3.5 h-3.5" />
          Add category
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading categories…
          </div>
        ) : (
          <>
            {addingTo === "root" && (
              <div className="flex items-center gap-2 py-3 px-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30">
                <input
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && create(addInput, null)}
                  placeholder="New category name…"
                  autoFocus
                  className="flex-1 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 outline-none focus:border-[var(--brand-primary)]"
                />
                <button
                  onClick={() => create(addInput, null)}
                  disabled={saving}
                  className="px-2.5 py-1.5 rounded-md bg-[var(--brand-primary)] text-[11px] font-semibold text-white disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  onClick={() => setAddingTo(null)}
                  className="px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            )}

            {tree.length === 0 && addingTo !== "root" ? (
              <div className="text-center py-12 text-xs text-zinc-500">No categories yet. Add one to get started.</div>
            ) : (
              tree.map((cat) => (
                <div key={cat.id}>
                  <div
                    className="flex items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => setExpanded((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                  >
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-[5px] border flex items-center justify-center mr-2.5 shrink-0 ${
                        expanded[cat.id]
                          ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500"
                      }`}
                    >
                      {expanded[cat.id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      {editingId === cat.id ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.key === "Enter" && rename(cat.id, editingName)}
                          autoFocus
                          className="text-[13px] font-bold border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 bg-white dark:bg-zinc-900 outline-none"
                        />
                      ) : (
                        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</div>
                      )}
                      {cat.description && (
                        <div className="text-[10px] text-zinc-400 mt-0.5">{cat.description}</div>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-lg mr-3">
                      {cat.children.length} sub
                    </span>
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => rename(cat.id, editingName)}
                            className="px-2 py-1 rounded-md bg-[var(--brand-primary)] text-[11px] font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditingName(cat.name);
                            }}
                            className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => remove(cat.id)}
                            className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 hover:border-red-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {expanded[cat.id] &&
                    cat.children.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center py-2.5 pl-[52px] pr-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30"
                      >
                        <div className="w-[7px] h-[7px] rounded-full bg-[var(--brand-primary)] opacity-40 mr-2.5 shrink-0" />
                        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex-1">{sub.name}</div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => remove(sub.id)}
                            className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 hover:border-red-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                  {expanded[cat.id] && addingTo === cat.id && (
                    <div className="flex items-center gap-2 py-2 pl-[52px] pr-4 bg-zinc-50/30">
                      <input
                        value={addInput}
                        onChange={(e) => setAddInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && create(addInput, cat.id)}
                        placeholder="New sub-category…"
                        autoFocus
                        className="flex-1 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 outline-none focus:border-[var(--brand-primary)]"
                      />
                      <button
                        onClick={() => create(addInput, cat.id)}
                        disabled={saving}
                        className="px-2.5 py-1.5 rounded-md bg-[var(--brand-primary)] text-[11px] font-semibold text-white disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setAddingTo(null)}
                        className="px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {expanded[cat.id] && addingTo !== cat.id && (
                    <div className="pl-[52px] pr-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          setAddingTo(cat.id);
                          setAddInput("");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-orange-200 rounded-md text-[var(--brand-primary)] bg-orange-50 hover:bg-orange-100 font-semibold"
                      >
                        <Plus className="w-3 h-3" /> Add sub-category
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
