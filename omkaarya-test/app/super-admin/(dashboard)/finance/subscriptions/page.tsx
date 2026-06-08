"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  CheckCircle2,
  CreditCard,
  Download,
  Expand,
  Eye,
  FileText,
  RefreshCw,
  Repeat,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { InvoiceDetailModal } from "@/app/components/billing/InvoiceDetailModal";
import { buildInvoiceDocumentFromListRow } from "@/lib/billing/invoice-document-mappers";
import type { BillingProfile } from "@/lib/billing/invoice-types";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { AdminTableToolbar, AdminTableToolbarEnd, AdminTableToolbarStart } from "@/app/components/admin/AdminTableToolbar";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { EntityNameCell, TableRowIconActions, type TableRowIconAction } from "@/app/components/ds/molecules/TableCells";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { downloadSubscriptionsCsv } from "@/lib/subscriptions-csv";
import { ChangePlanModal } from "./_components/ChangePlanModal";
import { ExtendModal } from "./_components/ExtendModal";
import { ConvertToPaidModal } from "./_components/ConvertToPaidModal";
import type { PricingPlanOption } from "./_components/types";

// ── Types ──────────────────────────────────────────────────────────

type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";

type SubscriptionRow = {
  id: string;
  tenantId: string;
  invoiceId: string | null;
  templeName: string;
  templeInitials: string;
  plan: string;
  billingCycle: string;
  amountCents: number;
  paymentDate: string;
  receiptId: string | null;
  status: SubscriptionStatus;
  verifiedBy: string | null;
  activatedOn: string | null;
  expiresOn: string;
  adminEmail: string;
};

function InvoiceModal({
  subscription,
  profile,
  onClose,
  onDownload,
}: {
  subscription: SubscriptionRow;
  profile: BillingProfile | null;
  onClose: () => void;
  onDownload?: () => void;
}) {
  const invoiceStatus = subscription.status === "Active" || subscription.verifiedBy ? "Paid" : "Unpaid";
  const document = buildInvoiceDocumentFromListRow({
    invoiceNumber: subscription.invoiceId ?? "—",
    issuedDate: subscription.paymentDate,
    dueDate: subscription.expiresOn,
    statusLabel: invoiceStatus,
    templeName: subscription.templeName,
    adminEmail: subscription.adminEmail,
    plan: subscription.plan,
    period: subscription.billingCycle,
    amountCents: subscription.amountCents,
    currency: profile?.money?.currency || "USD",
    profile,
    paymentReference: subscription.invoiceId ?? undefined,
  });

  return (
    <InvoiceDetailModal
      title={`Invoice #${subscription.invoiceId ?? "—"} Details`}
      document={document}
      onClose={onClose}
      onDownload={subscription.invoiceId ? onDownload : undefined}
    />
  );
}

function statusBadgeColor(status: SubscriptionStatus) {
  switch (status) {
    case "Active": return "success" as const;
    case "Pending": return "warning" as const;
    case "Expired": return "gray" as const;
    case "Rejected": return "error" as const;
  }
}

function planBadgeColor(plan: string) {
  if (plan === "Prarambha") return "success" as const;
  if (plan === "Sankalpa") return "pink" as const;
  if (plan === "Aaradhana") return "indigo" as const;
  return "gray" as const;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}`;
}

// ── Filter Tabs ────────────────────────────────────────────────────

const FILTERS = ["All", "Pending", "Active", "Expired", "Rejected"] as const;
type FilterId = (typeof FILTERS)[number];

type ActionItem = TableRowIconAction;

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
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-0 shadow-2xl">
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
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors">
              <Expand className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center gap-4 rounded-xl bg-subtle p-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand font-bold text-sm">
              {subscription.templeInitials}
            </div>
            <div className="min-w-0 flex-1">
              <TruncateText className="font-semibold text-text-primary" title={subscription.templeName}>
                {subscription.templeName}
              </TruncateText>
              <TruncateText className="text-sm text-text-tertiary" title={subscription.adminEmail}>
                {subscription.adminEmail}
              </TruncateText>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-text-tertiary">Plan</p>
              <p className="mt-1 font-semibold text-text-primary">{subscription.plan}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-text-tertiary">Billing Cycle</p>
              <p className="mt-1 font-semibold text-text-primary">{subscription.billingCycle}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-text-tertiary">Amount</p>
              <p className="mt-1 font-semibold text-text-primary">{formatUsdFromCents(subscription.amountCents)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-text-tertiary">Payment Date</p>
              <p className="mt-1 font-semibold text-text-primary">{subscription.paymentDate}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border-secondary bg-subtle p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-fg-tertiary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Payment Receipt</p>
                  <p className="text-xs text-text-tertiary">{subscription.receiptId ? `${subscription.receiptId}.pdf` : "—"}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" /> View Receipt
              </Button>
            </div>
          </div>
        </div>

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
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border px-5 py-4 shadow-xl transition-all ${
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
  const [searchDebounced, setSearchDebounced] = useState("");
  const [filter, setFilter] = useState<FilterId>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingRow, setVerifyingRow] = useState<SubscriptionRow | null>(null);
  const [invoiceRow, setInvoiceRow] = useState<SubscriptionRow | null>(null);
  const [changePlanRow, setChangePlanRow] = useState<SubscriptionRow | null>(null);
  const [extendRow, setExtendRow] = useState<SubscriptionRow | null>(null);
  const [convertRow, setConvertRow] = useState<SubscriptionRow | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlanOption[]>([]);
  const [exporting, setExporting] = useState(false);
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [listTotal, setListTotal] = useState(0);
  const [counts, setCounts] = useState<Record<FilterId, number>>({ All: 0, Pending: 0, Active: 0, Expired: 0, Rejected: 0 });
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const [profRes, plansRes] = await Promise.all([
        fetch("/api/billing/profile", { cache: "no-store" }),
        fetch("/api/pricing-plans", { cache: "no-store" }),
      ]);
      const prof = (await profRes.json().catch(() => null)) as { success?: boolean; data?: BillingProfile } | null;
      if (!cancel && prof && prof.success === true && prof.data) setProfile(prof.data);

      const plansJson = (await plansRes.json().catch(() => null)) as {
        success?: boolean;
        data?: Array<{ id: string; name: string; priceMonthly?: number; priceYearly?: number }>;
      } | null;
      if (!cancel && plansJson?.success && Array.isArray(plansJson.data)) {
        setPricingPlans(
          plansJson.data.map((p) => ({
            id: p.id,
            name: p.name,
            priceMonthlyCents: Math.max(0, Math.trunc(p.priceMonthly ?? 0)),
            priceYearlyCents: Math.max(0, Math.trunc(p.priceYearly ?? 0)),
          }))
        );
      }
    })();
    return () => { cancel = true; };
  }, []);

  type ApiRow = {
    id: string;
    invoiceId: string | null;
    tenantId: string;
    templeName: string;
    plan: string;
    billingCycle: string;
    amount: number;
    amountCents?: number;
    paymentDate: string;
    receiptId: string | null;
    status: SubscriptionStatus;
    verifiedBy: string | null;
    activatedOn: string | null;
    expiresOn: string;
    adminEmail: string;
  };

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "T";
    const b = parts.length > 1 ? parts[1]?.[0] ?? "" : parts[0]?.[1] ?? "";
    return (a + b).toUpperCase();
  }

  const loadList = useCallback(async () => {
    setIsLoading(true);
    setLoadErr(null);
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    p.set("status", filter);
    if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
    const res = await fetch(`/api/subscriptions?${p.toString()}`, { cache: "no-store" });
    const d = (await res.json().catch(() => null)) as
      | { success?: boolean; data?: { data: ApiRow[]; totalPages: number; total?: number } }
      | null;
    if (!d || d.success !== true || !d.data) {
      setRows([]);
      setTotalPages(1);
      setListTotal(0);
      setLoadErr(jsonApiErrorMessage(d) || "Failed to load subscriptions");
      setIsLoading(false);
      return;
    }
    setRows(
      (d.data.data ?? []).map((r) => ({
        id: r.id,
        tenantId: r.tenantId,
        invoiceId: r.invoiceId,
        templeName: r.templeName,
        templeInitials: initials(r.templeName),
        plan: r.plan,
        billingCycle: r.billingCycle,
        amountCents:
          typeof r.amountCents === "number"
            ? Math.max(0, Math.trunc(r.amountCents))
            : Math.max(0, Math.trunc((r.amount ?? 0) * 100)),
        paymentDate: r.paymentDate,
        receiptId: r.receiptId,
        status: r.status,
        verifiedBy: r.verifiedBy,
        activatedOn: r.activatedOn,
        expiresOn: r.expiresOn,
        adminEmail: r.adminEmail,
      }))
    );
    setTotalPages(Math.max(1, d.data.totalPages ?? 1));
    setListTotal(typeof d.data.total === "number" ? d.data.total : (d.data.data ?? []).length);
    setIsLoading(false);
  }, [filter, page, pageSize, searchDebounced]);

  const loadCounts = useCallback(async () => {
    const tabs: FilterId[] = ["All", "Pending", "Active", "Expired", "Rejected"];
    const out: Record<FilterId, number> = { All: 0, Pending: 0, Active: 0, Expired: 0, Rejected: 0 };
    for (const t of tabs) {
      const p = new URLSearchParams();
      p.set("page", "1");
      p.set("pageSize", "1");
      p.set("status", t);
      if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
      const res = await fetch(`/api/subscriptions?${p.toString()}`, { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { total?: number } }
        | null;
      if (d && d.success === true && d.data && typeof d.data.total === "number") {
        out[t] = d.data.total;
      }
    }
    setCounts(out);
  }, [searchDebounced]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  // ── Actions ──────────────────────────────────────────────────────

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 5000);
    },
    []
  );

  const handleVerify = useCallback(() => {
    if (!verifyingRow) return;
    (async () => {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(verifyingRow.id)}/verify`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
        showToast(jsonApiErrorMessage(d) || "Verify failed", "error");
        return;
      }
      setVerifyingRow(null);
      showToast(`Subscription verified for ${verifyingRow.templeName}`, "success");
      await loadList();
      await loadCounts();
    })();
  }, [verifyingRow, showToast, loadList, loadCounts]);

  const handleReject = useCallback(() => {
    if (!verifyingRow) return;
    (async () => {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(verifyingRow.id)}/reject`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
        showToast(jsonApiErrorMessage(d) || "Reject failed", "error");
        return;
      }
      setVerifyingRow(null);
      showToast(`Subscription rejected for ${verifyingRow.templeName}`, "error");
      await loadList();
      await loadCounts();
    })();
  }, [verifyingRow, showToast, loadList, loadCounts]);

  const downloadInvoice = useCallback((row: SubscriptionRow) => {
    if (!row.invoiceId) {
      showToast("No invoice linked to this subscription.", "error");
      return;
    }
    window.open(
      `/api/billing/invoices/${encodeURIComponent(row.invoiceId)}/receipt`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [showToast]);

  const handleChangePlan = useCallback(
    (pricingPlanId: string) => {
      if (!changePlanRow) return;
      const row = changePlanRow;
      (async () => {
        const res = await fetch(`/api/subscriptions/${encodeURIComponent(row.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ action: "changePlan", pricingPlanId }),
        });
        const d = await res.json().catch(() => null);
        if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
          showToast(jsonApiErrorMessage(d) || "Plan change failed", "error");
          return;
        }
        setChangePlanRow(null);
        showToast(`Plan updated for ${row.templeName}`, "success");
        await loadList();
        await loadCounts();
      })();
    },
    [changePlanRow, showToast, loadList, loadCounts]
  );

  const handleExtend = useCallback(
    (months: number) => {
      if (!extendRow) return;
      const row = extendRow;
      (async () => {
        const res = await fetch(`/api/subscriptions/${encodeURIComponent(row.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ action: "extend", months }),
        });
        const d = await res.json().catch(() => null);
        if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
          showToast(jsonApiErrorMessage(d) || "Extension failed", "error");
          return;
        }
        setExtendRow(null);
        showToast(`Subscription extended for ${row.templeName}`, "success");
        await loadList();
        await loadCounts();
      })();
    },
    [extendRow, showToast, loadList, loadCounts]
  );

  const handleConvertToPaid = useCallback(() => {
    if (!convertRow) return;
    const row = convertRow;
    (async () => {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(row.id)}/verify`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
        showToast(jsonApiErrorMessage(d) || "Activation failed", "error");
        return;
      }
      setConvertRow(null);
      showToast(`${row.templeName} is now on a paid active subscription`, "success");
      await loadList();
      await loadCounts();
    })();
  }, [convertRow, showToast, loadList, loadCounts]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const p = new URLSearchParams();
      p.set("page", "1");
      p.set("pageSize", "5000");
      p.set("status", filter);
      if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
      const res = await fetch(`/api/subscriptions?${p.toString()}`, { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { data: ApiRow[] } }
        | null;
      if (!d || d.success !== true || !d.data?.data) {
        showToast(jsonApiErrorMessage(d) || "Export failed", "error");
        return;
      }
      downloadSubscriptionsCsv(
        d.data.data.map((r) => ({
          templeName: r.templeName,
          plan: r.plan,
          billingCycle: r.billingCycle,
          amountCents:
            typeof r.amountCents === "number"
              ? Math.max(0, Math.trunc(r.amountCents))
              : Math.max(0, Math.trunc((r.amount ?? 0) * 100)),
          paymentDate: r.paymentDate,
          expiresOn: r.expiresOn,
          status: r.status,
          adminEmail: r.adminEmail,
          receiptId: r.receiptId,
        }))
      );
      showToast("Subscriptions exported", "success");
    } catch {
      showToast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  }, [filter, searchDebounced, showToast]);

  // ── Row Actions Builder ──────────────────────────────────────────

  const getRowActions = useCallback(
    (row: SubscriptionRow): ActionItem[] => {
      const base: ActionItem[] = [
        {
          label: "View",
          icon: <Eye className="h-4 w-4" />,
          onClick: () => setInvoiceRow(row),
        },
        {
          label: "Download Invoice",
          icon: <Download className="h-4 w-4" />,
          onClick: () => downloadInvoice(row),
        },
        {
          label: "Change Plan",
          icon: <Repeat className="h-4 w-4" />,
          onClick: () => setChangePlanRow(row),
        },
      ];

      if (row.status === "Expired") {
        base.push({
          label: "Extend",
          icon: <RefreshCw className="h-4 w-4" />,
          onClick: () => setExtendRow(row),
        });
      }

      if (row.status === "Pending" || row.status === "Expired") {
        base.push({
          label: "Convert to Paid",
          icon: <CreditCard className="h-4 w-4" />,
          onClick: () => setConvertRow(row),
        });
      }

      return base;
    },
    [downloadInvoice]
  );

  // ── Columns ──────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<SubscriptionRow>[]>(
    () => [
      {
        key: "templeName",
        header: "Temple",
        sortable: false,
        className: "max-w-[16rem]",
        cell: (row) => (
          <EntityNameCell
            icon={
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand text-xs font-bold">
                {row.templeInitials}
              </div>
            }
            title={row.templeName}
            subtitle={row.adminEmail}
          />
        ),
      },
      {
        key: "plan",
        header: "Plan",
        className: "max-w-[10rem]",
        cell: (row) => (
          <div className="min-w-0 space-y-1">
            <Badge color={planBadgeColor(row.plan)} size="sm" className="max-w-full min-w-0">
              <span className="block min-w-0 truncate" title={row.plan}>
                {row.plan}
              </span>
            </Badge>
            <TruncateText className="text-[11px] text-text-tertiary" title={row.billingCycle}>
              {row.billingCycle}
            </TruncateText>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        align: "right",
        cell: (row) => (
          <span className="font-semibold tabular-nums text-text-primary text-sm">
            {formatUsdFromCents(row.amountCents)}
          </span>
        ),
      },
      {
        key: "expiresOn",
        header: "Expires On",
        cell: (row) => (
          <span className="text-sm text-text-secondary">{row.expiresOn}</span>
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
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-0.5">
            {row.status === "Pending" && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                title="Verify"
                aria-label="Verify"
                onClick={(e) => {
                  e.stopPropagation();
                  setVerifyingRow(row);
                }}
              >
                <ShieldCheck className="h-4 w-4" />
              </Button>
            )}
            <TableRowIconActions actions={getRowActions(row)} />
          </div>
        ),
      },
    ],
    [getRowActions]
  );

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {loadErr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {loadErr}
        </div>
      )}
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
              Subscriptions
            </h1>
            <Badge color="warning" size="sm">
              {counts.Pending} Pending
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-tertiary">
            Manage and filter all subscriptions & payments
          </p>
        </div>
        <Button
          variant="outline"
          leadingIcon={<Download className="h-4 w-4" />}
          onClick={() => void handleExport()}
          loading={exporting}
        >
          Export
        </Button>
      </div>

      {/* Table Container */}
      <AdminListCard>
        <AdminTableToolbar>
          <AdminTableToolbarStart>
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
              placeholder="Search temple, plan, receipt, or admin email"
            />
          </AdminTableToolbarStart>

          <AdminTableToolbarEnd>
            <div className="flex max-w-full flex-wrap items-center gap-1 rounded-lg bg-subtle p-1">
            {FILTERS.map((id) => {
              const active = filter === id;
              const count = counts[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setFilter(id);
                    setPage(1);
                  }}
                  className={[
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0",
                    active
                      ? "bg-surface text-text-primary shadow-xs border border-border/50"
                      : "text-text-secondary hover:text-text-primary",
                  ].join(" ")}
                >
                  {id}
                  <span
                    className={[
                      "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      active
                        ? "bg-brand text-white"
                        : "bg-border/50 text-text-tertiary",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            </div>
          </AdminTableToolbarEnd>
        </AdminTableToolbar>

        {/* Data Table */}
        <DataTable<SubscriptionRow>
          columns={columns}
          data={rows}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          loadingRows={pageSize}
        />

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
          {listTotal} subscription{listTotal !== 1 ? "s" : ""} matching filters · page {page} of {totalPages}
        </p>
      </AdminListCard>

      {/* Verification Modal */}
      {verifyingRow && (
        <VerifyModal
          subscription={verifyingRow}
          onClose={() => setVerifyingRow(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}

      {/* Invoice Detail Modal */}
      {invoiceRow && (
        <InvoiceModal
          subscription={invoiceRow}
          profile={profile}
          onClose={() => setInvoiceRow(null)}
          onDownload={() => downloadInvoice(invoiceRow)}
        />
      )}

      {changePlanRow && (
        <ChangePlanModal
          subscription={changePlanRow}
          plans={pricingPlans}
          onClose={() => setChangePlanRow(null)}
          onSave={handleChangePlan}
        />
      )}

      {extendRow && (
        <ExtendModal
          subscription={extendRow}
          onClose={() => setExtendRow(null)}
          onSave={handleExtend}
        />
      )}

      {convertRow && (
        <ConvertToPaidModal
          subscription={convertRow}
          onClose={() => setConvertRow(null)}
          onConfirm={handleConvertToPaid}
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
