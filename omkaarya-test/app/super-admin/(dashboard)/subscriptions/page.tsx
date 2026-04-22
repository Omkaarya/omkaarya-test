"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  Eye,
  FileText,
  MoreVertical,
  ShieldCheck,
  X,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { Pagination } from "@/app/components/ds/molecules/Pagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

// ── Types ──────────────────────────────────────────────────────────

type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";
type PlanName = "Prarambha" | "Sankalpa" | "Aaradhana";
type BillingCycle = "Monthly" | "Annual";

type SubscriptionRow = {
  id: string;
  templeName: string;
  templeInitials: string;
  plan: PlanName;
  billingCycle: BillingCycle;
  amount: number;
  paymentDate: string;
  receiptId: string;
  status: SubscriptionStatus;
  verifiedBy: string | null;
  activatedOn: string | null;
  expiresOn: string;
  adminEmail: string;
};

type SubscriptionsListResponse = {
  data: Array<{
    id: string;
    tenantId: string;
    templeName: string;
    plan: string;
    billingCycle: string;
    amount: number;
    paymentDate: string;
    receiptId: string | null;
    status: SubscriptionStatus;
    verifiedBy: string | null;
    activatedOn: string | null;
    expiresOn: string;
    adminEmail: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ── Helpers ────────────────────────────────────────────────────────

function statusBadgeColor(status: SubscriptionStatus) {
  switch (status) {
    case "Active": return "success" as const;
    case "Pending": return "warning" as const;
    case "Expired": return "gray" as const;
    case "Rejected": return "error" as const;
  }
}

function planBadgeColor(plan: PlanName) {
  switch (plan) {
    case "Prarambha": return "success" as const;
    case "Sankalpa": return "pink" as const;
    case "Aaradhana": return "indigo" as const;
  }
}

function initialsFromTempleName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[1]![0] : (parts[0]?.[1] ?? "");
  return (a + b).toUpperCase() || "T";
}

// ── Filter Tabs ────────────────────────────────────────────────────

const FILTERS = ["All", "Pending", "Active", "Expired", "Rejected"] as const;
type FilterId = (typeof FILTERS)[number];

// ── Verification Modal ─────────────────────────────────────────────

function VerifyModal({
  subscription,
  onClose,
  onVerify,
  onReject,
}: {
  subscription: SubscriptionRow;
  onClose: () => void;
  onVerify: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-warning-bg text-status-warning-text">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Verify Subscription
              </h3>
              <p className="text-sm text-text-tertiary">
                Review payment and activate subscription
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {/* Temple Info */}
          <div className="flex items-center gap-4 rounded-xl bg-subtle p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand font-bold text-sm">
              {subscription.templeInitials}
            </div>
            <div>
              <p className="font-semibold text-text-primary">
                {subscription.templeName}
              </p>
              <p className="text-sm text-text-tertiary">
                {subscription.adminEmail}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-text-tertiary">Plan</p>
              <p className="mt-1 font-semibold text-text-primary">
                {subscription.plan}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-text-tertiary">
                Billing Cycle
              </p>
              <p className="mt-1 font-semibold text-text-primary">
                {subscription.billingCycle}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-text-tertiary">Amount</p>
              <p className="mt-1 font-semibold text-text-primary">
                ₹{subscription.amount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-text-tertiary">
                Payment Date
              </p>
              <p className="mt-1 font-semibold text-text-primary">
                {subscription.paymentDate}
              </p>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="rounded-xl border border-border-secondary bg-subtle p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-fg-tertiary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Payment Receipt
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {subscription.receiptId}.pdf
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="destructive-outline" onClick={onReject}>
            <XCircle className="h-4 w-4 mr-1.5" /> Reject
          </Button>
          <Button variant="primary" onClick={onVerify}>
            <ShieldCheck className="h-4 w-4 mr-1.5" /> Verify & Activate
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Toast Notification ──────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border px-5 py-4 shadow-xl transition-all animate-in slide-in-from-bottom-4 ${
        type === "success"
          ? "border-success-500/20 bg-status-success-bg text-status-success-text"
          : "border-error-500/20 bg-status-danger-bg text-status-danger-text"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      <p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<FilterId>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [verifyingRow, setVerifyingRow] = useState<SubscriptionRow | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (searchInput.trim()) params.set("q", searchInput.trim());
      if (filter !== "All") params.set("status", filter);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/subscriptions?${params.toString()}`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        throw new Error(jsonApiErrorMessage(data) ?? "Failed to load subscriptions");
      }

      const d = data as
        | { success: true; data: SubscriptionsListResponse }
        | SubscriptionsListResponse;
      const payload =
        d && typeof d === "object" && "success" in d && d.success === true && "data" in d
          ? d.data
          : (d as SubscriptionsListResponse);
      setRows(
        payload.data.map((r) => ({
          id: r.id,
          templeName: r.templeName,
          templeInitials: initialsFromTempleName(r.templeName),
          plan: r.plan as PlanName,
          billingCycle: r.billingCycle as BillingCycle,
          amount: r.amount,
          paymentDate: r.paymentDate,
          receiptId: r.receiptId ?? "",
          status: r.status,
          verifiedBy: r.verifiedBy,
          activatedOn: r.activatedOn,
          expiresOn: r.expiresOn,
          adminEmail: r.adminEmail,
        }))
      );
      setTotalPages(payload.totalPages || 1);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load subscriptions");
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize, searchInput]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const pageSafe = Math.min(page, totalPages);
  const pageRows = rows;

  // ── Metrics ──────────────────────────────────────────────────────

  const [metrics, setMetrics] = useState({ total: 0, pending: 0, active: 0, expired: 0 });

  useEffect(() => {
    let cancelled = false;
    async function loadMetrics() {
      const mk = (status: string) =>
        fetch(`/api/subscriptions?status=${encodeURIComponent(status)}&page=1&pageSize=1`, {
          cache: "no-store",
        })
          .then((r) => r.json().catch(() => null))
          .then((j: { success?: boolean; data?: { total?: number }; total?: number } | null) => {
          if (!j) return 0;
          if (j.success && j.data && typeof j.data.total === "number") return j.data.total;
          if (typeof j.total === "number") return j.total;
          return 0;
        })
          .catch(() => 0);

      const [all, pending, active, expired] = await Promise.all([
        mk("All"),
        mk("Pending"),
        mk("Active"),
        mk("Expired"),
      ]);
      if (!cancelled) setMetrics({ total: all, pending, active, expired });
    }
    void loadMetrics();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────

  const handleVerify = useCallback(async () => {
    if (!verifyingRow) return;
    try {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(verifyingRow.id)}/verify`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string | { message?: string };
        message?: string;
      } | null;
      if (!res.ok) {
        const errMsg =
          data && data.error
            ? typeof data.error === "string"
              ? data.error
              : data.error.message
            : undefined;
        throw new Error(errMsg ?? "Failed to verify subscription");
      }
      await fetchList();
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : "Failed to verify subscription",
        type: "error",
      });
      setTimeout(() => setToast(null), 5000);
      return;
    }
    setVerifyingRow(null);
    setToast({
      message: `Subscription activated for ${verifyingRow.templeName}. Confirmation email sent to ${verifyingRow.adminEmail}.`,
      type: "success",
    });
    setTimeout(() => setToast(null), 5000);
  }, [fetchList, verifyingRow]);

  const handleReject = useCallback(async () => {
    if (!verifyingRow) return;
    try {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(verifyingRow.id)}/reject`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string | { message?: string };
        message?: string;
      } | null;
      if (!res.ok) {
        const errMsg =
          data && data.error
            ? typeof data.error === "string"
              ? data.error
              : data.error.message
            : undefined;
        throw new Error(errMsg ?? "Failed to reject subscription");
      }
      await fetchList();
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : "Failed to reject subscription",
        type: "error",
      });
      setTimeout(() => setToast(null), 5000);
      return;
    }
    setVerifyingRow(null);
    setToast({
      message: `Subscription rejected for ${verifyingRow.templeName}.`,
      type: "error",
    });
    setTimeout(() => setToast(null), 5000);
  }, [fetchList, verifyingRow]);

  // ── Columns ──────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<SubscriptionRow>[]>(
    () => [
      {
        key: "templeName",
        header: "Temple",
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand text-xs font-bold">
              {row.templeInitials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate">
                {row.templeName}
              </p>
              <p className="text-xs text-text-tertiary truncate">
                {row.adminEmail}
              </p>
            </div>
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
        key: "billingCycle",
        header: "Billing",
        cell: (row) => (
          <span className="text-text-secondary">{row.billingCycle}</span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        align: "right",
        cell: (row) => (
          <span className="font-semibold tabular-nums text-text-primary">
            ₹{row.amount.toLocaleString()}
          </span>
        ),
      },
      {
        key: "paymentDate",
        header: "Payment Date",
        cell: (row) => (
          <span className="text-text-secondary">{row.paymentDate}</span>
        ),
      },
      {
        key: "receiptId",
        header: "Receipt",
        cell: (row) => (
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline">
            <FileText className="h-3.5 w-3.5" />
            {row.receiptId || "—"}
          </button>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge color={statusBadgeColor(row.status)} size="sm" dot>
            {row.status}
          </Badge>
        ),
      },
      {
        key: "verifiedBy",
        header: "Verified By",
        cell: (row) => (
          <span className="text-text-tertiary">
            {row.verifiedBy ?? "—"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        cell: (row) =>
          row.status === "Pending" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setVerifyingRow(row)}
            >
              <ShieldCheck className="h-4 w-4 mr-1" /> Verify
            </Button>
          ) : (
            <button className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          ),
      },
    ],
    []
  );

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
            Subscriptions
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Review payment receipts, verify and activate temple subscriptions.
          </p>
        </div>
        <Button variant="outline" leadingIcon={<Download className="h-4 w-4" />}>
          Export
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Subscriptions"
          value={String(metrics.total).padStart(2, "0")}
          chartColor="brand"
          showMenu={false}
        />
        <MetricCard
          title="Pending Verification"
          value={String(metrics.pending).padStart(2, "0")}
          chartColor="warning"
          showMenu={false}
        />
        <MetricCard
          title="Active"
          value={String(metrics.active).padStart(2, "0")}
          chartColor="success"
          showMenu={false}
        />
        <MetricCard
          title="Expired"
          value={String(metrics.expired).padStart(2, "0")}
          chartColor="gray"
          showMenu={false}
        />
      </div>

      {/* Table Container */}
      <div className="bg-surface rounded-xl border border-border shadow-xs">
        {/* Filter Bar */}
        <div className="flex flex-col gap-4 border-b border-border p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <SearchInput
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              onClear={
                searchInput
                  ? () => {
                      setSearchInput("");
                      setPage(1);
                    }
                  : undefined
              }
              placeholder="Search by temple, plan, or receipt…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-text-tertiary">
              Filter:
            </span>
            <div className="flex flex-wrap gap-1 rounded-lg bg-subtle p-1">
              {FILTERS.map((id) => {
                const active = filter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setFilter(id);
                      setPage(1);
                    }}
                    className={[
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "bg-surface text-text-primary shadow-xs border border-border/50"
                        : "text-text-secondary hover:text-text-primary",
                    ].join(" ")}
                  >
                    {id}
                    {id === "Pending" && metrics.pending > 0 && (
                      <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-status-warning-bg text-[10px] font-bold text-status-warning-text">
                        {metrics.pending}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mx-6 mb-4 rounded-xl border border-border-error bg-status-danger-bg px-4 py-3 text-sm text-status-danger-text">
            {loadError}
          </div>
        )}
        {loading && (
          <div className="mx-6 mb-4 rounded-xl border border-border bg-subtle px-4 py-3 text-sm text-text-tertiary">
            Loading subscriptions…
          </div>
        )}

        {/* Data Table */}
        <DataTable<SubscriptionRow>
          columns={columns}
          data={pageRows}
          keyExtractor={(row) => row.id}
        />

        {/* Pagination */}
        <div className="px-6">
          <Pagination
            currentPage={pageSafe}
            totalPages={totalPages}
            onPageChange={setPage}
            showResultsCount
          />
        </div>
      </div>

      {/* Verification Modal */}
      {verifyingRow && (
        <VerifyModal
          subscription={verifyingRow}
          onClose={() => setVerifyingRow(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
