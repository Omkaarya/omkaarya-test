"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PackageCheck,
  HandHeart,
  RotateCcw,
  ShoppingCart,
  Gift,
  AlertTriangle,
  Undo2,
  SearchCheck,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";
import {
  fetchTempleAdminJson,
  type InventoryStockLedgerEntry,
  type InventoryStore,
} from "@/lib/temple-admin-api";
import type { TempleInventoryProduct } from "@/lib/temple-inventory-api";

type AdjUiKind =
  | "received"
  | "pooja-use"
  | "ritual-return"
  | "counter-sale"
  | "donation-in"
  | "damaged"
  | "refund-stock"
  | "correction";

const ADJ_TYPES: {
  id: AdjUiKind;
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
  desc: string;
  cls: string;
  movementKind: "purchase_in" | "consumption" | "return" | "sale_out" | "open_balance" | "wastage" | "adjustment";
  signHint: 1 | -1;
}[] = [
  { id: "received", Icon: PackageCheck, name: "Stock received", desc: "New delivery from supplier", cls: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30", movementKind: "purchase_in", signHint: 1 },
  { id: "pooja-use", Icon: HandHeart, name: "Used in pooja", desc: "Issued to priest for pooja", cls: "border-blue-500 bg-blue-50 dark:bg-blue-950/30", movementKind: "consumption", signHint: -1 },
  { id: "ritual-return", Icon: RotateCcw, name: "Returned from pooja", desc: "Priest returns unused items", cls: "border-purple-500 bg-purple-50 dark:bg-purple-950/30", movementKind: "return", signHint: 1 },
  { id: "counter-sale", Icon: ShoppingCart, name: "Counter sale", desc: "Sold via POS counter", cls: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30", movementKind: "sale_out", signHint: -1 },
  { id: "donation-in", Icon: Gift, name: "Donated item", desc: "In-kind donation received", cls: "border-blue-500 bg-blue-50 dark:bg-blue-950/30", movementKind: "open_balance", signHint: 1 },
  { id: "damaged", Icon: AlertTriangle, name: "Damaged / expired", desc: "Spoiled or broken", cls: "border-red-500 bg-red-50 dark:bg-red-950/30", movementKind: "wastage", signHint: -1 },
  { id: "refund-stock", Icon: Undo2, name: "Refund stock return", desc: "Item returned on refund", cls: "border-teal-500 bg-teal-50 dark:bg-teal-950/30", movementKind: "return", signHint: 1 },
  { id: "correction", Icon: SearchCheck, name: "Stock count correction", desc: "Manual recount fix", cls: "border-blue-500 bg-blue-50 dark:bg-blue-950/30", movementKind: "adjustment", signHint: 1 },
];

export default function StockAdjustmentsPage() {
  const [selectedType, setSelectedType] = useState<AdjUiKind>("received");
  const [productId, setProductId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [products, setProducts] = useState<TempleInventoryProduct[]>([]);
  const [stores, setStores] = useState<InventoryStore[]>([]);
  const [recent, setRecent] = useState<InventoryStockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, storeData, ledgerData] = await Promise.all([
        fetchTempleAdminJson<{ products: TempleInventoryProduct[] }>("/api/temple-admin/inventory/products"),
        fetchTempleAdminJson<{ items: InventoryStore[] }>("/api/temple-admin/inventory/stores"),
        fetchTempleAdminJson<{ items: InventoryStockLedgerEntry[] }>(
          "/api/temple-admin/inventory/stock-ledger?limit=20"
        ),
      ]);
      setProducts(prodData.products ?? []);
      setStores(storeData.items ?? []);
      setRecent(ledgerData.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const selected = useMemo(() => ADJ_TYPES.find((t) => t.id === selectedType)!, [selectedType]);

  const handleSubmit = async () => {
    if (!productId) {
      setError("Select a product.");
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Enter a positive quantity.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson(
        `/api/temple-admin/inventory/products/${encodeURIComponent(productId)}/adjust`,
        {
          method: "POST",
          body: JSON.stringify({
            delta: qty * selected.signHint,
            movementKind: selected.movementKind,
            storeId: storeId || null,
            reason: reason.trim() || null,
          }),
        }
      );
      setQuantity("");
      setReason("");
      setSavedAt(Date.now());
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save adjustment.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none w-full transition-colors focus:border-[var(--brand-primary)]";
  const labelCls = "text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";
  const formSelectClass = "!text-xs !py-2 !rounded-lg";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Stock Adjustments</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Log stock movements — received, used in pooja, returned, donated or damaged. Saved live to the ledger.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {savedAt && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <Info className="w-4 h-4 shrink-0 mt-0.5" /> Adjustment saved.
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
          Adjustment type
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {ADJ_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedType === t.id ? t.cls : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300"
              }`}
            >
              <div className="flex justify-center mb-1.5 text-zinc-600 dark:text-zinc-300">
                <t.Icon className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">{t.name}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">{t.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Product *</label>
            <SelectInput
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={formSelectClass}
            >
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>
              Quantity * <span className="text-zinc-400 ml-1 normal-case">{selected.signHint > 0 ? "(adds to stock)" : "(removes from stock)"}</span>
            </label>
            <input
              className={inputCls}
              type="number"
              placeholder="Enter quantity"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Store (optional)</label>
            <SelectInput value={storeId} onChange={(e) => setStoreId(e.target.value)} className={formSelectClass}>
              <option value="">Not specified</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Notes / reason</label>
            <input
              className={inputCls}
              placeholder="e.g. Weekly delivery, used for Rudrabhishekam…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setProductId("");
              setStoreId("");
              setQuantity("");
              setReason("");
              setError(null);
            }}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save adjustment"}
          </button>
        </div>
      </div>

      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Recent adjustments</h2>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-zinc-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-500">No stock movements recorded yet.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                {["Item", "Movement", "Change", "Reason", "Date"].map((h) => (
                  <th
                    key={h}
                    className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide px-3.5 py-2.5 text-left border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap first:pl-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => {
                const delta = Number(r.quantity_delta);
                const positive = delta >= 0;
                return (
                  <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-3.5 py-2.5 first:pl-4">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {r.product_name ?? "—"}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{r.product_id}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-[11px] text-zinc-600 dark:text-zinc-300">{r.movement_kind}</td>
                    <td className={`px-3.5 py-2.5 font-bold ${positive ? "text-emerald-600" : "text-red-600"}`}>
                      {positive ? "+" : ""}
                      {delta}
                    </td>
                    <td className="px-3.5 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">{r.reason ?? "—"}</td>
                    <td className="px-3.5 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
