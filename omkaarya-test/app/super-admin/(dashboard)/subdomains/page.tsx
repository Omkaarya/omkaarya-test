"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import type { MockTemple } from "@/lib/mock-temples";
import type { TemplesListResponse, TemplesSortBy } from "@/lib/temples-query";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import AdminFiltersBar from "@/app/components/admin/AdminFiltersBar";
import AdminPagination from "@/app/components/admin/AdminPagination";
import StatusBadge from "@/app/components/admin/StatusBadge";

type StatusFilter = "all" | "Active" | "Trial" | "Suspended";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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

export default function SubdomainsPage() {
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
        const response = await fetch(`/api/temples?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load temples");
        }
        const j = (await response.json()) as
          | { success: true; data: TemplesListResponse; message: string; reason: string }
          | (TemplesListResponse & { success?: never });
        const payload = "success" in j && j.success === true && j.data ? j.data : (j as TemplesListResponse);
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
          setError("Could not load subdomains. Please try again.");
          setRows([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [search, statusFilter, country, sortBy, page, pageSize]);

  const subdomainColumns: ColumnDef<MockTemple>[] = useMemo(
    () => [
      {
        key: "temple",
        header: "Temple",
        cell: (row) => (
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
              aria-hidden
            >
              {initials(row.name)}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Temp ID {row.tenantId}</p>
            </div>
          </div>
        ),
      },
      {
        key: "subdomain",
        header: "Subdomain",
        cell: (row) => (
          <span className="text-sm text-zinc-800 dark:text-zinc-200">{row.subdomain || "—"}</span>
        ),
      },
      {
        key: "portalHost",
        header: "Portal",
        cell: (row) =>
          row.portalHost ? (
            <a
              href={`https://${row.portalHost}`}
              className="block max-w-[16rem] truncate text-[var(--brand-primary)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {row.portalHost}
            </a>
          ) : (
            <span className="text-sm text-zinc-500">—</span>
          ),
      },
      {
        key: "city",
        header: "City",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {row.countryFlag}
            </span>
            <span className="text-zinc-800 dark:text-zinc-200">{row.city}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (row) => (
          <Link
            href={`/super-admin/edit-temple/${encodeURIComponent(row.tenantId)}`}
            aria-label={`Edit ${row.name}`}
            className="inline-flex rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))]">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Subdomains
              </h1>
              <span className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {totalAll} temples
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Portal host (<span className="font-medium">*.omkaarya.com</span>) for each temple, from the database.
            </p>
          </div>
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
          <DataTable<MockTemple>
            columns={subdomainColumns}
            data={rows}
            keyExtractor={(row) => row.tenantId}
            className="min-w-[640px]"
          />
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
