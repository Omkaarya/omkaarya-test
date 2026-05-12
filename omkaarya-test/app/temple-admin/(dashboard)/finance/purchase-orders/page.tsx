"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, PackageOpen, Check, Loader2, AlertCircle, X } from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import {
  fetchTempleAdminJson,
  type InventoryPurchaseOrder,
  type InventorySupplier,
} from "@/lib/temple-admin-api";
import type { TempleInventoryProduct } from "@/lib/temple-inventory-api";

function fmtCurrency(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return `${currency} 0`;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

const STATUS_STYLES: Record<InventoryPurchaseOrder["status"], string> = {
  draft: "bg-zinc-100 text-zinc-700 border border-zinc-200",
  sent: "bg-amber-50 text-amber-700 border border-amber-100",
  received: "bg-green-50 text-green-700 border border-green-100",
  partial: "bg-blue-50 text-blue-700 border border-blue-100",
  cancelled: "bg-red-50 text-red-700 border border-red-100",
};

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<InventoryPurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
  const [products, setProducts] = useState<TempleInventoryProduct[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [poData, sData, pData] = await Promise.all([
        fetchTempleAdminJson<{ items: InventoryPurchaseOrder[] }>("/api/temple-admin/inventory/purchase-orders"),
        fetchTempleAdminJson<{ items: InventorySupplier[] }>("/api/temple-admin/inventory/suppliers"),
        fetchTempleAdminJson<{ products: TempleInventoryProduct[] }>("/api/temple-admin/inventory/products"),
      ]);
      setPos(poData.items ?? []);
      setSuppliers(sData.items ?? []);
      setProducts(pData.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load purchase orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const month = pos.filter((p) => new Date(p.created_at) >= monthStart);
    const awaiting = pos.filter((p) => p.status !== "received" && p.status !== "cancelled");
    const total = month.reduce((s, p) => s + Number(p.total_amount), 0);
    return { count: month.length, awaiting: awaiting.length, total };
  }, [pos]);

  const markReceived = async (id: string) => {
    if (!confirm("Mark this purchase order as fully received? Stock will be updated automatically.")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/inventory/purchase-orders/${encodeURIComponent(id)}/receive`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not receive PO.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Purchase orders</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Supplier purchases — mark as received to auto-update inventory.
          </p>
        </div>
        <Button variant="primary" size="sm" className="gap-2" onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4" /> New PO
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total POs this month</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{loading ? "…" : stats.count}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Awaiting delivery</p>
          <p className="text-2xl font-bold text-amber-600">{loading ? "…" : stats.awaiting}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total spent (this month)</p>
          <p className="text-2xl font-bold text-red-600">{loading ? "…" : fmtCurrency(stats.total)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["PO number", "Supplier", "Created", "Expected", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </span>
                  </td>
                </tr>
              ) : pos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">
                    No purchase orders yet.
                  </td>
                </tr>
              ) : (
                pos.map((po) => (
                  <tr key={po.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      {po.po_number}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">{po.supplier_name ?? "—"}</td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                      {new Date(po.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                      {po.expected_at ? new Date(po.expected_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-500">
                      {fmtCurrency(po.total_amount, po.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full ${STATUS_STYLES[po.status]}`}
                      >
                        {po.status === "received" ? <Check className="h-3 w-3" /> : <PackageOpen className="h-3 w-3" />}
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {po.status !== "received" && po.status !== "cancelled" && (
                        <button
                          onClick={() => markReceived(po.id)}
                          className="text-xs border border-zinc-200 rounded-lg px-3 py-1.5 font-semibold text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors dark:border-zinc-700 whitespace-nowrap"
                        >
                          Mark received
                        </button>
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
        <NewPoDrawer
          suppliers={suppliers}
          products={products}
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

function NewPoDrawer({
  suppliers,
  products,
  onClose,
  onSaved,
}: {
  suppliers: InventorySupplier[];
  products: TempleInventoryProduct[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [supplierId, setSupplierId] = useState("");
  const [expectedAt, setExpectedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<{ productId: string; quantity: string; unitCost: string }[]>([
    { productId: "", quantity: "1", unitCost: "0" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0),
    0
  );

  const handleSave = async () => {
    const valid = lines.filter((l) => l.productId && Number(l.quantity) > 0);
    if (valid.length === 0) {
      setError("Add at least one line.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
      await fetchTempleAdminJson("/api/temple-admin/inventory/purchase-orders", {
        method: "POST",
        body: JSON.stringify({
          poNumber,
          supplierId: supplierId || null,
          expectedAt: expectedAt.trim() ? expectedAt.trim() : null,
          notes: notes.trim() || null,
          lines: valid.map((l) => ({
            productId: l.productId,
            quantity: Number(l.quantity),
            unitCost: Number(l.unitCost) || 0,
          })),
        }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create PO.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full h-11 px-4 rounded-xl border border-zinc-100 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950";

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-xl bg-white dark:bg-zinc-950 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">New purchase order</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className={inputCls + " mt-1.5 appearance-none"}
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Expected delivery</label>
            <input
              type="date"
              value={expectedAt}
              onChange={(e) => setExpectedAt(e.target.value)}
              className={inputCls + " mt-1.5"}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lines</label>
            <div className="space-y-2 mt-1.5">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_100px_30px] gap-2">
                  <select
                    value={l.productId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const prod = products.find((p) => p.id === v);
                      setLines((prev) =>
                        prev.map((row, idx) =>
                          idx === i
                            ? { ...row, productId: v, unitCost: prod ? String(prod.costAmount) : row.unitCost }
                            : row
                        )
                      );
                    }}
                    className="h-10 px-3 rounded-lg border border-zinc-100 bg-white text-xs outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950 appearance-none"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={l.quantity}
                    min={0}
                    onChange={(e) =>
                      setLines((prev) => prev.map((row, idx) => (idx === i ? { ...row, quantity: e.target.value } : row)))
                    }
                    className="h-10 px-2 rounded-lg border border-zinc-100 text-xs outline-none focus:border-[var(--brand-primary)]"
                  />
                  <input
                    type="number"
                    value={l.unitCost}
                    min={0}
                    step="0.01"
                    onChange={(e) =>
                      setLines((prev) => prev.map((row, idx) => (idx === i ? { ...row, unitCost: e.target.value } : row)))
                    }
                    className="h-10 px-2 rounded-lg border border-zinc-100 text-xs outline-none focus:border-[var(--brand-primary)]"
                  />
                  <button
                    onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-zinc-400 hover:text-red-500"
                    disabled={lines.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                setLines((prev) => [...prev, { productId: "", quantity: "1", unitCost: "0" }])
              }
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
            >
              <Plus className="w-3 h-3" /> Add line
            </button>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Total</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{fmtCurrency(totalAmount)}</span>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-100 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950 mt-1.5 resize-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-[var(--text-primary)] hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create PO"}
          </button>
        </div>
      </div>
    </>
  );
}
