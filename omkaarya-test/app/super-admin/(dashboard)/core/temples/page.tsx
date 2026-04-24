"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { 
  Eye, 
  MoreVertical, 
  Pencil, 
  Plus, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  Users2, 
  MapPin, 
  CreditCard, 
  Building2,
  AlertTriangle,
  Search,
  ArrowRight,
  History
} from "lucide-react";
import type { MockTemple, TemplePlan } from "@/lib/mock-temples";
import type { TemplesListResponse, TemplesSortBy } from "@/lib/temples-query";
import AdminDataTable from "@/app/components/admin/AdminDataTable";
import AdminFiltersBar from "@/app/components/admin/AdminFiltersBar";
import AdminPagination from "@/app/components/admin/AdminPagination";
import ComplianceBadge from "@/app/components/admin/ComplianceBadge";
import StatusBadge from "@/app/components/admin/StatusBadge";

// ── Components ─────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="w-full space-y-4 px-8 py-6">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-10 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function planPillClass(plan: TemplePlan): string {
  switch (plan) {
    case "Prarambha": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "Sankalpa": return "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300";
    case "Aaradhana": return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";
    default: return "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

export default function TemplesAdminPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Trial" | "Suspended">("all");
  const [country, setCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<TemplesSortBy>("last7");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<MockTemple[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [totalAll, setTotalAll] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          q: search, status: statusFilter, country, sortBy, page: String(page), pageSize: String(pageSize),
        });
        const response = await fetch(`/api/temples?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed to load temples");
        const j = await response.json();
        const payload = j.success ? j.data : j;
        setRows(payload.data);
        setCountries(payload.countries);
        setTotalAll(payload.totalAll);
        setTotalPages(payload.totalPages);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Could not reach the API server. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [search, statusFilter, country, sortBy, page, pageSize]);

  const tableHeaders = useMemo(() => ["Tenant ID", "Temples Name", "Country", "Plan", "Devotees", "Status", "Compliance", "Actions"], []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      
      {/* INTEGRATED CARD MODULE (Source: Latest Figma Reference) */}
      <div className="rounded-[32px] border border-zinc-100 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.03)] dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        
        {/* Module Header Section */}
        <div className="p-8 pb-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Temples</h1>
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-300 uppercase tracking-tight">{totalAll} temples</span>
            </div>
            <p className="text-sm font-medium text-zinc-400">Manage and monitor your temples here.</p>
          </div>
          <Link href="/super-admin/create-temple" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-[13px] font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95">
            <Plus className="h-4 w-4" /> Create Temple
          </Link>
        </div>

        {/* Toolbar Section (Filters) */}
        <div className="px-8 pb-6 border-b border-zinc-50 dark:border-zinc-800/50">
          <AdminFiltersBar 
            search={searchInput} 
            onSearchChange={setSearchInput} 
            status={statusFilter} 
            onStatusChange={setStatusFilter} 
            country={country} 
            onCountryChange={setCountry} 
            countries={countries} 
            sortBy={sortBy} 
            onSortByChange={(val) => setSortBy(val as TemplesSortBy)} 
          />
        </div>

        {/* Table Content Section */}
        <div className="relative min-h-[500px]">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="p-20 text-center text-red-500 font-bold flex flex-col items-center gap-2">
              <AlertTriangle className="w-10 h-10" /> {error}
            </div>
          ) : (
            <AdminDataTable headers={tableHeaders} isEmpty={rows.length === 0} empty={<div className="p-20 text-center text-zinc-400 font-bold">No temples found matching filters</div>}>
              {rows.map((row) => (
                <tr key={row.tenantId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 group transition-all duration-200">
                  <td className="px-8 py-5"><span className="text-[12px] font-bold text-zinc-400 tracking-tight">Temp ID {row.tenantId}</span></td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-xs font-black border border-zinc-200 text-zinc-500">{initials(row.name)}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">{row.name}</p>
                        <p className="text-[11px] text-zinc-400 font-medium truncate tracking-tight">{row.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[13px] font-bold text-zinc-500">Chennai</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-tight ${planPillClass(row.plan)}`}>
                      {row.plan}
                    </span>
                  </td>
                  <td className="px-8 py-5 tabular-nums text-[13px] font-bold text-zinc-500">{row.devotees.toLocaleString()}</td>
                  <td className="px-8 py-5"><StatusBadge status={row.status} /></td>
                  <td className="px-8 py-5"><ComplianceBadge compliance={row.compliance} /></td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 rounded-xl text-zinc-400 hover:text-orange-500 hover:bg-orange-50 transition-all"><Eye className="h-4.5 w-4.5" /></button>
                      <Link href={`/super-admin/edit-temple/${encodeURIComponent(row.tenantId)}`} className="p-2.5 rounded-xl text-zinc-400 hover:text-orange-500 hover:bg-orange-50 transition-all"><Pencil className="h-4.5 w-4.5" /></Link>
                      <button className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"><MoreVertical className="h-4.5 w-4.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </AdminDataTable>
          )}
        </div>

        {/* Pagination Section */}
        <div className="px-8 py-6 border-t border-zinc-50 dark:border-zinc-800/50 bg-white/50">
          <AdminPagination page={page} pageSize={pageSize} totalPages={totalPages} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      </div>

    </div>
  );
}
