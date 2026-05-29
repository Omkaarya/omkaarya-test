"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Image as ImageIcon, Loader2, Pencil, Plus, X } from "lucide-react";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import { Button } from "@/app/components/ds/atoms/Button";
import type { MasterDeityListPayload, MasterDeityRow } from "@/lib/master-deities";
import DeitiesFiltersBar, { type DeitiesSortBy, type DeityStatusFilter } from "./DeitiesFiltersBar";
import DeityUpsertModal, { type DeityModalMode } from "./DeityUpsertModal";
import StatusBadge from "@/app/components/admin/StatusBadge";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";

type ModalState = { open: true; mode: DeityModalMode; row: MasterDeityRow | null } | { open: false };

export default function DeitiesMasterPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeityStatusFilter>("all");
  const [sortBy, setSortBy] = useState<DeitiesSortBy>("name");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<MasterDeityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [imagePreview, setImagePreview] = useState<{ src: string; title: string } | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!actionMenuId) return;
    const onDocClick = () => setActionMenuId(null);
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, [actionMenuId]);

  useEffect(() => {
    if (!imagePreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImagePreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imagePreview]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      q: search,
      status: statusFilter,
      country: "all",
      sortBy,
      page: String(page),
      pageSize: String(pageSize),
    });
    try {
      const res = await fetch(`/api/super-admin/deities?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        data?: MasterDeityListPayload;
        error?: { message?: string };
      };
      if (!res.ok || !json.success || !json.data) {
        setError(json.error?.message ?? "Failed to load deities.");
        setRows([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      const d = json.data;
      setRows(Array.isArray(d.data) ? d.data : []);
      setTotal(d.total);
      setTotalAll(d.totalAll);
      setTotalPages(d.totalPages);
      if (page > d.totalPages) {
        setPage(d.totalPages);
      }
    } catch {
      setError("Network error — could not load deities.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const openModal = (mode: DeityModalMode, row: MasterDeityRow | null) => {
    setActionMenuId(null);
    setModal({ open: true, mode, row });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved when row action menu is restored
  const patchActive = async (row: MasterDeityRow, next: boolean) => {
    setActionBusyId(row.id);
    setActionMenuId(null);
    try {
      const res = await fetch(`/api/super-admin/deities/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.error?.message ?? "Update failed.");
        return;
      }
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setActionBusyId(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for action menu
  const softDelete = async (row: MasterDeityRow) => {
    if (!window.confirm(`Deactivate “${row.name}”? It will be hidden from temple onboarding.`)) return;
    setActionBusyId(row.id);
    setActionMenuId(null);
    try {
      const res = await fetch(`/api/super-admin/deities/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.error?.message ?? "Could not deactivate.");
        return;
      }
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setActionBusyId(null);
    }
  };

  const columns: ColumnDef<MasterDeityRow>[] = useMemo(
    () => [
      {
        key: "displayCode",
        header: "Deity ID",
        cell: (d) => (
          <span className="font-mono text-xs font-semibold text-text-tertiary">{d.displayCode}</span>
        ),
      },
      {
        key: "image",
        header: "Image",
        cell: (d) =>
          d.imageDataUrl ? (
            <button
              type="button"
              className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border ring-offset-background transition hover:border-[var(--brand-primary)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
              aria-label={`View full image: ${d.name}`}
              title="View image"
              onClick={(e) => {
                e.stopPropagation();
                setImagePreview({ src: d.imageDataUrl, title: d.name });
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.imageDataUrl}
                alt=""
                className="h-full w-full object-cover transition group-hover:opacity-90"
              />
            </button>
          ) : (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gradient-to-br ${d.placeholderHue ?? "from-zinc-400 to-zinc-600"} text-[10px] font-bold text-white shadow-sm`}
              aria-hidden
            >
              <ImageIcon className="h-4 w-4 text-white/90" />
            </div>
          ),
      },
      {
        key: "name",
        header: "Name",
        className: "max-w-[16rem]",
        cell: (d) => (
          <div className="min-w-0">
            <TruncateText className="text-sm font-bold text-text-primary" title={d.name}>
              {d.name}
            </TruncateText>
            {d.secondaryLabel ? (
              <TruncateText className="text-xs text-text-tertiary" title={d.secondaryLabel}>
                {d.secondaryLabel}
              </TruncateText>
            ) : null}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (d) => <StatusBadge status={d.isActive ? "Active" : "Inactive"} />,
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (d) => (
          <div className="relative flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
            {actionBusyId === d.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-text-quaternary" />
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label="View deity"
                  title="View"
                  onClick={() => openModal("view", d)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Edit deity"
                  title="Edit"
                  onClick={() => openModal("edit", d)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {/* <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionMenuId((cur) => (cur === d.id ? null : d.id));
                  }}
                  className="rounded-lg p-2 text-text-quaternary hover:bg-subtle hover:text-text-primary"
                  aria-label="More actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button> */}
                {/* {actionMenuId === d.id ? (
                  <div
                    className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-surface py-1 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {d.isActive ? (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30"
                        onClick={() => void softDelete(d)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                        onClick={() => void patchActive(d, true)}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                ) : null} */}
              </>
            )}
          </div>
        ),
      },
    ],
    [actionBusyId],
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <DashboardPageHeader
        title="Deities"
        titleAccessory={
          <span className="rounded-full border border-border bg-subtle px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {totalAll} deities
          </span>
        }
        description="Manage and monitor deities here."
        actions={
          <Button
            type="button"
            leadingIcon={<Plus className="h-4 w-4" />}
            onClick={() => openModal("create", null)}
          >
            Add New Deity
          </Button>
        }
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <AdminListCard>
        <DeitiesFiltersBar
          search={searchInput}
          onSearchChange={setSearchInput}
          status={statusFilter}
          onStatusChange={(s) => {
            setStatusFilter(s);
            setPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={(s) => {
            setSortBy(s);
            setPage(1);
          }}
        />

        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-text-tertiary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading deities…</span>
          </div>
        ) : (
          <DataTable<MasterDeityRow>
            columns={columns}
            data={rows}
            keyExtractor={(d) => d.id}
            tableClassName="min-w-[720px]"
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
          {total} filtered results{sortBy === "timeline" ? " (newest first)" : ""} · {totalAll} total
        </p>
      </AdminListCard>

      {modal.open ? (
        <DeityUpsertModal
          open
          mode={modal.mode}
          initial={modal.row}
          onClose={() => setModal({ open: false })}
          onSaved={() => void load()}
        />
      ) : null}

      {imagePreview ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setImagePreview(null)}
            aria-label="Close image preview"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Image: ${imagePreview.title}`}
            className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 shadow-2xl dark:border-zinc-800"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
              <p className="min-w-0 truncate text-sm font-semibold text-zinc-100">{imagePreview.title}</p>
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="shrink-0 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-zinc-950 p-4 sm:p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview.src}
                alt={imagePreview.title}
                className="max-h-[min(78vh,760px)] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
