"use client";

import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, ArrowUpRight, Diamond, Home, Armchair, MonitorSpeaker } from "lucide-react";

type AssetTab = "jewellery" | "land" | "metal" | "equipment";

const ASSET_TABS = [
  { id: "jewellery", label: "Jewellery", icon: Diamond },
  { id: "land", label: "Land & Properties", icon: Home },
  { id: "metal", label: "Metal / Furniture", icon: Armchair },
  { id: "equipment", label: "Equipments", icon: MonitorSpeaker },
];

const JEWELLERY_DATA = [
  { id: "AST-01", name: "Gold Chain (Amman)", weight: "50g", value: "LKR 1,250,000", date: "12/03/2020", status: "In Vault" },
  { id: "AST-02", name: "Silver Kavacham", weight: "2.5kg", value: "LKR 850,000", date: "15/06/2018", status: "In Use" },
  { id: "AST-03", name: "Diamond Nose Ring", weight: "5g", value: "LKR 450,000", date: "22/09/2021", status: "In Vault" },
];

const LAND_DATA = [
  { id: "LND-01", name: "Wedding Hall Plot", area: "1.5 Acres", value: "LKR 120,000,000", date: "01/01/2010", status: "Active" },
  { id: "LND-02", name: "Staff Quarters", area: "20 Perches", value: "LKR 45,000,000", date: "15/04/2015", status: "Active" },
];

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<AssetTab>("jewellery");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Assets Management
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Track fixed assets, jewellery, land valuations, and properties.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Register Asset
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
           <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Total Asset Value
           </div>
           <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 relative z-10">LKR 167.5M</div>
           <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
             <ArrowUpRight className="w-3.5 h-3.5" /> +2.4% since last audit
           </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
           <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#FF6B35]"></div> Total Count
           </div>
           <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 relative z-10">482</div>
           <div className="text-[11px] font-bold text-zinc-500 mt-2">Across 4 categories</div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-[24px] border border-zinc-100 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 px-3 pt-2 pb-0 overflow-x-auto">
           {ASSET_TABS.map((tab) => {
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as AssetTab)}
                 className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                   isActive 
                     ? "border-[var(--brand-primary)] text-[var(--brand-primary)]" 
                     : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                 }`}
               >
                 <tab.icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-50"}`} />
                 {tab.label}
               </button>
             );
           })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3 mt-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder={`Search ${ASSET_TABS.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-950 transition-all"
            />
          </div>
          <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Asset Title</th>
                <th className="px-6 py-4">{activeTab === "land" ? "Area (Size)" : "Weight (Est.)"}</th>
                <th className="px-6 py-4">Valuation</th>
                <th className="px-6 py-4">Date Acquired</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              
              {activeTab === "jewellery" && JEWELLERY_DATA.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{row.name}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{row.id}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-300">{row.weight}</td>
                  <td className="px-6 py-4 font-bold text-[var(--brand-primary)]">{row.value}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{row.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${row.status === "In Vault" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-[var(--brand-primary)] transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {activeTab === "land" && LAND_DATA.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{row.name}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{row.id}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-300">{row.area}</td>
                  <td className="px-6 py-4 font-bold text-[var(--brand-primary)]">{row.value}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-500">{row.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-[var(--brand-primary)] transition-colors">
                       <MoreHorizontal className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}

              {(activeTab === "metal" || activeTab === "equipment") && (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 font-medium text-sm">
                       No assets registered in this category yet.
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
