"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Info, Trash2, X, Loader2, AlertCircle, Package } from "lucide-react";
import {
  fetchTempleAdminJson,
  type InventoryBom,
  type InventoryBomLine,
  type PoojaSeva,
} from "@/lib/temple-admin-api";
import type { TempleInventoryProduct } from "@/lib/temple-inventory-api";

type LineDraft = { productId: string; quantity: string; isOptional: boolean; notes: string };

function NewBomDrawer({
  sevas,
  products,
  onClose,
  onCreated,
}: {
  sevas: PoojaSeva[];
  products: TempleInventoryProduct[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [poojaSevaId, setPoojaSevaId] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ productId: "", quantity: "", isOptional: false, notes: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim() && lines.some((l) => l.productId && Number(l.quantity) > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/inventory/boms", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          poojaSevaId: poojaSevaId || null,
          description: description.trim() || null,
          isActive: true,
          lines: lines
            .filter((l) => l.productId && Number(l.quantity) > 0)
            .map((l) => ({
              productId: l.productId,
              quantity: Number(l.quantity),
              isOptional: l.isOptional,
              notes: l.notes.trim() || null,
            })),
        }),
      });
      await onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save BOM.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold">New BOM</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Materials needed per pooja</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rudrabhishekam BOM"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Linked Pooja / Seva</label>
            <select
              value={poojaSevaId}
              onChange={(e) => setPoojaSevaId(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none"
            >
              <option value="">(Optional) Link to a seva</option>
              {sevas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Items *</label>
            {lines.map((ln, idx) => (
              <div key={idx} className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={ln.productId}
                    onChange={(e) =>
                      setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, productId: e.target.value } : l)))
                    }
                    className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm outline-none"
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={ln.quantity}
                    onChange={(e) =>
                      setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, quantity: e.target.value } : l)))
                    }
                    placeholder="Qty"
                    className="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-500"
                    disabled={lines.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ln.isOptional}
                      onChange={(e) =>
                        setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, isOptional: e.target.checked } : l)))
                      }
                      className="w-3.5 h-3.5 accent-[var(--brand-primary)]"
                    />
                    Optional item
                  </label>
                </div>
                <input
                  value={ln.notes}
                  onChange={(e) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, notes: e.target.value } : l)))}
                  placeholder="Notes (optional)"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs outline-none"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, { productId: "", quantity: "", isOptional: false, notes: "" }])}
              className="text-xs font-semibold text-[var(--brand-primary)] inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add another item
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={onClose} className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 rounded-xl bg-[var(--brand-primary)] py-2.5 text-sm font-bold text-white disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save BOM
          </button>
        </div>
      </div>
    </div>
  );
}

function BomLines({ bomId }: { bomId: string }) {
  const [lines, setLines] = useState<InventoryBomLine[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTempleAdminJson<{ items: InventoryBomLine[] }>(
          `/api/temple-admin/inventory/boms/${encodeURIComponent(bomId)}/lines`
        );
        if (!cancelled) setLines(data.items ?? []);
      } catch {
        if (!cancelled) setLines([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bomId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 py-3">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
      </div>
    );
  }
  if (!lines || lines.length === 0) {
    return <div className="text-xs text-zinc-500 py-3">No items in this BOM.</div>;
  }
  return (
    <div className="px-4">
      {lines.map((line) => (
        <div
          key={line.id}
          className="flex items-center gap-2.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
        >
          <div className="w-[30px] h-[30px] rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{line.product_name ?? "—"}</div>
            {line.notes && <div className="text-[10px] text-zinc-400">{line.notes}</div>}
          </div>
          <div className="text-xs font-bold text-zinc-700">
            {line.quantity} <span className="text-[10px] text-zinc-400 font-normal">{line.is_optional ? "(optional)" : ""}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PoojaBOMPage() {
  const [boms, setBoms] = useState<InventoryBom[]>([]);
  const [products, setProducts] = useState<TempleInventoryProduct[]>([]);
  const [sevas, setSevas] = useState<PoojaSeva[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bm, pr, sv] = await Promise.all([
        fetchTempleAdminJson<{ items: InventoryBom[] }>("/api/temple-admin/inventory/boms"),
        fetchTempleAdminJson<{ products: TempleInventoryProduct[] }>("/api/temple-admin/inventory/products"),
        fetchTempleAdminJson<{ items: PoojaSeva[] }>("/api/temple-admin/master/pooja-sevas"),
      ]);
      setBoms(bm.items ?? []);
      setProducts(pr.products ?? []);
      setSevas(sv.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load BOMs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this BOM?")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/inventory/boms/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete BOM.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Pooja Bill of Materials (BOM)</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Map which inventory items are needed per pooja type. Saved live to the temple operational database.
          </p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New BOM
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-2.5 items-start bg-blue-50 dark:bg-blue-950/30 border-[1.5px] border-blue-200 dark:border-blue-800/50 rounded-xl p-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
        <div>
          <div className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">How BOM works</div>
          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            BOMs define the materials required per pooja. Once linked to bookings (Phase 3), stock will be deducted
            automatically when a pooja is confirmed.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading BOMs…
        </div>
      ) : boms.length === 0 ? (
        <div className="text-center py-16 text-sm text-zinc-500 bg-white rounded-xl border border-zinc-200">
          No BOMs defined yet. Create one to start mapping pooja materials.
        </div>
      ) : (
        boms.map((bom) => (
          <div key={bom.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{bom.name}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {bom.pooja_seva_name ? `Pooja: ${bom.pooja_seva_name}` : "Unlinked"}
                  {bom.description ? ` · ${bom.description}` : ""}
                </div>
              </div>
              <button
                onClick={() => handleDelete(bom.id)}
                className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 hover:border-red-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <BomLines bomId={bom.id} />
          </div>
        ))
      )}

      {showDrawer && (
        <NewBomDrawer sevas={sevas} products={products} onClose={() => setShowDrawer(false)} onCreated={reload} />
      )}
    </div>
  );
}
