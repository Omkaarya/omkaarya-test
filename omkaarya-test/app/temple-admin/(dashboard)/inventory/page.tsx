"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  ChevronRight,
  History,
  Eye,
  Pencil,
  AlertCircle,
  Loader2,
} from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";
import { Button } from "@/app/components/ds/atoms/Button";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { jsonApiErrorMessage, type ApiSuccessBody } from "@/lib/api-envelope";
import type { TempleInventoryProduct } from "@/lib/temple-inventory-api";

const PRODUCT_TYPES = [
  { id: "all", label: "All", icon: "🏛️" },
  { id: "Consumable", label: "Consumables", icon: "🔁" },
  { id: "Equipment", label: "Equipment", icon: "⚙️" },
  { id: "Sale Item", label: "POS/Sale", icon: "🛒" },
  { id: "Admin", label: "Office", icon: "🗃️" },
  { id: "Festival", label: "Festival", icon: "🎪" },
];

const EMOJI_FALLBACK = ["📦", "🪔", "🌸", "🕯️", "🧴", "🎁", "🔔", "🍃"];

function emojiForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return EMOJI_FALLBACK[h % EMOJI_FALLBACK.length]!;
}

type RowVm = {
  ico: string;
  name: string;
  sku: string;
  type: string;
  cat: string;
  unit: string;
  qty: number;
  reorder: number | null;
  cost: string;
  status: "ok" | "low" | "out";
};

function mapProduct(p: TempleInventoryProduct): RowVm {
  const costNum = typeof p.costAmount === "number" ? p.costAmount : 0;
  return {
    ico: emojiForName(p.name),
    name: p.name,
    sku: p.sku,
    type: p.productType || "—",
    cat: p.category || "—",
    unit: p.unit || "—",
    qty: p.quantity,
    reorder: p.reorderPoint,
    cost: `£${costNum.toFixed(2)}`,
    status: p.status,
  };
}

export default function InventoryPage() {
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ok" | "low" | "out">("");
  const [products, setProducts] = useState<TempleInventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/temple-admin/inventory/products", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(jsonApiErrorMessage(data) || `Could not load inventory (${res.status}).`);
          setProducts([]);
          return;
        }
        const ok = data as ApiSuccessBody<{ products: TempleInventoryProduct[] }>;
        const list = Array.isArray(ok.data?.products) ? ok.data.products : [];
        setProducts(list);
      } catch {
        if (!cancelled) {
          setLoadError("Network error loading inventory.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rowsVm = useMemo(() => products.map(mapProduct), [products]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    for (const pt of PRODUCT_TYPES) {
      if (pt.id === "all") continue;
      counts[pt.id] = products.filter((p) => (p.productType || "").trim() === pt.id).length;
    }
    return counts;
  }, [products]);

  const metrics = useMemo(() => {
    let low = 0;
    let out = 0;
    let ok = 0;
    for (const p of products) {
      if (p.status === "low") low += 1;
      else if (p.status === "out") out += 1;
      else ok += 1;
    }
    return {
      total: products.length,
      ok,
      low,
      out,
      inStockPct: products.length === 0 ? 0 : Math.round((ok / products.length) * 100),
    };
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(new Set(rowsVm.map((p) => p.cat))).filter(Boolean).sort();
  }, [rowsVm]);

  const filteredProducts = useMemo(() => {
    return rowsVm.filter((p) => {
      const matchesType = activeType === "all" || p.type === activeType;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !catFilter || p.cat === catFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesType && matchesSearch && matchesCategory && matchesStatus;
    });
  }, [rowsVm, activeType, search, catFilter, statusFilter]);

  const invToolbarSelect =
    "!text-[11px] !py-[7px] !pl-2 !rounded-lg !font-[inherit] !text-zinc-600 dark:!text-zinc-300";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-text-tertiary mb-1">
            <span>Inventory</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand">All Products</span>
          </div>
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Products & Inventory</h1>
          <p className="text-[12px] text-text-tertiary mt-1">
            All temple items — consumables, equipment, POS items, office supplies & festival stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leadingIcon={<History className="w-4 h-4" />}>
            Stock Log
          </Button>
          <Link href="/temple-admin/inventory/create">
            <Button size="sm" leadingIcon={<Plus className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Could not load live inventory</p>
            <p className="text-[12px] opacity-90 mt-0.5">{loadError}</p>
            <p className="text-[11px] mt-1 text-amber-800/80 dark:text-amber-200/80">
              Ensure the temple has an operational database configured and run{" "}
              <code className="font-mono text-[10px]">npm run temple-ops:bootstrap</code> on the backend if needed.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PRODUCT_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setActiveType(type.id)}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap
              ${
                activeType === type.id
                  ? "bg-brand-muted border-brand text-brand shadow-sm"
                  : "bg-surface border-border text-text-secondary hover:border-gray-400 hover:text-text-primary"
              }
            `}
          >
            <span className="text-[13px]">{type.icon}</span>
            <span>{type.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black ${
                activeType === type.id ? "bg-brand text-white" : "bg-gray-100 text-text-tertiary"
              }`}
            >
              {typeCounts[type.id] ?? (type.id === "all" ? products.length : 0)}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total products" value={String(metrics.total)} trendLabel="Live from temple ops DB" chartColor="brand" />
        <MetricCard
          title="In stock"
          value={String(metrics.ok)}
          trendPercentage={metrics.inStockPct}
          trendLabel="In stock items"
          chartColor="success"
        />
        <MetricCard title="Low stock" value={String(metrics.low)} trendPercentage={metrics.low === 0 ? 0 : -5} trendLabel="Reorder soon" chartColor="warning" />
        <MetricCard title="Out of stock" value={String(metrics.out)} trendPercentage={metrics.out === 0 ? 0 : -2} trendLabel="Action needed" chartColor="gray" />
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Search products by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SelectInput
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              wrapperClassName="w-auto min-w-0"
              className={invToolbarSelect}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>

            <SelectInput
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | "ok" | "low" | "out")}
              wrapperClassName="w-auto min-w-0"
              className={invToolbarSelect}
            >
              <option value="">All status</option>
              <option value="ok">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </SelectInput>

            <Button variant="outline" size="sm" leadingIcon={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-text-tertiary text-sm font-semibold">
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              Loading products…
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Item</th>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Category</th>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Stock Qty</th>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Unit Cost</th>
                  <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-right text-[10px] font-black text-text-tertiary uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {filteredProducts.map((p, i) => (
                  <tr key={`${p.sku}-${i}`} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-border flex items-center justify-center text-[18px] shrink-0">
                          {p.ico}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="text-[12px] font-bold text-text-primary truncate">{p.name}</div>
                          <div className="text-[10px] font-mono text-text-placeholder">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          p.cat === "Prasad"
                            ? "bg-brand-muted border-brand/20 text-brand"
                            : p.cat === "Flowers"
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-blue-50 border-blue-200 text-blue-700"
                        }`}
                      >
                        {p.cat}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        className={`text-[14px] font-extrabold tracking-tight ${
                          p.status === "out"
                            ? "text-status-danger-text"
                            : p.status === "low"
                              ? "text-status-warning-text"
                              : "text-text-primary"
                        }`}
                      >
                        {p.qty} <span className="text-[10px] text-text-placeholder font-medium">{p.unit}</span>
                      </div>
                      {p.reorder != null && p.reorder > 0 && p.status !== "ok" && (
                        <div className="text-[9px] font-bold text-status-warning-text mt-0.5">
                          Reorder &lt;{p.reorder}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[12px] font-bold text-text-secondary">{p.cost}</td>
                    <td className="px-5 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "ok"
                            ? "bg-status-success-bg text-status-success-text"
                            : p.status === "low"
                              ? "bg-status-warning-bg text-status-warning-text"
                              : "bg-status-danger-bg text-status-danger-text"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === "ok"
                              ? "bg-status-success-text"
                              : p.status === "low"
                                ? "bg-status-warning-text"
                                : "bg-status-danger-text"
                          }`}
                        />
                        {p.status === "ok" ? "In Stock" : p.status === "low" ? "Low Stock" : "Out of Stock"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" iconOnly>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" iconOnly>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-gray-50/20">
          <span className="text-[11px] text-text-tertiary font-bold tracking-tight uppercase">
            Showing {filteredProducts.length} of {rowsVm.length} items
          </span>
        </div>
      </div>
    </div>
  );
}
