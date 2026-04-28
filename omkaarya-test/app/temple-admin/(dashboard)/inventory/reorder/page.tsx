"use client";

import { useState } from "react";
import { Search, Download, Settings2, AlertTriangle, ShieldAlert, ShoppingCart, TrendingDown } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type ReorderStatus = "Pending" | "PO Raised" | "Ordered" | "Ignored";
type ReorderPriority = "Critical" | "High" | "Medium";

type ReorderAlert = {
  id: string;
  priority: ReorderPriority;
  product: string;
  productCode: string;
  unit: string;         // temple unit (replaces "warehouse")
  currentStock: number;
  uom: string;
  rop: number;          // reorder point
  safetyStock: number;
  suggestedQty: number;
  supplier: string;
  estValue: number;
  stockoutDate: string | null;
  status: ReorderStatus;
  autoReplenish: boolean;
};

// ── Mock Data ──────────────────────────────────────────────────────

const SEED_ALERTS: ReorderAlert[] = [
  {
    id: "1", priority: "Critical", product: "Sesame Oil", productCode: "OIL-SES",
    unit: "Madapalli", currentStock: 2, uom: "L", rop: 10, safetyStock: 5,
    suggestedQty: 20, supplier: "Sri Sakthi Traders", estValue: 2400,
    stockoutDate: "2026-04-25", status: "Pending", autoReplenish: false,
  },
  {
    id: "2", priority: "Critical", product: "Camphor Tablets", productCode: "CAMP-01",
    unit: "Moolasthanam", currentStock: 1, uom: "kg", rop: 3, safetyStock: 1,
    suggestedQty: 5, supplier: "Pooja Essentials Co.", estValue: 750,
    stockoutDate: "2026-04-24", status: "Pending", autoReplenish: true,
  },
  {
    id: "3", priority: "High", product: "Jasmine Flowers", productCode: "FLW-JAS",
    unit: "Moolasthanam", currentStock: 5, uom: "kg", rop: 10, safetyStock: 4,
    suggestedQty: 15, supplier: "Flower Mart", estValue: 900,
    stockoutDate: "2026-04-27", status: "Pending", autoReplenish: false,
  },
  {
    id: "4", priority: "High", product: "Coconuts", productCode: "COC-01",
    unit: "Main Store", currentStock: 8, uom: "pcs", rop: 20, safetyStock: 10,
    suggestedQty: 50, supplier: "Wholesale Traders", estValue: 1500,
    stockoutDate: "2026-04-28", status: "PO Raised", autoReplenish: false,
  },
  {
    id: "5", priority: "Medium", product: "Incense Sticks", productCode: "INC-STK",
    unit: "Main Store", currentStock: 30, uom: "pcs", rop: 50, safetyStock: 20,
    suggestedQty: 100, supplier: "Pooja Essentials Co.", estValue: 600,
    stockoutDate: null, status: "Ordered", autoReplenish: true,
  },
  {
    id: "6", priority: "Medium", product: "Banana Leaves", productCode: "BAN-LV",
    unit: "Madapalli", currentStock: 12, uom: "pcs", rop: 25, safetyStock: 10,
    suggestedQty: 50, supplier: "Fresh Farms", estValue: 250,
    stockoutDate: null, status: "Ignored", autoReplenish: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<ReorderPriority, string> = {
  "Critical": "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  "High":     "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  "Medium":   "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
};

const STATUS_TABS: { key: ReorderStatus | "All"; label: string }[] = [
  { key: "All",      label: "All" },
  { key: "Pending",  label: "Pending" },
  { key: "PO Raised",label: "PO Raised" },
  { key: "Ordered",  label: "Ordered" },
  { key: "Ignored",  label: "Ignored" },
];

// ── Main Page ──────────────────────────────────────────────────────

export default function ReorderPage() {
  const [alerts, setAlerts] = useState<ReorderAlert[]>(SEED_ALERTS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ReorderStatus | "All">("All");
  const [filterUnit, setFilterUnit] = useState("All");
  const [autoOnly, setAutoOnly] = useState(false);

  const UNITS = ["All", ...Array.from(new Set(alerts.map((a) => a.unit)))];

  const filtered = alerts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = a.product.toLowerCase().includes(q) || a.productCode.toLowerCase().includes(q) || a.supplier.toLowerCase().includes(q);
    const matchTab = activeTab === "All" || a.status === activeTab;
    const matchUnit = filterUnit === "All" || a.unit === filterUnit;
    const matchAuto = !autoOnly || a.autoReplenish;
    return matchSearch && matchTab && matchUnit && matchAuto;
  });

  const updateStatus = (id: string, status: ReorderStatus) =>
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));

  const raiseAllPOs = () =>
    setAlerts((prev) => prev.map((a) => a.status === "Pending" ? { ...a, status: "PO Raised" } : a));

  const pendingCount = alerts.filter((a) => a.status === "Pending").length;

  const stats = [
    {
      icon: TrendingDown, label: "Below ROP", subLabel: "Need action",
      value: alerts.filter((a) => a.currentStock < a.rop).length,
      color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900",
    },
    {
      icon: ShieldAlert, label: "Safety Stock Breached", subLabel: "Critical level",
      value: alerts.filter((a) => a.currentStock < a.safetyStock).length,
      color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900",
    },
    {
      icon: ShoppingCart, label: "POs Open", subLabel: "Raised orders",
      value: alerts.filter((a) => a.status === "PO Raised" || a.status === "Ordered").length,
      color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900",
    },
    {
      icon: AlertTriangle, label: "Stockout Risk", subLabel: "Within 3 days",
      value: alerts.filter((a) => a.stockoutDate !== null && a.status === "Pending").length,
      color: "text-red-700 dark:text-red-400 font-black", bg: "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Reorder &amp; Replenishment
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Track low stock alerts and manage pooja item replenishment.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={raiseAllPOs} disabled={pendingCount === 0}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <ShoppingCart className="w-4 h-4" /> Raise All POs ({pendingCount})
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all">
            <Settings2 className="w-4 h-4" /> ROP Settings
          </button>
        </div>
      </div>

      {/* Stats */}
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
            <button className="mt-3 text-[10px] font-semibold text-[var(--brand-primary)] hover:underline">
              View Details →
            </button>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">

        {/* Status Tabs */}
        <div className="border-b border-zinc-100 dark:border-zinc-800 px-5 flex gap-0">
          {STATUS_TABS.map((tab) => {
            const count = tab.key === "All"
              ? alerts.length
              : alerts.filter((a) => a.status === tab.key).length;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={[
                  "px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
                    : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
                ].join(" ")}>
                {tab.label} <span className="ml-1 text-xs opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, code, supplier…"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 outline-none focus:ring-2 ring-[var(--brand-primary)] transition-all text-zinc-900 dark:text-zinc-100" />
          </div>
          <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 ring-[var(--brand-primary)]">
            {UNITS.map((u) => <option key={u} value={u}>{u === "All" ? "All Units" : u}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
            <input type="checkbox" checked={autoOnly} onChange={(e) => setAutoOnly(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600 text-[var(--brand-primary)]" />
            Auto-Replenish Only
          </label>
          <p className="ml-auto text-xs text-zinc-400">Showing {filtered.length} of {alerts.length} alerts</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Temple Unit</th>
                <th className="px-5 py-4 text-center">Stock</th>
                <th className="px-5 py-4 text-center">ROP / Safety</th>
                <th className="px-5 py-4 text-center">Suggested Qty</th>
                <th className="px-5 py-4">Supplier</th>
                <th className="px-5 py-4">Est. Value</th>
                <th className="px-5 py-4">Stockout</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${PRIORITY_STYLE[a.priority]}`}>
                      {a.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{a.product}</div>
                    <div className="text-[10px] font-mono text-zinc-400">{a.productCode}</div>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400 text-xs font-medium">{a.unit}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`font-bold ${a.currentStock < a.safetyStock ? "text-red-600 dark:text-red-400" : a.currentStock < a.rop ? "text-amber-600 dark:text-amber-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {a.currentStock} {a.uom}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-xs text-zinc-500">
                    {a.rop} / {a.safetyStock} {a.uom}
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                    {a.suggestedQty} {a.uom}
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-600 dark:text-zinc-400">{a.supplier}</td>
                  <td className="px-5 py-4 text-xs text-zinc-600 dark:text-zinc-400">
                    {a.estValue > 0 ? `₹${a.estValue.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {a.stockoutDate
                      ? <span className="text-xs font-semibold text-red-600 dark:text-red-400">{a.stockoutDate}</span>
                      : <span className="text-xs text-zinc-400">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      a.status === "Pending"   ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                      a.status === "PO Raised" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
                      a.status === "Ordered"   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                      "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {a.status === "Pending" && (
                      <button onClick={() => updateStatus(a.id, "PO Raised")}
                        className="px-3 py-1.5 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-semibold hover:bg-[var(--brand-primary)]/20 transition-colors">
                        Raise PO
                      </button>
                    )}
                    {a.status === "PO Raised" && (
                      <button onClick={() => updateStatus(a.id, "Ordered")}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors">
                        Mark Ordered
                      </button>
                    )}
                    {a.status === "Ordered" && (
                      <span className="text-xs text-emerald-500 font-semibold">✓ Ordered</span>
                    )}
                    {a.status === "Ignored" && (
                      <button onClick={() => updateStatus(a.id, "Pending")}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center text-sm text-zinc-400">
                    No reorder alerts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
