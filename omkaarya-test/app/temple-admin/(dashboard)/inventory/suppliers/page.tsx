"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, ExternalLink } from "lucide-react";

const SUPPLIERS_DATA = [
  { id: "S-101", name: "Srinivasa Flower Traders", type: "Flowers & Garlands", onboard: "12/03/2026", email: "contact@srinivasaflowers.lk", phone: "+94 77 123 4567", status: "Active" },
  { id: "S-102", name: "Omkara Pooja Samagiri", type: "Pooja Items", onboard: "15/03/2026", email: "orders@omkarapooja.lk", phone: "+94 71 987 6543", status: "Active" },
  { id: "S-103", name: "Lanka Dairy Co.", type: "Milk & Ghee", onboard: "18/03/2026", email: "sales@lankadairy.lk", phone: "+94 76 543 2109", status: "Inactive" },
  { id: "S-104", name: "Kovil Publications", type: "Books & Calendars", onboard: "22/03/2026", email: "kovilpubs@gmail.com", phone: "+94 77 111 2222", status: "Active" },
];

export default function SuppliersListPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Suppliers Directory
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Manage vendors providing consumables, raw materials, and retail items.
          </p>
        </div>
        <Link
          href="/temple-admin/inventory/suppliers/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Supplier
        </Link>
      </div>

      {/* ── Ticker / Stats (Optional Flair) ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
           <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Total Suppliers</div>
           <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">14</div>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
           <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Active Vendors</div>
           <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">12</div>
        </div>
        <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-5 shadow-sm flex flex-col justify-center relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 text-zinc-800/50 dark:text-zinc-200/50">
             <DatabaseIcon />
           </div>
           <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 relative z-10">Last Auto-Sync</div>
           <div className="text-lg font-black text-white dark:text-zinc-900 relative z-10">Today, 09:00 AM</div>
        </div>
      </div>

      {/* ── Data Box ── */}
      <div className="rounded-[24px] border border-zinc-100 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by supplier name or email..."
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
                <th className="px-6 py-4">Supplier Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Onboarded</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {SUPPLIERS_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[var(--brand-primary)] font-black">
                         {row.name.charAt(0)}
                       </div>
                       <div>
                         <div className="font-bold text-zinc-900 dark:text-zinc-100">{row.name}</div>
                         <div className="text-[11px] font-mono text-zinc-400">{row.id}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-300">
                    {row.onboard}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-[var(--brand-primary)] cursor-pointer transition-colors">
                         <Mail className="w-3.5 h-3.5" /> {row.email}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                         <Phone className="w-3.5 h-3.5" /> {row.phone}
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
          <span className="text-xs font-semibold text-zinc-500">Showing 1 to 4 of 14 suppliers</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:border-zinc-800">Prev</button>
            <button className="px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-bold">1</button>
            <button className="px-3 py-1.5 rounded-lg text-zinc-500 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}

function DatabaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
  )
}
