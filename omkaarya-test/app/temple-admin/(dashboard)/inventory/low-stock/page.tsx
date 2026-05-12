"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Plus, AlertTriangle, XCircle, Package, Loader2, AlertCircle } from "lucide-react";
import { fetchTempleAdminJson, type InventoryLowStockProduct } from "@/lib/temple-admin-api";

type TabId = "all" | "low" | "out";

export default function StockAlertsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("all");
  const [items, setItems] = useState<InventoryLowStockProduct[]>([]);
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
          setError(e instanceof Error ? e.message : "Could not load low-stock items.");
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

  const lowCount = items.filter((a) => a.status === "low").length;
  const outCount = items.filter((a) => a.status === "out").length;

  const filtered = useMemo(
    () => (tab === "low" ? items.filter((a) => a.status === "low") : tab === "out" ? items.filter((a) => a.status === "out") : items),
    [tab, items]
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: `All alerts (${items.length})` },
    { id: "low", label: `Low stock (${lowCount})` },
    { id: "out", label: `Out of stock (${outCount})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Stock Alerts</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Items needing immediate attention — reorder or restock before next pooja.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/temple-admin/inventory/suppliers")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Email suppliers
          </button>
          <button
            onClick={() => router.push("/temple-admin/inventory/adjustments")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Restock
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
              i < tabs.length - 1 ? "border-r border-zinc-200 dark:border-zinc-700" : ""
            } ${
              tab === t.id
                ? "bg-orange-50 dark:bg-orange-950/30 text-[var(--brand-primary)] font-bold"
                : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-500">
            All items are stocked above their reorder point.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                {["Item", "Category", "Current qty", "Reorder at", "Status", "Actions"].map((h) => (
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
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-3.5 py-2.5 first:pl-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {item.category || "—"}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className={`text-base font-bold ${item.status === "out" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {item.quantity} <span className="text-[10px] text-zinc-400 font-normal">{item.unit || ""}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-[11px] text-zinc-400">{item.reorder_point ?? "—"}</td>
                  <td className="px-3.5 py-2.5">
                    {item.status === "out" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300">
                        <XCircle className="w-3 h-3" /> Out of stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3" /> Low stock
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <button
                      onClick={() => router.push("/temple-admin/inventory/adjustments")}
                      className="px-2 py-1 text-[11px] border border-orange-200 dark:border-orange-800/50 rounded-md text-[var(--brand-primary)] bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 transition-colors font-semibold"
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{filtered.length} items need attention</span>
        </div>
      </div>
    </div>
  );
}
