"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, MoreVertical, Pencil, Plus } from "lucide-react";
import type { MockTemple, TemplePlan } from "@/lib/mock-temples";
import { apiUrl } from "@/lib/api-base";
import type { TemplesListResponse, TemplesSortBy } from "@/lib/temples-query";
import AdminDataTable from "@/app/components/admin/AdminDataTable";
import AdminFiltersBar from "@/app/components/admin/AdminFiltersBar";
import AdminPagination from "@/app/components/admin/AdminPagination";
import ComplianceBadge from "@/app/components/admin/ComplianceBadge";
import StatusBadge from "@/app/components/admin/StatusBadge";

type StatusFilter = "all" | "Active" | "Trial" | "Suspended";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function planPillClass(plan: TemplePlan): string {
  switch (plan) {
    case "Aaaradhana":
      return "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300";
    case "Sankalpa":
      return "bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-300";
    case "Mandala":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-2 px-4 py-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function TemplesAdminPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [country, setCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<TemplesSortBy>("last7");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<MockTemple[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: search,
        status: statusFilter,
        country,
        sortBy,
        page: String(page),
        pageSize: String(pageSize),
      });

      try {
        const response = await fetch(apiUrl(`/api/temples?${params.toString()}`), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load temples");
        }
        const payload = (await response.json()) as TemplesListResponse;
        setRows(payload.data);
        setCountries(payload.countries);
        setTotal(payload.total);
        setTotalAll(payload.totalAll);
        setTotalPages(payload.totalPages);
        if (page > payload.totalPages) {
          setPage(payload.totalPages);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Could not fetch temples. Please try again.");
          setRows([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [search, statusFilter, country, sortBy, page, pageSize]);

  const tableHeaders = useMemo(
    () => ["Tenant ID", "Temples Name", "Country", "Plan", "Devotees", "Status", "Compliance", "Actions"],
    []
  );

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))]">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Temples
              </h1>
              <span className="rounded-md bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950/50 dark:text-red-300">
                {totalAll} temples
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage and monitor your temples here.
            </p>
          </div>
          <Link
            href="/super-admin/create-temple"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Create Temple
          </Link>
        </div>

        <AdminFiltersBar
          search={searchInput}
          onSearchChange={setSearchInput}
          status={statusFilter}
          onStatusChange={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          country={country}
          onCountryChange={(nextCountry) => {
            setCountry(nextCountry);
            setPage(1);
          }}
          countries={countries}
          sortBy={sortBy}
          onSortByChange={(nextSortBy) => {
            setSortBy(nextSortBy as TemplesSortBy);
            setPage(1);
          }}
        />

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <p className="px-4 py-10 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <AdminDataTable
            headers={tableHeaders}
            isEmpty={rows.length === 0}
            empty={
              <p className="px-4 py-12 text-center text-sm text-zinc-500">
                No temples match your filters.
              </p>
            }
          >
            {rows.map((row) => (
              <tr key={row.tenantId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Temp ID {row.tenantId}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                      aria-hidden
                    >
                      {initials(row.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</p>
                      <a
                        href={`https://${row.slug}`}
                        className="truncate text-xs text-zinc-500 hover:text-[var(--brand-primary)] dark:text-zinc-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {row.slug}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden>
                      {row.countryFlag}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200">{row.city}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${planPillClass(
                      row.plan
                    )}`}
                  >
                    {row.plan}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-800 dark:text-zinc-200">
                  {row.devotees.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <ComplianceBadge compliance={row.compliance} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`View ${row.name}`}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${row.name}`}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`More options for ${row.name}`}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminDataTable>
        )}

        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
        <p className="px-4 pb-4 text-xs text-zinc-500 dark:text-zinc-400">{total} filtered results</p>
      </div>
    </div>
  );
}
