"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import type { MockTemple, TemplePlan } from "@/lib/mock-temples";
import type { TemplesListResponse, TemplesSortBy } from "@/lib/temples-query";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { EntityNameCell } from "@/app/components/ds/molecules/TableCells";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import AdminListCard from "@/app/components/admin/AdminListCard";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import AdminFiltersBar from "@/app/components/admin/AdminFiltersBar";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge, type BadgeColor } from "@/app/components/ds/atoms/Badge";
import StatusBadge from "@/app/components/admin/StatusBadge";
import ComplianceBadge from "@/app/components/admin/ComplianceBadge";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { TEMPLE_NAME_DISPLAY_MAX, truncateToMaxLength } from "@/lib/truncate-display";

type StatusFilter = "all" | "Active" | "Trial" | "Suspended";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function planBadgeColor(plan: string): BadgeColor {
  switch (plan) {
    case "Aaradhana":
      return "purple";
    case "Sankalpa":
      return "pink";
    case "Prarambha":
      return "indigo";
    case "Free":
      return "gray";
    default:
      return "gray";
  }
}

export default function TemplesAdminPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [country, setCountry] = useState<string>("all");
  /** Default `name` lists all temples; `timeline` sorts by created_at descending (newest first). */
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, statusFilter, country, sortBy, page, pageSize, refreshKey]);

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
  }, [search, statusFilter, country, sortBy, page, pageSize, refreshKey]);

  const handleDelete = async (tenantId: string, templeName: string) => {
    const label = templeName.trim() || "this temple";
    if (
      !confirm(
        `Permanently delete "${label}"? This removes billing records and the temple database. This cannot be undone.`
      )
    ) {
      return;
    }
    setDeletingId(tenantId);
    setActionError(null);
    try {
      const res = await fetch(`/api/temples/${encodeURIComponent(tenantId)}`, { method: "DELETE" });
      const data: unknown = await res.json();
      if (!res.ok) {
        setActionError(jsonApiErrorMessage(data) || "Failed to delete temple");
        return;
      }
      setRefreshKey((k) => k + 1);
    } catch {
      setActionError("Network error — could not delete temple.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.length;
    if (
      !confirm(
        `Permanently delete the ${count} selected ${
          count === 1 ? "temple" : "temples"
        }? This will remove all associated billing records and databases. This cannot be undone.`
      )
    ) {
      return;
    }
    setBulkDeleting(true);
    setActionError(null);
    try {
      const deletePromises = selectedIds.map(async (id) => {
        const res = await fetch(`/api/temples/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(jsonApiErrorMessage(data) || `Failed to delete temple ${id}`);
        }
      });
      await Promise.all(deletePromises);
      setSelectedIds([]);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete one or more temples.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const columns: ColumnDef<MockTemple>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Temple",
        width: "30ch",
        className: "min-w-[30ch] w-[30ch]",
        cell: (row) => (
          <EntityNameCell
            initials={initials(row.name)}
            title={truncateToMaxLength(row.name, TEMPLE_NAME_DISPLAY_MAX)}
            titleTooltip={row.name}
            subtitle={row.portalHost || "—"}
          />
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
            <TruncateText className="text-sm text-text-primary" title={row.city || undefined}>
              {row.city || "—"}
            </TruncateText>
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
        key: "trialEndsAt",
        header: "Trial ends",
        cell: (row) => {
          if (row.status !== "Trial" || !row.trialEndsAt) {
            return <span className="text-sm text-text-muted">—</span>;
          }
          const d = new Date(row.trialEndsAt);
          const label = Number.isNaN(d.getTime())
            ? "—"
            : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
          return <span className="text-sm text-text-primary">{label}</span>;
        },
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
            {deletingId === row.tenantId ? (
              <Loader2 className="h-4 w-4 animate-spin text-text-quaternary" aria-hidden />
            ) : (
              <>
                <Link
                  href={`/super-admin/view-temple/${encodeURIComponent(row.tenantId)}`}
                  aria-label="View temple"
                  title="View temple"
                >
                  <Button variant="ghost" size="sm" iconOnly aria-label="View temple">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/super-admin/edit-temple/${encodeURIComponent(row.tenantId)}`}
                  aria-label="Edit temple"
                  title="Edit temple"
                >
                  <Button variant="ghost" size="sm" iconOnly aria-label="Edit temple">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Delete temple"
                  title="Delete temple"
                  className="hover:text-red-600"
                  onClick={() => void handleDelete(row.tenantId, row.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [deletingId]
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
        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-4 border-b border-border bg-orange-50/70 px-6 py-4 animate-in slide-in-from-top-4 duration-300 dark:bg-orange-950/20">
            <span className="text-sm font-semibold text-text-primary">
              {selectedIds.length} {selectedIds.length === 1 ? "temple" : "temples"} selected
            </span>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Bulk Delete
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              disabled={bulkDeleting}
            >
              Cancel
            </Button>
          </div>
        ) : (
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
        )}

        {error ? (
          <p className="px-6 py-10 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : actionError ? (
          <p className="px-6 py-3 text-center text-sm text-red-600 dark:text-red-400">{actionError}</p>
        ) : null}

        {!error ? (
          <DataTable<MockTemple>
            columns={columns}
            data={rows}
            keyExtractor={(row) => row.tenantId}
            tableClassName="min-w-[960px]"
            isLoading={loading}
            loadingRows={pageSize}
            isSelectable
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
          />
        ) : null}

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
