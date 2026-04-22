"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, ExternalLink, ShieldCheck } from "lucide-react";

const STORES_DATA = [
  { id: "STR-01", name: "Main Counter", desc: "Front desk billing and general pooja tickets.", manager: "Siva Thirumaran", role: "Super Admin", status: "Active" },
  { id: "STR-02", name: "Prashadham Stall", desc: "Dedicated counter for prasad distribution.", manager: "Arun Prasad", role: "Manager", status: "Active" },
  { id: "STR-03", name: "Events Desk", desc: "Kiosk for special event bookings.", manager: "Meena Lakshmi", role: "Manager", status: "Inactive" },
];

export default function StoresListPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Stores & Sales Counters
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Manage physical inventory locations and point-of-sale registers.
          </p>
        </div>
        <Link
          href="/temple-admin/inventory/stores/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Store Location
        </Link>
      </div>

      {/* ── Data Box ── */}
      <div className="rounded-[24px] border border-zinc-100 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search stores or counters..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-950 transition-all"
            />
          </div>
          <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Associated Manager</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {STORES_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{row.name}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{row.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-zinc-600 dark:text-zinc-300">
                      {row.desc}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                       <div className="font-bold text-zinc-900 dark:text-zinc-100">
                         {row.manager}
                       </div>
                       <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                         {row.role === "Super Admin" && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />} {row.role}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${row.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${row.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button title="View Details" className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-[var(--brand-primary)] transition-colors">
                         <ExternalLink className="w-4 h-4" />
                       </button>
                       <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                         <MoreHorizontal className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-xs font-semibold text-zinc-500">Showing 1 to 3 of 3 stores</span>
          <div className="flex gap-1">
            <button disabled className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-300 dark:border-zinc-800 dark:text-zinc-700">Prev</button>
            <button className="px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-bold">1</button>
            <button disabled className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-300 dark:border-zinc-800 dark:text-zinc-700">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
