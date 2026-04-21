"use client";

import { useMemo, useState, useCallback } from "react";
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

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { Pagination } from "@/app/components/ds/molecules/Pagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

// ── Types ──────────────────────────────────────────────────────────

type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";
type PlanName = "Aaradhana" | "Sankalpa" | "Mandala";
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
    case "Aaradhana": return "purple" as const;
    case "Sankalpa": return "pink" as const;
    case "Mandala": return "indigo" as const;
  }
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

  // ── Mock Data ────────────────────────────────────────────────────

  const [rows, setRows] = useState<SubscriptionRow[]>([
    {
      id: "SUB-001",
      templeName: "Sri Jagannath Temple",
      templeInitials: "SJ",
      plan: "Mandala",
      billingCycle: "Annual",
      amount: 24999,
      paymentDate: "2026-04-15",
      receiptId: "RCP-20260415-001",
      status: "Pending",
      verifiedBy: null,
      activatedOn: null,
      expiresOn: "2027-04-15",
      adminEmail: "admin@jagannath.org",
    },
    {
      id: "SUB-002",
      templeName: "Swaminarayan Mandir",
      templeInitials: "SM",
      plan: "Aaradhana",
      billingCycle: "Monthly",
      amount: 1999,
      paymentDate: "2026-04-12",
      receiptId: "RCP-20260412-002",
      status: "Pending",
      verifiedBy: null,
      activatedOn: null,
      expiresOn: "2026-05-12",
      adminEmail: "info@swaminarayan.in",
    },
    {
      id: "SUB-003",
      templeName: "Meenakshi Amman Temple",
      templeInitials: "MA",
      plan: "Sankalpa",
      billingCycle: "Annual",
      amount: 14999,
      paymentDate: "2026-03-20",
      receiptId: "RCP-20260320-003",
      status: "Active",
      verifiedBy: "Super Admin",
      activatedOn: "2026-03-21",
      expiresOn: "2027-03-20",
      adminEmail: "temple@meenakshi.org",
    },
    {
      id: "SUB-004",
      templeName: "Kashi Vishwanath Temple",
      templeInitials: "KV",
      plan: "Mandala",
      billingCycle: "Annual",
      amount: 24999,
      paymentDate: "2026-02-10",
      receiptId: "RCP-20260210-004",
      status: "Active",
      verifiedBy: "Super Admin",
      activatedOn: "2026-02-11",
      expiresOn: "2027-02-10",
      adminEmail: "admin@kashivishwanath.org",
    },
    {
      id: "SUB-005",
      templeName: "Tirupati Balaji Temple",
      templeInitials: "TB",
      plan: "Mandala",
      billingCycle: "Annual",
      amount: 24999,
      paymentDate: "2025-04-01",
      receiptId: "RCP-20250401-005",
      status: "Expired",
      verifiedBy: "Super Admin",
      activatedOn: "2025-04-02",
      expiresOn: "2026-04-01",
      adminEmail: "tirupati@balaji.org",
    },
    {
      id: "SUB-006",
      templeName: "Somnath Temple",
      templeInitials: "ST",
      plan: "Aaradhana",
      billingCycle: "Monthly",
      amount: 1999,
      paymentDate: "2026-04-18",
      receiptId: "RCP-20260418-006",
      status: "Pending",
      verifiedBy: null,
      activatedOn: null,
      expiresOn: "2026-05-18",
      adminEmail: "admin@somnath.temple",
    },
    {
      id: "SUB-007",
      templeName: "Siddhivinayak Temple",
      templeInitials: "SV",
      plan: "Sankalpa",
      billingCycle: "Monthly",
      amount: 3999,
      paymentDate: "2026-04-05",
      receiptId: "RCP-20260405-007",
      status: "Rejected",
      verifiedBy: "Super Admin",
      activatedOn: null,
      expiresOn: "2026-05-05",
      adminEmail: "ops@siddhivinayak.com",
    },
    {
      id: "SUB-008",
      templeName: "Golden Temple",
      templeInitials: "GT",
      plan: "Mandala",
      billingCycle: "Annual",
      amount: 24999,
      paymentDate: "2026-01-15",
      receiptId: "RCP-20260115-008",
      status: "Active",
      verifiedBy: "Super Admin",
      activatedOn: "2026-01-16",
      expiresOn: "2027-01-15",
      adminEmail: "admin@goldentemple.org",
    },
    {
      id: "SUB-009",
      templeName: "Rameshwaram Temple",
      templeInitials: "RT",
      plan: "Aaradhana",
      billingCycle: "Annual",
      amount: 9999,
      paymentDate: "2026-04-19",
      receiptId: "RCP-20260419-009",
      status: "Pending",
      verifiedBy: null,
      activatedOn: null,
      expiresOn: "2027-04-19",
      adminEmail: "info@rameshwaram.in",
    },
    {
      id: "SUB-010",
      templeName: "Badrinath Temple",
      templeInitials: "BT",
      plan: "Sankalpa",
      billingCycle: "Annual",
      amount: 14999,
      paymentDate: "2025-10-10",
      receiptId: "RCP-20251010-010",
      status: "Expired",
      verifiedBy: "Super Admin",
      activatedOn: "2025-10-11",
      expiresOn: "2026-04-10",
      adminEmail: "admin@badrinath.org",
    },
  ]);

  // ── Filtering ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter(
        (r) =>
          r.templeName.toLowerCase().includes(q) ||
          r.plan.toLowerCase().includes(q) ||
          r.receiptId.toLowerCase().includes(q)
      );
    }
    if (filter !== "All") {
      list = list.filter((r) => r.status === filter);
    }
    return list;
  }, [rows, searchInput, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (pageSafe - 1) * pageSize,
    pageSafe * pageSize
  );

  // ── Metrics ──────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    return {
      total: rows.length,
      pending: rows.filter((r) => r.status === "Pending").length,
      active: rows.filter((r) => r.status === "Active").length,
      expired: rows.filter((r) => r.status === "Expired").length,
    };
  }, [rows]);

  // ── Actions ──────────────────────────────────────────────────────

  const handleVerify = useCallback(() => {
    if (!verifyingRow) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === verifyingRow.id
          ? {
              ...r,
              status: "Active" as SubscriptionStatus,
              verifiedBy: "Super Admin",
              activatedOn: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );
    setVerifyingRow(null);
    setToast({
      message: `Subscription activated for ${verifyingRow.templeName}. Confirmation email sent to ${verifyingRow.adminEmail}.`,
      type: "success",
    });
    setTimeout(() => setToast(null), 5000);
  }, [verifyingRow]);

  const handleReject = useCallback(() => {
    if (!verifyingRow) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === verifyingRow.id
          ? { ...r, status: "Rejected" as SubscriptionStatus, verifiedBy: "Super Admin" }
          : r
      )
    );
    setVerifyingRow(null);
    setToast({
      message: `Subscription rejected for ${verifyingRow.templeName}.`,
      type: "error",
    });
    setTimeout(() => setToast(null), 5000);
  }, [verifyingRow]);

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
            {row.receiptId}
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
