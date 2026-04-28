"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical,
  ArrowRight,
  Bell,
  History,
  Tag,
  Eye,
  Pencil
} from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";
import { Button } from "@/app/components/ds/atoms/Button";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";

const PRODUCT_TYPES = [
  { id: "all", label: "All", icon: "🏛️", count: 243 },
  { id: "Consumable", label: "Consumables", icon: "🔁", count: 148 },
  { id: "Equipment", label: "Equipment", icon: "⚙️", count: 42 },
  { id: "Sale Item", label: "POS/Sale", icon: "🛒", count: 28 },
  { id: "Admin", label: "Office", icon: "🗃️", count: 15 },
  { id: "Festival", label: "Festival", icon: "🎪", count: 10 },
];

const MOCK_PRODUCTS = [
  { ico: '🟠', name: 'Besan Ladoo', sku: 'PRD-001', type: 'Consumable', cat: 'Prasad', unit: 'Pcs', qty: 42, reorder: 50, cost: '£0.45', freq: 'Daily', status: 'low' },
  { ico: '🌸', name: 'Rose Garland', sku: 'FLW-001', type: 'Consumable', cat: 'Flowers', unit: 'Garlands', qty: 12, reorder: 10, cost: '£3.00', freq: 'Daily', status: 'ok' },
  { ico: '🕯️', name: 'Camphor Tablets', sku: 'PJA-001', type: 'Consumable', cat: 'Puja Supplies', unit: 'Packets', qty: 0, reorder: 10, cost: '£1.75', freq: 'Daily', status: 'out' },
  { ico: '🧴', name: 'Sesame Oil', sku: 'OIL-001', type: 'Consumable', cat: 'Oil & Lamps', unit: 'Litres', qty: 18, reorder: 5, cost: '£5.00', freq: 'Weekly', status: 'ok' },
  { ico: '🪔', name: 'Brass Lamp 5-wick', sku: 'EQP-001', type: 'Equipment', cat: 'Lamps & Deepam', unit: 'Pcs', qty: 8, reorder: null, cost: '£45.00', freq: 'One-time', status: 'ok' },
  { ico: '🎁', name: 'Prasad Packet Small', sku: 'POS-001', type: 'Sale Item', cat: 'Prasad Packets', unit: 'Packets', qty: 120, reorder: 50, cost: '£0.80', freq: 'Daily', status: 'ok' },
];

export default function InventoryPage() {
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ok" | "low" | "out">("");

  const categories = useMemo(() => {
    return Array.from(new Set(MOCK_PRODUCTS.map((p) => p.cat))).sort();
  }, []);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesType = activeType === "all" || p.type === activeType;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !catFilter || p.cat === catFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesType && matchesSearch && matchesCategory && matchesStatus;
    });
  }, [activeType, search, catFilter, statusFilter]);

  const invToolbarSelect =
    "!text-[11px] !py-[7px] !pl-2 !rounded-lg !font-[inherit] !text-zinc-600 dark:!text-zinc-300";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-[11px] font-bold text-text-tertiary mb-1">
              <span>Inventory</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand">All Products</span>
           </div>
           <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Products & Inventory</h1>
           <p className="text-[12px] text-text-tertiary mt-1">All temple items — consumables, equipment, POS items, office supplies & festival stock</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" leadingIcon={<History className="w-4 h-4" />}>Stock Log</Button>
           <Link href="/temple-admin/inventory/create">
             <Button size="sm" leadingIcon={<Plus className="w-4 h-4" />}>Add Product</Button>
           </Link>
        </div>
      </div>

      {/* ── Module Tabs ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PRODUCT_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap
              ${activeType === type.id 
                ? 'bg-brand-muted border-brand text-brand shadow-sm' 
                : 'bg-surface border-border text-text-secondary hover:border-gray-400 hover:text-text-primary'
              }
            `}
          >
            <span className="text-[13px]">{type.icon}</span>
            <span>{type.label}</span>
            <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black ${activeType === type.id ? 'bg-brand text-white' : 'bg-gray-100 text-text-tertiary'}`}>
              {type.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Metrics Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard title="Total products" value="243" trendLabel="6 product types" chartColor="brand" />
         <MetricCard title="In stock" value="218" trendPercentage={90} trendLabel="In stock items" chartColor="success" />
         <MetricCard title="Low stock" value="14" trendPercentage={-5} trendLabel="Reorder soon" chartColor="warning" />
         <MetricCard title="Out of stock" value="11" trendPercentage={-2} trendLabel="Action needed" chartColor="gray" />
      </div>

      {/* ── Toolbar & Table ────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
           <div className="flex-1 max-w-md">
              <SearchInput 
                placeholder="Search products by name or SKU..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Item</th>
                <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Category</th>
                <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Stock Qty</th>
                <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Unit Cost</th>
                <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-secondary">
              {filteredProducts.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="px-5 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-border flex items-center justify-center text-[18px] shrink-0">{p.ico}</div>
                        <div className="flex flex-col min-w-0">
                           <div className="text-[12px] font-bold text-text-primary truncate">{p.name}</div>
                           <div className="text-[10px] font-mono text-text-placeholder">{p.sku}</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-5 py-4">
                     <div className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold border
                        ${p.cat === 'Prasad' ? 'bg-brand-muted border-brand/20 text-brand' : 
                          p.cat === 'Flowers' ? 'bg-green-50 border-green-200 text-green-700' :
                          'bg-blue-50 border-blue-200 text-blue-700'}
                     `}>
                        {p.cat}
                     </div>
                  </td>
                  <td className="px-5 py-4">
                     <div className={`text-[14px] font-extrabold tracking-tight ${p.status === 'out' ? 'text-status-danger-text' : p.status === 'low' ? 'text-status-warning-text' : 'text-text-primary'}`}>
                        {p.qty} <span className="text-[10px] text-text-placeholder font-medium">{p.unit}</span>
                     </div>
                     {p.reorder && p.status !== 'ok' && (
                        <div className="text-[9px] font-bold text-status-warning-text mt-0.5">Reorder &lt;{p.reorder}</div>
                     )}
                  </td>
                  <td className="px-5 py-4 text-[12px] font-bold text-text-secondary">{p.cost}</td>
                  <td className="px-5 py-4">
                     <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${p.status === 'ok' ? 'bg-status-success-bg text-status-success-text' : 
                          p.status === 'low' ? 'bg-status-warning-bg text-status-warning-text' : 
                          'bg-status-danger-bg text-status-danger-text'}
                     `}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                           p.status === 'ok' ? 'bg-status-success-text' : 
                           p.status === 'low' ? 'bg-status-warning-text' : 
                           'bg-status-danger-text'
                        }`} />
                        {p.status === 'ok' ? 'In Stock' : p.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                     </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                     <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" iconOnly><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" iconOnly><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" iconOnly><MoreVertical className="w-4 h-4" /></Button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-gray-50/20">
           <span className="text-[11px] text-text-tertiary font-bold tracking-tight uppercase">Showing {filteredProducts.length} of 243 items</span>
           <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8 min-w-[32px] px-2 font-bold bg-brand text-white border-brand">1</Button>
              <Button variant="outline" size="sm" className="h-8 min-w-[32px] px-2 font-bold">2</Button>
              <Button variant="outline" size="sm" className="h-8 min-w-[32px] px-2 font-bold">3</Button>
              <span className="mx-1 text-text-placeholder">...</span>
              <Button variant="outline" size="sm" className="h-8 min-w-[32px] px-2 font-bold">24</Button>
           </div>
        </div>
      </div>

    </div>
  );
}
