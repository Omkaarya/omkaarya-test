"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, TrendingDown, ShieldAlert, AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import { fetchTempleAdminJson, type InventoryLowStockProduct } from "@/lib/temple-admin-api";

export default function ReorderPage() {
  const [items, setItems] = useState<InventoryLowStockProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTempleAdminJson<{ items: InventoryLowStockProduct[] }>(
          "/api/temple-admin/inventory/low-stock"
        );
        if (!cancelled) setItems(data.items ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load reorder list.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.sku.toLowerCase().includes(q) ||
        (a.category ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const out = items.filter((a) => a.status === "out").length;
    const low = items.filter((a) => a.status === "low").length;
    const belowReorder = items.filter(
      (a) => a.reorder_point !== null && Number(a.quantity) <= Number(a.reorder_point)
    ).length;
    return [
      {
        icon: TrendingDown,
        label: "Below ROP",
        subLabel: "Need action",
        value: belowReorder,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900",
      },
      {
        icon: ShieldAlert,
        label: "Out of stock",
        subLabel: "Critical level",
        value: out,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900",
      },
      {
        icon: AlertTriangle,
        label: "Low stock",
        subLabel: "Reorder soon",
        value: low,
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900",
      },
      {
        icon: ShoppingCart,
        label: "Total alerts",
        subLabel: "Items watched",
        value: items.length,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900",
      },
    ];
  }, [items]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Reorder &amp; Replenishment
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Track low stock alerts and raise purchase orders for replenishment.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/temple-admin/inventory/adjustments"
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Restock
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, subLabel, value, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 shadow-sm ${bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
                <div className={`text-3xl font-black mt-1 ${color}`}>{value}</div>
                <p className="text-[10px] text-zinc-500 mt-1">{subLabel}</p>
              </div>
              <Icon className={`w-5 h-5 mt-0.5 ${color} opacity-70`} />
            </div>
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
              placeholder="Search products, SKU, category…"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 outline-none focus:ring-2 ring-[var(--brand-primary)] transition-all"
            />
          </div>
          <p className="ml-auto text-xs text-zinc-400">
            Showing {filtered.length} of {items.length} alerts
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4 text-center">Stock</th>
                  <th className="px-5 py-4 text-center">Reorder Point</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{a.name}</div>
                      <div className="text-[10px] font-mono text-zinc-400">{a.sku}</div>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400 text-xs">{a.category || "—"}</td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`font-bold ${
                          a.status === "out"
                            ? "text-red-600 dark:text-red-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {a.quantity} {a.unit}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-xs text-zinc-500">{a.reorder_point ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          a.status === "out"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        {a.status === "out" ? "Out of stock" : "Low stock"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href="/temple-admin/inventory/adjustments"
                        className="px-3 py-1.5 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-semibold hover:bg-[var(--brand-primary)]/20 transition-colors"
                      >
                        Restock
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-zinc-400">
                      No reorder alerts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
