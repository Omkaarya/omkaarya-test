"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, ShieldCheck, Mail, Phone } from "lucide-react";

const STAFF_DATA = [
  { id: "EMP-01", name: "Siva Thirumaran", role: "Temple Admin", email: "admin@omkaarya.lk", phone: "+94 77 111 2222", status: "Active" },
  { id: "EMP-02", name: "Gurukkal Sharma", role: "Head Priest", email: "headpriest@omkaarya.lk", phone: "+94 71 222 3333", status: "Active" },
  { id: "EMP-03", name: "Arun Prasad", role: "Manager", email: "arun@omkaarya.lk", phone: "+94 76 333 4444", status: "Active" },
  { id: "EMP-04", name: "Meena Lakshmi", role: "Accountant", email: "finance@omkaarya.lk", phone: "+94 77 444 5555", status: "Active" },
  { id: "EMP-05", name: "Raja Kumar", role: "Counter Staff", email: "pos1@omkaarya.lk", phone: "+94 71 555 6666", status: "Active" },
];

export default function StaffListPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Temple Staffs
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your internal team members, priests, and portal access.
          </p>
        </div>
        <Link
          href="/temple-admin/peoples/staff/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add User
        </Link>
      </div>

      {/* ── Pricing Ticker / Stats  ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
           <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Seats Used</div>
           <div className="flex items-baseline gap-2">
             <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">5</div>
             <div className="text-sm font-bold text-zinc-500">of 10</div>
           </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
           <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Active Accounts</div>
           <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">05</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 shadow-sm">
           <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)] mb-1">Pricing Plan</div>
           <div className="text-lg font-black text-zinc-900 dark:text-zinc-50 mb-0.5">Aaradhana (Enterprise)</div>
           <div className="text-[11px] font-bold text-zinc-500">Custom RBAC Enabled</div>
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
              placeholder="Search staff members..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-950 transition-all"
            />
          </div>
          <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors">
            <Filter className="h-4 w-4" /> Role
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Contact Logic</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {STAFF_DATA.map((row, i) => (
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
                    <div className="flex flex-col gap-1">
                       <div className="font-bold text-zinc-900 dark:text-zinc-100">
                         {row.role}
                       </div>
                       <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-primary)]">
                         {row.role === "Temple Admin" && <ShieldCheck className="w-3.5 h-3.5" />} {row.role === "Temple Admin" ? "Full Access" : "Restricted"}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
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
                    <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-xs font-semibold text-zinc-500">Showing 1 to 5 of 5 staff</span>
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
