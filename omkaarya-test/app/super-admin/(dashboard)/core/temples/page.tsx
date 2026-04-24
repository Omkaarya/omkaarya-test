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

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconBg 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: any; 
  iconBg: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
        <p className="text-[11px] mt-1 text-zinc-400 font-medium">{subtitle}</p>
      </div>
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
    case "Prarambha": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "Sankalpa": return "bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-300";
    case "Aaradhana": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300";
    default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Temples</h1>
          <span className="rounded-md bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950/50 dark:text-red-300">{totalAll} temples</span>
        </div>
        <Link href="/super-admin/create-temple" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[var(--brand-primary-hover)] active:scale-95">
          <Plus className="h-4 w-4" /> Create New Temple
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="p-0 border-b border-zinc-100 dark:border-zinc-800">
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

        {loading ? (
          <div className="p-12 text-center text-zinc-400">Syncing temple data...</div>
        ) : error ? (
          <div className="px-6 py-8 text-center text-red-500 font-bold flex flex-col items-center gap-2">
            <AlertTriangle className="w-8 h-8" /> {error}
          </div>
        ) : (
          <AdminDataTable headers={tableHeaders} isEmpty={rows.length === 0} empty={<div className="px-4 py-16 text-center text-zinc-400">No temples found matching filters</div>}>
            {rows.map((row) => (
              <tr key={row.tenantId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 group transition-colors">
                <td className="px-6 py-4"><span className="text-xs font-bold text-zinc-400">#{row.tenantId}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold border border-zinc-200">{initials(row.name)}</span>
                    <div className="min-w-0"><p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{row.name}</p><p className="text-[11px] text-zinc-500 truncate">{row.slug}</p></div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="text-lg leading-none">{row.countryFlag}</span><span className="text-xs font-bold text-zinc-700">{row.city}</span></div></td>
                <td className="px-6 py-4"><span className={`inline-flex rounded-lg px-3 py-1 text-[11px] font-bold ${planPillClass(row.plan)}`}>{row.plan}</span></td>
                <td className="px-6 py-4 tabular-nums text-sm font-bold text-zinc-700">{row.devotees.toLocaleString()}</td>
                <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                <td className="px-6 py-4"><ComplianceBadge compliance={row.compliance} /></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 rounded-lg text-zinc-400 hover:text-[var(--brand-primary)]"><Eye className="h-4 w-4" /></button>
                    <Link href={`/super-admin/edit-temple/${encodeURIComponent(row.tenantId)}`} className="p-2 rounded-lg text-zinc-400 hover:text-[var(--brand-primary)]"><Pencil className="h-4 w-4" /></Link>
                    <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800"><MoreVertical className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminDataTable>
        )}

        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <AdminPagination page={page} pageSize={pageSize} totalPages={totalPages} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      </div>
    </div>
  );
}
