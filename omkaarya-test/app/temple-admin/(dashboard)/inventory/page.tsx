"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Download, Plus, Package, Wrench, ShoppingCart, FileBox, PartyPopper,
  Flower2, Droplets, Flame, Wind, Circle, Cookie, Star, Landmark,
  AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type ProductType = "Consumable" | "Equipment" | "Sale Item" | "Admin" | "Festival";
type StockStatus = "ok" | "low" | "out";

type Product = {
  icon: React.ReactNode;
  name: string;
  sku: string;
  type: ProductType;
  cat: string;
  unit: string;
  qty: number;
  reorder: number | null;
  cost: string;
  freq: string;
  status: StockStatus;
};

// ── Icon helpers ──────────────────────────────────────────────────

const ic = "w-4 h-4";

const PRODUCTS: Product[] = [
  { icon: <Cookie className={ic} />, name: "Besan Ladoo", sku: "PRD-001", type: "Consumable", cat: "Prasad", unit: "Pcs", qty: 42, reorder: 50, cost: "£0.45", freq: "Daily", status: "low" },
  { icon: <Cookie className={ic} />, name: "Motichoor Ladoo", sku: "PRD-002", type: "Consumable", cat: "Prasad", unit: "Pcs", qty: 28, reorder: 30, cost: "£0.60", freq: "Weekly", status: "low" },
  { icon: <Cookie className={ic} />, name: "Coconut Ladoo", sku: "PRD-003", type: "Consumable", cat: "Prasad", unit: "Pcs", qty: 65, reorder: 20, cost: "£0.35", freq: "Weekly", status: "ok" },
  { icon: <Flower2 className={ic} />, name: "Rose Garland", sku: "FLW-001", type: "Consumable", cat: "Flowers", unit: "Garlands", qty: 12, reorder: 10, cost: "£3.00", freq: "Daily", status: "ok" },
  { icon: <Flower2 className={ic} />, name: "Marigold Loose", sku: "FLW-002", type: "Consumable", cat: "Flowers", unit: "Kg", qty: 3, reorder: 5, cost: "£3/kg", freq: "Daily", status: "low" },
  { icon: <Flame className={ic} />, name: "Camphor Tablets", sku: "PJA-001", type: "Consumable", cat: "Puja Supplies", unit: "Packets", qty: 0, reorder: 10, cost: "£1.75", freq: "Daily", status: "out" },
  { icon: <Droplets className={ic} />, name: "Sesame Oil", sku: "OIL-001", type: "Consumable", cat: "Oil & Lamps", unit: "Litres", qty: 18, reorder: 5, cost: "£5.00", freq: "Weekly", status: "ok" },
  { icon: <Wind className={ic} />, name: "Sandalwood Incense", sku: "INC-001", type: "Consumable", cat: "Incense", unit: "Sticks", qty: 0, reorder: 100, cost: "£0.05", freq: "Daily", status: "out" },
  { icon: <Flower2 className={ic} />, name: "Tulsi Leaves", sku: "FLW-003", type: "Consumable", cat: "Flowers", unit: "Bunches", qty: 8, reorder: 5, cost: "£1.50", freq: "Daily", status: "ok" },
  { icon: <Circle className={ic} />, name: "Kumkum Powder", sku: "PJA-002", type: "Consumable", cat: "Puja Supplies", unit: "Packets", qty: 25, reorder: 15, cost: "£1.25", freq: "Daily", status: "ok" },
  { icon: <Circle className={ic} />, name: "Whole Coconut", sku: "PRD-004", type: "Consumable", cat: "Prasad", unit: "Pcs", qty: 34, reorder: 20, cost: "£1.00", freq: "Daily", status: "ok" },
  { icon: <Flame className={ic} />, name: "Ghee (cow)", sku: "OIL-002", type: "Consumable", cat: "Oil & Lamps", unit: "Litres", qty: 4, reorder: 5, cost: "£8.00", freq: "Daily", status: "low" },
  { icon: <Flame className={ic} />, name: "Cotton Wicks", sku: "OIL-003", type: "Consumable", cat: "Oil & Lamps", unit: "Packets", qty: 0, reorder: 10, cost: "£0.80", freq: "Daily", status: "out" },
  { icon: <Flower2 className={ic} />, name: "Jasmine Loose", sku: "FLW-004", type: "Consumable", cat: "Flowers", unit: "Kg", qty: 2, reorder: 3, cost: "£6/kg", freq: "Daily", status: "low" },
  { icon: <Circle className={ic} />, name: "Vibhuti Packets", sku: "PJA-003", type: "Consumable", cat: "Puja Supplies", unit: "Packets", qty: 60, reorder: 20, cost: "£0.50", freq: "Daily", status: "ok" },
  { icon: <Flame className={ic} />, name: "Brass Lamp 5-wick", sku: "EQP-001", type: "Equipment", cat: "Lamps & Deepam", unit: "Pcs", qty: 8, reorder: null, cost: "£45.00", freq: "One-time", status: "ok" },
  { icon: <Star className={ic} />, name: "Temple Bell", sku: "EQP-002", type: "Equipment", cat: "Vessels & Utensils", unit: "Pcs", qty: 3, reorder: null, cost: "£120.00", freq: "One-time", status: "ok" },
  { icon: <Package className={ic} />, name: "Prasad Packet Small", sku: "POS-001", type: "Sale Item", cat: "Prasad Packets", unit: "Packets", qty: 120, reorder: 50, cost: "£0.80", freq: "Daily", status: "ok" },
  { icon: <FileBox className={ic} />, name: "Temple Calendar 2026", sku: "POS-002", type: "Sale Item", cat: "Books & Calendars", unit: "Pcs", qty: 5, reorder: 20, cost: "£3.00", freq: "Monthly", status: "low" },
  { icon: <FileBox className={ic} />, name: "A4 Paper (500 sheets)", sku: "ADM-001", type: "Admin", cat: "Stationery", unit: "Reams", qty: 8, reorder: 3, cost: "£5.00", freq: "Monthly", status: "ok" },
];

const TYPE_TABS: { id: string; label: string; Icon: React.ComponentType<{ className?: string }>; type: ProductType | "all" }[] = [
  { id: "all", label: "All", Icon: Landmark, type: "all" },
  { id: "con", label: "Consumables", Icon: Package, type: "Consumable" },
  { id: "eqp", label: "Equipment", Icon: Wrench, type: "Equipment" },
  { id: "pos", label: "POS/Sale", Icon: ShoppingCart, type: "Sale Item" },
  { id: "adm", label: "Office", Icon: FileBox, type: "Admin" },
  { id: "fes", label: "Festival", Icon: PartyPopper, type: "Festival" },
];

const CAT_COLORS: Record<string, string> = {
  Prasad: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  Flowers: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Puja Supplies": "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  Incense: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "Oil & Lamps": "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  "Lamps & Deepam": "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "Vessels & Utensils": "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "Prasad Packets": "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  "Books & Calendars": "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  Stationery: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const TYPE_BADGE: Record<ProductType, { cls: string; label: string }> = {
  Consumable: { cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", label: "Consume" },
  Equipment: { cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300", label: "Equip" },
  "Sale Item": { cls: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300", label: "POS/Sale" },
  Admin: { cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300", label: "Office" },
  Festival: { cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", label: "Festival" },
};

// ── Helpers ────────────────────────────────────────────────────────

function statusPill(s: StockStatus) {
  if (s === "ok") return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"><CheckCircle2 className="w-3 h-3" />In stock</span>;
  if (s === "low") return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"><AlertTriangle className="w-3 h-3" />Low stock</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"><XCircle className="w-3 h-3" />Out of stock</span>;
}

function qtyColor(s: StockStatus) {
  if (s === "ok") return "text-zinc-900 dark:text-zinc-100 font-bold";
  if (s === "low") return "text-amber-600 dark:text-amber-400 font-bold";
  return "text-red-600 dark:text-red-400 font-bold";
}

// ── Page ───────────────────────────────────────────────────────────

export default function InventoryProductsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PRODUCTS.length };
    PRODUCTS.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PRODUCTS.filter(p => {
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (catFilter && p.cat !== catFilter) return false;
      if (statusFilter === "In stock" && p.status !== "ok") return false;
      if (statusFilter === "Low stock" && p.status !== "low") return false;
      if (statusFilter === "Out of stock" && p.status !== "out") return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, typeFilter, catFilter, statusFilter]);

  const metrics = useMemo(() => ({
    total: PRODUCTS.length,
    inStock: PRODUCTS.filter(p => p.status === "ok").length,
    low: PRODUCTS.filter(p => p.status === "low").length,
    out: PRODUCTS.filter(p => p.status === "out").length,
  }), []);

  const categories = useMemo(() => [...new Set(PRODUCTS.map(p => p.cat))].sort(), []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Products & Inventory</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">All temple items — consumables, equipment, POS items, office supplies & festival stock</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
            <Download className="w-3.5 h-3.5" />Export
          </button>
          <button onClick={() => router.push("/temple-admin/inventory/create")} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">
            <Plus className="w-3.5 h-3.5" />Add product
          </button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_TABS.map(tab => {
          const active = typeFilter === tab.type;
          const count = tab.type === "all" ? typeCounts.all : (typeCounts[tab.type] || 0);
          return (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[1.5px] text-[11px] font-medium transition-all ${
                active
                  ? "border-[var(--brand-primary)] bg-orange-50 dark:bg-orange-950/30 text-[var(--brand-primary)] font-bold"
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              <tab.Icon className="w-3.5 h-3.5" /> {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: "Total products", value: metrics.total, sub: "6 product types", color: "", Icon: Package },
          { label: "In stock", value: metrics.inStock, sub: `${((metrics.inStock / metrics.total) * 100).toFixed(1)}% of items`, color: "text-emerald-600 dark:text-emerald-400", Icon: CheckCircle2 },
          { label: "Low stock", value: metrics.low, sub: "reorder soon", color: "text-amber-600 dark:text-amber-400", Icon: AlertTriangle },
          { label: "Out of stock", value: metrics.out, sub: "action needed", color: "text-red-600 dark:text-red-400", Icon: XCircle },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">
              <m.Icon className="w-3.5 h-3.5" />{m.label}
            </div>
            <div className={`text-2xl font-bold leading-none ${m.color || "text-zinc-900 dark:text-zinc-50"}`}>{m.value}</div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-[7px] min-w-[220px]">
          <Search className="w-[13px] h-[13px] text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="border-none outline-none text-xs text-zinc-900 dark:text-zinc-100 bg-transparent w-full font-[inherit] placeholder:text-zinc-400" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-[7px] text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 outline-none cursor-pointer font-[inherit]">
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-[7px] text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 outline-none cursor-pointer font-[inherit]">
          <option value="">All status</option>
          <option>In stock</option>
          <option>Low stock</option>
          <option>Out of stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              {["Item", "Type", "Category", "Unit", "In stock", "Reorder at", "Unit cost", "Frequency", "Status", "Actions"].map(h => (
                <th key={h} className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide px-3.5 py-2.5 text-left border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap first:pl-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-zinc-400 text-sm">No items match your filters</td></tr>
            ) : (
              filtered.map((p, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer" onClick={() => router.push("/temple-admin/inventory/create")}>
                  <td className="px-3.5 py-2.5 first:pl-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">{p.icon}</div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5"><span className={`inline-block text-[9px] font-bold px-1.5 py-px rounded uppercase tracking-wide ${TYPE_BADGE[p.type].cls}`}>{TYPE_BADGE[p.type].label}</span></td>
                  <td className="px-3.5 py-2.5"><span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-lg ${CAT_COLORS[p.cat] || "bg-zinc-100 text-zinc-600"}`}>{p.cat}</span></td>
                  <td className="px-3.5 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">{p.unit}</td>
                  <td className="px-3.5 py-2.5">
                    <div className={qtyColor(p.status)}>{p.qty}</div>
                    {p.status !== "ok" && p.reorder && (
                      <div className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-px rounded mt-0.5 inline-block">Reorder &lt;{p.reorder}</div>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-[11px] text-zinc-400">{p.reorder ?? "—"}</td>
                  <td className="px-3.5 py-2.5 text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">{p.cost}</td>
                  <td className="px-3.5 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">{p.freq}</td>
                  <td className="px-3.5 py-2.5">{statusPill(p.status)}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => router.push("/temple-admin/inventory/create")} className="px-2 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Edit</button>
                      <button onClick={() => router.push("/temple-admin/inventory/adjustments")} className="px-2 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Adjust</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Showing {filtered.length} of {PRODUCTS.length} products</span>
          <div className="flex gap-1">
            {["‹", "1", "2", "3", "›"].map((pg, i) => (
              <button key={i} className={`w-7 h-7 rounded-md border text-[11px] flex items-center justify-center font-[inherit] transition-colors ${pg === "1" ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"}`}>{pg}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
