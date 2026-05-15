"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, CheckCircle2, XCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { AdminTableToolbar, AdminTableToolbarEnd, AdminTableToolbarStart } from "@/app/components/admin/AdminTableToolbar";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

type DeleteRequest = {
  id: string;
  temple: string;
  email: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

type ListPayload = {
  items: Array<{
    id: string;
    templeName: string;
    email: string;
    reason: string;
    status: DeleteRequest["status"];
    requestedAt: string;
  }>;
  totalFiltered: number;
  totalAll: number;
  pendingCount: number;
  processedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const STATUS_STYLES: Record<DeleteRequest["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400",
  Rejected: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400",
};

const STATUS_ICONS = {
  Pending: <Clock className="h-3 w-3" />,
  Approved: <CheckCircle2 className="h-3 w-3" />,
  Rejected: <XCircle className="h-3 w-3" />,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DeleteAccountRequestsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | DeleteRequest["status"]>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<DeleteRequest[]>([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        q: search,
        status: statusFilter,
      });
      const res = await fetch(`/api/super-admin/delete-account-requests?${p.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to load requests");
        setRows([]);
        return;
      }
      const data = json.data as ListPayload;
      setTotalFiltered(data.totalFiltered ?? 0);
      setTotalAll(data.totalAll ?? 0);
      setPendingCount(data.pendingCount ?? 0);
      setProcessedCount(data.processedCount ?? 0);
      setTotalPages(Math.max(1, data.totalPages ?? 1));
      setRows(
        (data.items ?? []).map((r) => ({
          id: r.id,
          temple: r.templeName,
          email: r.email,
          requestedAt: r.requestedAt,
          status: r.status,
          reason: r.reason ?? "",
        }))
      );
      if (page > (data.totalPages ?? 1)) {
        setPage(Math.max(1, data.totalPages ?? 1));
      }
    } catch {
      setError("Network error — please try again.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = useCallback(
    async (id: string, status: "Approved" | "Rejected") => {
      setActionId(id);
      setError(null);
      try {
        const res = await fetch(`/api/super-admin/delete-account-requests/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error?.message ?? "Update failed");
          return;
        }
        await load();
      } catch {
        setError("Network error — please try again.");
      } finally {
        setActionId(null);
      }
    },
    [load]
  );

  const columns: ColumnDef<DeleteRequest>[] = useMemo(
    () => [
      {
        key: "temple",
        header: "Temple",
        cell: (req) => (
          <div>
            <div className="text-sm font-semibold text-text-primary">{req.temple}</div>
            <div className="mt-0.5 font-mono text-[11px] text-text-tertiary">{req.id}</div>
          </div>
        ),
      },
      { key: "email", header: "Contact email", cell: (req) => <span className="text-xs text-text-secondary">{req.email}</span> },
      {
        key: "requestedAt",
        header: "Requested",
        cell: (req) => (
          <span className="whitespace-nowrap text-xs font-medium text-text-tertiary">{formatDate(req.requestedAt)}</span>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        cell: (req) => (
          <span className="block max-w-[200px] truncate text-xs text-text-secondary" title={req.reason}>
            {req.reason}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (req) => (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[req.status]}`}
          >
            {STATUS_ICONS[req.status]} {req.status}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (req) =>
          req.status === "Pending" ? (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-emerald-200 px-3 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50"
                disabled={actionId === req.id}
                onClick={() => void setStatus(req.id, "Approved")}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-red-200 px-3 text-[11px] font-bold text-red-600 hover:bg-red-50"
                disabled={actionId === req.id}
                onClick={() => void setStatus(req.id, "Rejected")}
              >
                Reject
              </Button>
            </div>
          ) : (
            <span className="text-xs text-text-tertiary">—</span>
          ),
      },
    ],
    [actionId, setStatus]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Delete account requests</h1>
          <p className="mt-1 text-sm text-text-tertiary">Review and process account deletion requests from temples</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            {pendingCount} request{pendingCount !== 1 ? "s" : ""} awaiting review
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-4">
        {(
          [
            { label: "Total requests", value: totalAll },
            { label: "Pending", value: pendingCount },
            { label: "Processed", value: processedCount },
          ] as const
        ).map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="text-2xl font-bold text-text-primary">{loading ? "—" : value}</div>
            <div className="mt-0.5 text-xs font-medium text-text-tertiary">{label}</div>
          </div>
        ))}
      </div>

      <AdminListCard>
        <AdminTableToolbar>
          <AdminTableToolbarStart>
            <SearchInput
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchInput(e.target.value);
              }}
              onClear={searchInput ? () => setSearchInput("") : undefined}
              placeholder="Search temple or email…"
            />
          </AdminTableToolbarStart>
          <AdminTableToolbarEnd>
            <div className="flex flex-wrap gap-1.5 rounded-lg bg-subtle p-1">
              {(["All", "Pending", "Approved", "Rejected"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    statusFilter === s ? "bg-surface text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </AdminTableToolbarEnd>
        </AdminTableToolbar>

        {loading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-text-tertiary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">Loading requests…</span>
          </div>
        ) : totalFiltered === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-text-tertiary">
            <Trash2 className="h-8 w-8" />
            <span className="text-sm">No requests matching your filters</span>
          </div>
        ) : (
          <DataTable<DeleteRequest> columns={columns} data={rows} keyExtractor={(r) => r.id} tableClassName="min-w-[720px]" />
        )}

        <AdminPagination
          page={Math.min(page, totalPages)}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
        <p className="border-t border-border px-4 py-3 text-xs text-text-tertiary">
          {totalFiltered} request{totalFiltered !== 1 ? "s" : ""} matching filters
        </p>
      </AdminListCard>
    </div>
  );
}
