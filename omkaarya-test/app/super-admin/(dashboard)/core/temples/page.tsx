"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus } from "lucide-react";

import type { MockTemple, TemplePlan } from "@/lib/mock-temples";
import type { TemplesListResponse, TemplesSortBy } from "@/lib/temples-query";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import AdminListCard from "@/app/components/admin/AdminListCard";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import AdminFiltersBar from "@/app/components/admin/AdminFiltersBar";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge, type BadgeColor } from "@/app/components/ds/atoms/Badge";
import StatusBadge from "@/app/components/admin/StatusBadge";
import ComplianceBadge from "@/app/components/admin/ComplianceBadge";

type StatusFilter = "all" | "Active" | "Trial" | "Suspended";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function planBadgeColor(plan: TemplePlan): BadgeColor {
  switch (plan) {
    case "Aaradhana":
      return "purple";
    case "Sankalpa":
      return "pink";
    case "Prarambha":
      return "indigo";
    case "Free":
    default:
      return "gray";
  }
}

export default function TemplesAdminPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [country, setCountry] = useState<string>("all");
  /** Default `name` lists all temples; `last7` intentionally hides rows older than 7 days. */
  const [sortBy, setSortBy] = useState<TemplesSortBy>("name");
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
        if (!response.ok) throw new Error("Failed to load temples");
        const j = (await response.json()) as
          | { success: true; data: TemplesListResponse; message: string; reason: string }
          | (TemplesListResponse & { success?: never });
        const payload =
          "success" in j && j.success === true && j.data ? j.data : (j as TemplesListResponse);
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
          setError("Failed to load data.");
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

  const columns: ColumnDef<MockTemple>[] = useMemo(
    () => [
      {
        key: "tenantId",
        header: "Tenant ID",
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-text-tertiary">Temp ID {row.tenantId}</span>
        ),
      },
      {
        key: "name",
        header: "Temple",
        cell: (row) => (
          <div className="flex min-w-0 max-w-[18rem] items-start gap-3 whitespace-normal">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-text-secondary"
              aria-hidden
            >
              {initials(row.name)}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary">{row.name}</p>
              {row.portalHost ? (
                <p className="truncate text-xs text-text-tertiary">{row.portalHost}</p>
              ) : (
                <p className="text-xs text-text-tertiary">—</p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "city",
        header: "Country",
        cell: (row) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-lg leading-none" aria-hidden>
              {row.countryFlag || "🌐"}
            </span>
            <span className="text-sm text-text-primary">{row.city}</span>
          </div>
        ),
      },
      {
        key: "plan",
        header: "Plan",
        cell: (row) => (
          <Badge color={planBadgeColor(row.plan)} size="sm">
            {row.plan}
          </Badge>
        ),
      },
      {
        key: "devotees",
        header: "Devotees",
        cell: (row) => (
          <span className="text-sm font-medium tabular-nums text-text-primary">
            {row.devotees.toLocaleString()}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "compliance",
        header: "Compliance",
        cell: (row) => <ComplianceBadge compliance={row.compliance} />,
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/super-admin/edit-temple/${encodeURIComponent(row.tenantId)}?view=1`}
              aria-label="View temple"
              title="View temple"
            >
              <Button variant="ghost" size="sm" iconOnly aria-label="View temple">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/super-admin/edit-temple/${encodeURIComponent(row.tenantId)}`} aria-label="Edit temple" title="Edit temple">
              <Button variant="ghost" size="sm" iconOnly aria-label="Edit temple">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <DashboardPageHeader
        title="Temples"
        titleAccessory={
          <span className="rounded-full border border-border bg-subtle px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {totalAll} temples
          </span>
        }
        description="Manage and monitor your temples here."
        actions={
          <Link href="/super-admin/create-temple">
            <Button leadingIcon={<Plus className="h-4 w-4" />}>Create Temple</Button>
          </Link>
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
            columns={columns}
            data={rows}
            keyExtractor={(row) => row.tenantId}
            tableClassName="min-w-[960px]"
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
          {total} filtered results{sortBy === "last7" ? " (created in the last 7 days)" : ""} · {totalAll} total on platform
        </p>
      </AdminListCard>
    </div>
  );
}
