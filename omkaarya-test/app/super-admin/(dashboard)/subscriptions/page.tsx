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
  ArrowRight,
  TrendingUp,
  BarChart3,
  Search,
} from "lucide-react";

import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
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

// ── Components ─────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 flex flex-col justify-between dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          {title}
        </h3>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
        <p className="text-[11px] mt-1 text-zinc-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

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
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Verify Subscription
              </h3>
              <p className="text-xs text-text-tertiary">
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
          <div className="flex items-center gap-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 border border-zinc-100 dark:border-zinc-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white font-bold text-sm">
              {subscription.templeInitials}
            </div>
            <div>
              <p className="font-bold text-text-primary">
                {subscription.templeName}
              </p>
              <p className="text-xs text-text-tertiary font-medium">
                {subscription.adminEmail}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold text-text-tertiary uppercase">Plan</p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                {subscription.plan}
              </p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold text-text-tertiary uppercase">
                Billing Cycle
              </p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                {subscription.billingCycle}
              </p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold text-text-tertiary uppercase">Amount</p>
              <p className="mt-1 text-sm font-bold text-[var(--brand-primary)]">
                ₹{subscription.amount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold text-text-tertiary uppercase">
                Payment Date
              </p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                {subscription.paymentDate}
              </p>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg">
                  <FileText className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    Payment Receipt
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {subscription.receiptId}.pdf
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="font-bold">
                <Eye className="h-4 w-4 mr-1.5" /> View
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-5 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button 
            onClick={onReject}
            className="px-4 h-11 rounded-xl border border-zinc-200 text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            Reject
          </button>
          <button 
            onClick={onVerify}
            className="px-6 h-11 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Verify & Activate
          </button>
        </div>
      </div>
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

      const d = data as { success: true; data: SubscriptionsListResponse };
      const payload = d.data;
      
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
      setLoadError(e instanceof Error ? e.message : "Could not reach the API server. Please try again.");
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize, searchInput]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const [metrics, setMetrics] = useState({ total: 0, pending: 0, active: 0, expired: 0 });

  useEffect(() => {
    async function loadMetrics() {
      const mk = (status: string) =>
        fetch(`/api/subscriptions?status=${encodeURIComponent(status)}&page=1&pageSize=1`, {
          cache: "no-store",
        })
          .then((r) => r.json().catch(() => null))
          .then((j) => {
            if (j?.success && j?.data) return j.data.total;
            return 0;
          })
          .catch(() => 0);

      const [all, pending, active, expired] = await Promise.all([
        mk("All"), mk("Pending"), mk("Active"), mk("Expired"),
      ]);
      setMetrics({ total: all, pending, active, expired });
    }
    void loadMetrics();
  }, []);

  const handleVerify = async () => {
    if (!verifyingRow) return;
    try {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(verifyingRow.id)}/verify`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Verification failed");
      await fetchList();
      setVerifyingRow(null);
      setToast({ message: `Successfully activated ${verifyingRow.templeName}`, type: "success" });
    } catch (e) {
      setToast({ message: "Failed to activate subscription", type: "error" });
    }
  };

  const handleReject = async () => {
    if (!verifyingRow) return;
    try {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(verifyingRow.id)}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Rejection failed");
      await fetchList();
      setVerifyingRow(null);
      setToast({ message: `Rejected subscription for ${verifyingRow.templeName}`, type: "error" });
    } catch (e) {
      setToast({ message: "Failed to reject subscription", type: "error" });
    }
  };

  const columns = useMemo<ColumnDef<SubscriptionRow>[]>(
    () => [
      {
        key: "templeName",
        header: "Temple",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[var(--brand-primary)] text-xs font-bold border border-zinc-200">
              {row.templeInitials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text-primary truncate">
                {row.templeName}
              </p>
              <p className="text-[11px] text-text-tertiary font-medium truncate">
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
          <Badge color={planBadgeColor(row.plan)} size="sm" className="font-bold px-3">
            {row.plan}
          </Badge>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        align: "right",
        cell: (row) => (
          <span className="font-bold tabular-nums text-text-primary">
            ₹{row.amount.toLocaleString()}
          </span>
        ),
      },
      {
        key: "paymentDate",
        header: "Payment Date",
        cell: (row) => (
          <span className="text-text-tertiary font-medium">{row.paymentDate}</span>
        ),
      },
      {
        key: "receiptId",
        header: "Receipt",
        cell: (row) => (
          <button className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:underline">
            <FileText className="h-3.5 w-3.5" />
            {row.receiptId || "—"}
          </button>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge color={statusBadgeColor(row.status)} size="sm" dot className="font-bold">
            {row.status}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        cell: (row) =>
          row.status === "Pending" ? (
            <button
              onClick={() => setVerifyingRow(row)}
              className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-sm shadow-orange-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Verify
            </button>
          ) : (
            <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          ),
      },
    ],
    []
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Subscriptions
          </h1>
          <p className="mt-1 text-sm text-text-tertiary font-medium">
            Review payment receipts, verify and activate temple subscriptions.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Subscriptions"
          value={String(metrics.total)}
          subtitle="All recorded payments"
          icon={CreditCard}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/20"
        />
        <MetricCard
          title="Pending Verification"
          value={String(metrics.pending)}
          subtitle="Awaiting admin action"
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/20"
        />
        <MetricCard
          title="Active Plans"
          value={String(metrics.active)}
          subtitle="Live subscriptions"
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
        />
        <MetricCard
          title="Expired"
          value={String(metrics.expired)}
          subtitle="Needs renewal"
          icon={Clock}
          iconBg="bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
        />
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-col gap-4 border-b border-zinc-100 dark:border-zinc-800 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
              placeholder="Search by temple, plan, or receipt..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-950 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Filter By:
            </span>
            <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-50 dark:bg-zinc-950 p-1 border border-zinc-100 dark:border-zinc-800">
              {FILTERS.map((id) => {
                const active = filter === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setFilter(id); setPage(1); }}
                    className={`
                      px-4 py-2 rounded-lg text-xs font-bold transition-all
                      ${active ? 'bg-white dark:bg-zinc-800 text-[var(--brand-primary)] shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}
                    `}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error/Loading Area - Properly Spaced */}
        <div className="px-6 pt-6">
          {loadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {loadError}
            </div>
          )}
          {loading && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-500 animate-pulse">
              Syncing with production ledger...
            </div>
          )}
        </div>

        {/* Table */}
        <div className="p-0">
          <DataTable<SubscriptionRow>
            columns={columns}
            data={rows}
            keyExtractor={(row) => row.id}
          />
        </div>

        {/* Pagination Area */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showResultsCount
          />
        </div>
      </div>

      {/* Modals & Toasts */}
      {verifyingRow && (
        <VerifyModal
          subscription={verifyingRow}
          onClose={() => setVerifyingRow(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl bg-zinc-900 text-white px-6 py-4 shadow-2xl animate-in slide-in-from-bottom-4">
           <p className="text-sm font-bold">{toast.message}</p>
           <button onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
