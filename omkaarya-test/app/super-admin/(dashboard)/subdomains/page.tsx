"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import type { MockTemple } from "@/lib/mock-temples";
import type { TemplesListResponse, TemplesSortBy } from "@/lib/temples-query";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { EntityNameCell } from "@/app/components/ds/molecules/TableCells";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminFiltersBar from "@/app/components/admin/AdminFiltersBar";
import AdminPagination from "@/app/components/admin/AdminPagination";
import StatusBadge from "@/app/components/admin/StatusBadge";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import { TEMPLE_NAME_DISPLAY_MAX, truncateToMaxLength } from "@/lib/truncate-display";

type StatusFilter = "all" | "Active" | "Trial" | "Suspended";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function SubdomainsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [country, setCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<TemplesSortBy>("timeline");
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
        width: "30ch",
        className: "min-w-[30ch] w-[30ch]",
        cell: (row) => (
          <EntityNameCell
            initials={initials(row.name)}
            title={truncateToMaxLength(row.name, TEMPLE_NAME_DISPLAY_MAX)}
            titleTooltip={row.name}
            subtitle={row.subdomain || row.portalHost || "—"}
          />
        ),
      },
      {
        key: "subdomain",
        header: "Subdomain",
        cell: (row) => (
          <span className="text-sm text-text-primary">{row.subdomain || "—"}</span>
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
            <span className="text-sm text-text-tertiary">—</span>
          ),
      },
      {
        key: "city",
        header: "City",
        className: "max-w-[12rem]",
        cell: (row) => (
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-lg leading-none" aria-hidden>
              {row.countryFlag || "🌐"}
            </span>
            <span className="min-w-0 truncate text-sm text-text-primary" title={row.city || undefined}>
              {row.city || "—"}
            </span>
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
            className="inline-flex rounded-lg p-2 text-text-quaternary hover:bg-subtle hover:text-text-primary"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <DashboardPageHeader
        title="Subdomains"
        titleAccessory={
          <span className="rounded-full border border-border bg-subtle px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {totalAll} temples
          </span>
        }
        description={
          <>
            Portal host (<span className="font-medium">*.omkaarya.com</span>) for each temple, from the database.
          </>
        }
      />

      <AdminListCard>
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

        {error ? (
          <p className="px-6 py-10 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <DataTable<MockTemple>
            columns={subdomainColumns}
            data={rows}
            keyExtractor={(row) => row.tenantId}
            tableClassName="min-w-[640px]"
            isLoading={loading}
            loadingRows={pageSize}
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
        <p className="border-t border-border px-4 py-3 text-xs text-text-tertiary">
          {total} filtered results{sortBy === "timeline" ? " (newest first)" : ""} · {totalAll} total on platform
        </p>
      </AdminListCard>
    </div>
  );
}
