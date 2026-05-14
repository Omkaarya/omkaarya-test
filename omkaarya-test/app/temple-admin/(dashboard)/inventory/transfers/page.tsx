"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, ArrowRight, SendHorizonal, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import {
  fetchTempleAdminJson,
  type InventoryStore,
  type InventoryTransfer,
} from "@/lib/temple-admin-api";
import type { TempleInventoryProduct } from "@/lib/temple-inventory-api";

const STATUS_STYLE: Record<InventoryTransfer["status"], string> = {
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  dispatched: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

type LineDraft = { productId: string; quantity: string };

function NewTransferDrawer({
  stores,
  products,
  onClose,
  onCreated,
}: {
  stores: InventoryStore[];
  products: TempleInventoryProduct[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [reference, setReference] = useState(`TRF-${Date.now().toString().slice(-8)}`);
  const [fromStoreId, setFromStoreId] = useState("");
  const [toStoreId, setToStoreId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ productId: "", quantity: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave =
    reference.trim() &&
    fromStoreId &&
    toStoreId &&
    fromStoreId !== toStoreId &&
    lines.some((l) => l.productId && Number(l.quantity) > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/inventory/transfers", {
        method: "POST",
        body: JSON.stringify({
          reference: reference.trim(),
          fromStoreId,
          toStoreId,
          notes: notes.trim() || null,
          lines: lines
            .filter((l) => l.productId && Number(l.quantity) > 0)
            .map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
        }),
      });
      await onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save transfer.");
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
            <h2 className="text-base font-bold">New Stock Transfer</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Move items between stores</p>
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
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Reference *</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">From Store *</label>
              <select
                value={fromStoreId}
                onChange={(e) => setFromStoreId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)]"
              >
                <option value="">Select…</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">To Store *</label>
              <select
                value={toStoreId}
                onChange={(e) => setToStoreId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)]"
              >
                <option value="">Select…</option>
                {stores
                  .filter((s) => s.id !== fromStoreId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Items *</label>
            {lines.map((ln, idx) => (
              <div key={idx} className="flex gap-2">
                <select
                  value={ln.productId}
                  onChange={(e) =>
                    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, productId: e.target.value } : l)))
                  }
                  className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none"
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
                  min={1}
                  value={ln.quantity}
                  onChange={(e) =>
                    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, quantity: e.target.value } : l)))
                  }
                  placeholder="Qty"
                  className="w-24 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none"
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
            ))}
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, { productId: "", quantity: "" }])}
              className="text-xs font-semibold text-[var(--brand-primary)] inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add another item
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-sm font-semibold text-zinc-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 rounded-xl bg-[var(--brand-primary)] py-2.5 text-sm font-bold text-white disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [stores, setStores] = useState<InventoryStore[]>([]);
  const [products, setProducts] = useState<TempleInventoryProduct[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tr, st, pr] = await Promise.all([
        fetchTempleAdminJson<{ items: InventoryTransfer[] }>("/api/temple-admin/inventory/transfers"),
        fetchTempleAdminJson<{ items: InventoryStore[] }>("/api/temple-admin/inventory/stores"),
        fetchTempleAdminJson<{ products: TempleInventoryProduct[] }>("/api/temple-admin/inventory/products"),
      ]);
      setTransfers(tr.items ?? []);
      setStores(st.items ?? []);
      setProducts(pr.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load transfers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transfers.filter((t) => {
      const matchSearch =
        !q ||
        t.reference.toLowerCase().includes(q) ||
        (t.from_store_name ?? "").toLowerCase().includes(q) ||
        (t.to_store_name ?? "").toLowerCase().includes(q);
      const matchStatus = filterStatus === "All" || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [transfers, search, filterStatus]);

  const stats = useMemo(
    () => [
      { label: "Total Transfers", value: transfers.length, color: "text-zinc-900 dark:text-zinc-50" },
      { label: "Dispatched", value: transfers.filter((t) => t.status === "dispatched").length, color: "text-amber-600" },
      { label: "Received", value: transfers.filter((t) => t.status === "received").length, color: "text-emerald-600" },
      { label: "Drafts", value: transfers.filter((t) => t.status === "draft").length, color: "text-zinc-600" },
    ],
    [transfers]
  );

  const transition = async (id: string, action: "dispatch" | "receive" | "cancel") => {
    try {
      await fetchTempleAdminJson(
        `/api/temple-admin/inventory/transfers/${encodeURIComponent(id)}/transition`,
        { method: "POST", body: JSON.stringify({ action }) }
      );
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update transfer.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Stock Transfers</h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Move pooja items between temple stores. Stock ledger entries are written automatically.
          </p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all"
        >
          <Plus className="w-4 h-4" /> New Transfer
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs font-medium text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, source, destination…"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 outline-none focus:ring-2 ring-[var(--brand-primary)]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 outline-none"
          >
            <option value="All">All statuses</option>
            <option value="draft">Draft</option>
            <option value="dispatched">Dispatched</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <p className="px-5 py-3 text-xs text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
          Showing {filtered.length} of {transfers.length} transfers
        </p>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Source → Destination</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{t.reference}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{t.from_store_name ?? "—"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{t.to_store_name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[t.status]}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.status === "draft" && (
                          <button
                            onClick={() => transition(t.id, "dispatch")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100"
                          >
                            <SendHorizonal className="w-3.5 h-3.5" /> Dispatch
                          </button>
                        )}
                        {t.status === "dispatched" && (
                          <button
                            onClick={() => transition(t.id, "receive")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Receive
                          </button>
                        )}
                        {(t.status === "draft" || t.status === "dispatched") && (
                          <button
                            onClick={() => transition(t.id, "cancel")}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-zinc-400">
                      No transfers yet. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showDrawer && (
        <NewTransferDrawer
          stores={stores}
          products={products}
          onClose={() => setShowDrawer(false)}
          onCreated={reload}
        />
      )}
    </div>
  );
}
