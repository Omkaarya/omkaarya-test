"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  Expand,
  Eye,
  FileText,
  MoreVertical,
  RefreshCw,
  Repeat,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { Pagination } from "@/app/components/ds/molecules/Pagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { PlanName } from "./_components/types";
// ── Types ──────────────────────────────────────────────────────────

type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";

type SubscriptionRow = {
  id: string;
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

type BillingProfile = {
  issuer: { name: string; address: string; email: string; website: string; brandLine: string };
  paymentMethodLabel: string;
  bank: { bankName: string; accountName: string; accountNumber: string; swift: string; notes: string };
  tax: { rateBps: number; label: string };
  money: { currency: string };
};

function formatMoney(currency: string, amountCents: number): string {
  const c = (currency || "USD").toUpperCase();
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format((amountCents ?? 0) / 100);
}

// ── Helpers ────────────────────────────────────────────────────────

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

// ── Actions Dropdown ───────────────────────────────────────────────

type ActionItem = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
};

function ActionsDropdown({ actions }: { actions: ActionItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-52 origin-top-right rounded-xl border border-border bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1.5">
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  action.onClick();
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  action.danger
                    ? "text-status-danger-text hover:bg-red-50 dark:hover:bg-red-950/30"
                    : "text-text-secondary hover:bg-subtle hover:text-text-primary"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Invoice Detail Modal (Figma-exact) ──────────────────────────────

function InvoiceModal({
  subscription,
  profile,
  onClose,
}: {
  subscription: SubscriptionRow;
  profile: BillingProfile | null;
  onClose: () => void;
}) {
  const invoiceStatus = subscription.status === "Active" || subscription.verifiedBy ? "Paid" : "Unpaid";
  const currency = profile?.money?.currency || "USD";
  const taxRateBps = profile?.tax?.rateBps ?? 0;
  const taxCents = Math.max(0, Math.round(((subscription.amountCents ?? 0) * taxRateBps) / 10_000));
  const subtotal = formatMoney(currency, subscription.amountCents ?? 0);
  const tax = formatMoney(currency, taxCents);
  const total = formatMoney(currency, (subscription.amountCents ?? 0) + taxCents);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header — icon top-left, expand + close top-right */}
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface shadow-xs">
              <FileText className="h-5 w-5 text-text-tertiary" />
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

          {/* Title */}
          <h3 className="mt-4 text-lg font-bold text-text-primary">
            Invoice #{subscription.invoiceId} Details
          </h3>
          <p className="text-sm text-text-tertiary">
            Manage your invoice details here.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Temple Avatar */}
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg">
              {subscription.templeInitials}
            </div>
          </div>

          {/* Invoice Meta */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">Invoice</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <FileText className="h-4 w-4 text-text-tertiary" />
                <span>{subscription.invoiceId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                <span>Issued On: {formatDate(subscription.paymentDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                <span>Due On: {formatDate(subscription.expiresOn)}</span>
              </div>
            </div>
          </div>

          {/* Invoice From / To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Invoice From:</p>
              <p className="text-sm font-medium text-text-primary">{profile?.issuer?.name ?? "—"}</p>
              <p className="text-sm text-text-secondary">{profile?.issuer?.address ?? "—"}</p>
              <p className="text-sm text-text-tertiary">{profile?.issuer?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Invoice To:</p>
              <p className="text-sm font-medium text-text-primary">{subscription.templeName}</p>
              <p className="text-sm text-text-tertiary">{subscription.adminEmail}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-subtle">
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Plan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Billing Cycle</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Created On</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Expiring On</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Amount(USD)</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Invoice Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-sm text-text-primary">
                    {subscription.plan}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {subscription.billingCycle}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(subscription.activatedOn ?? subscription.paymentDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(subscription.expiresOn)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary tabular-nums">
                    {subtotal}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={invoiceStatus === "Paid" ? "success" : "warning"} size="sm" dot>
                      {invoiceStatus}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Info + Totals — side by side */}
          <div className="flex items-start justify-between gap-8">
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Payment Info</p>
              <p className="text-sm text-text-secondary">
                Method: {profile?.paymentMethodLabel ?? "—"}
              </p>
              <p className="text-sm text-text-secondary">
                Amount: {subtotal}
              </p>
            </div>
            <div className="text-right space-y-1 min-w-[200px]">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Sub Total</span>
                <span className="text-text-primary tabular-nums">{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{profile?.tax?.label ?? "Tax"}</span>
                <span className="text-text-primary tabular-nums">{tax}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                <span className="text-text-primary">Total</span>
                <span className="text-text-primary tabular-nums">{total}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions — light pink/rose bg like Figma */}
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 p-5">
            <p className="text-sm font-bold text-text-primary mb-2">
              Terms and Conditions
            </p>
            <ul className="text-sm text-text-secondary space-y-1.5 list-disc pl-4">
              <li>All payments must be made according to the agreed schedule. Late payments may incur additional fees.</li>
              <li>We are not liable for any indirect, incidental, or consequential damages, including loss of profits, revenue, or data.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" leadingIcon={<Download className="h-4 w-4" />}>
            Download Invoice
          </Button>
        </div>
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
          <div className="flex items-center gap-4 rounded-xl bg-subtle p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand font-bold text-sm">
              {subscription.templeInitials}
            </div>
            <div>
              <p className="font-semibold text-text-primary">{subscription.templeName}</p>
              <p className="text-sm text-text-tertiary">{subscription.adminEmail}</p>
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
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingRow, setVerifyingRow] = useState<SubscriptionRow | null>(null);
  const [invoiceRow, setInvoiceRow] = useState<SubscriptionRow | null>(null);
  const [changePlanRow, setChangePlanRow] = useState<SubscriptionRow | null>(null);
  const [extendRow, setExtendRow] = useState<SubscriptionRow | null>(null);
  const [convertToPaidRow, setConvertToPaidRow] = useState<SubscriptionRow | null>(null);
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<Record<FilterId, number>>({ All: 0, Pending: 0, Active: 0, Expired: 0, Rejected: 0 });
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Simulate Loading ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const profRes = await fetch("/api/billing/profile", { cache: "no-store" });
      const prof = (await profRes.json().catch(() => null)) as { success?: boolean; data?: BillingProfile } | null;
      if (!cancel && prof && prof.success === true && prof.data) setProfile(prof.data);
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
    setLoadErr(null);
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    p.set("status", filter);
    if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
    const res = await fetch(`/api/subscriptions?${p.toString()}`, { cache: "no-store" });
    const d = (await res.json().catch(() => null)) as
      | { success?: boolean; data?: { data: ApiRow[]; totalPages: number } }
      | null;
    if (!d || d.success !== true || !d.data) {
      setRows([]);
      setTotalPages(1);
      setLoadErr(jsonApiErrorMessage(d) || "Failed to load subscriptions");
      return;
    }
    setRows(
      (d.data.data ?? []).map((r) => ({
        id: r.id,
        invoiceId: r.invoiceId,
        templeName: r.templeName,
        templeInitials: initials(r.templeName),
        plan: r.plan,
        billingCycle: r.billingCycle,
        amountCents: Math.max(0, Math.trunc((r.amount ?? 0) * 100)),
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    void loadList();
  }, [loadList]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleChangePlan = useCallback((newPlan: PlanName) => {
    if (!changePlanRow) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === changePlanRow.id ? { ...r, plan: newPlan } : r
      )
    );
    setChangePlanRow(null);
    showToast(`Plan updated to ${newPlan} for ${changePlanRow.templeName}.`, "success");
  }, [changePlanRow, showToast]);

  const handleExtend = useCallback((months: number) => {
    if (!extendRow) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === extendRow.id) {
          const d = new Date(r.expiresOn);
          d.setMonth(d.getMonth() + months);
          return { ...r, expiresOn: d.toISOString().split("T")[0], status: "Active" as SubscriptionStatus };
        }
        return r;
      })
    );
    setExtendRow(null);
    showToast(`Subscription extended by ${months} months for ${extendRow.templeName}.`, "success");
  }, [extendRow, showToast]);

  const handleConvertToPaid = useCallback(() => {
    if (!convertToPaidRow) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === convertToPaidRow.id ? { ...r, status: "Active" as SubscriptionStatus, verifiedBy: "Super Admin" } : r
      )
    );
    setConvertToPaidRow(null);
    showToast(`${convertToPaidRow.templeName} converted to paid subscription successfully.`, "success");
  }, [convertToPaidRow, showToast]);

  // ── Row Actions Builder ──────────────────────────────────────────

  function getRowActions(row: SubscriptionRow): ActionItem[] {
    const base: ActionItem[] = [
      {
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => setInvoiceRow(row),
      },
      {
        label: "Download Invoice",
        icon: <Download className="h-4 w-4" />,
        onClick: () =>
          showToast(`Downloading invoice ${row.invoiceId}…`, "success"),
      },
      {
        label: "Change Plan",
        icon: <Repeat className="h-4 w-4" />,
        onClick: () => setChangePlanRow(row),
      },
      {
        label: "Reminder",
        icon: <Bell className="h-4 w-4" />,
        onClick: () =>
          showToast(`Payment reminder sent to ${row.adminEmail}.`, "success"),
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
        onClick: () =>
          showToast(`Convert to Paid for ${row.templeName} — coming soon.`, "success"),
      });
    }

    return base;
  }

  // ── Columns ──────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<SubscriptionRow>[]>(
    () => [
      {
        key: "id",
        header: "Subscription ID",
        cell: (row) => (
          <span className="text-sm font-medium text-text-secondary">
            {row.id}
          </span>
        ),
      },
      {
        key: "templeName",
        header: "Temple Name",
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand text-xs font-bold">
              {row.templeInitials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate text-sm">
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
        header: "Billing Cycle",
        cell: (row) => (
          <span className="text-sm text-text-secondary">{row.billingCycle}</span>
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
          <div className="flex items-center justify-end gap-2">
            {row.status === "Pending" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setVerifyingRow(row)}
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verify
              </Button>
            )}
            <ActionsDropdown actions={getRowActions(row)} />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
        <Button variant="outline" leadingIcon={<Download className="h-4 w-4" />}>
          Export
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-surface rounded-xl border border-border shadow-xs">
        {/* Filter Bar — search + tabs with count badges */}
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
              placeholder="Search by name, city, or admin email"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-subtle p-1">
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
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5",
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
        </div>

        {/* Data Table */}
        <DataTable<SubscriptionRow>
          columns={columns}
          data={rows}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          loadingRows={pageSize}
        />

        {/* Pagination */}
        <div className="px-6">
          <Pagination
            currentPage={page}
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

      {/* Invoice Detail Modal */}
      {invoiceRow && (
        <InvoiceModal
          subscription={invoiceRow}
          profile={profile}
          onClose={() => setInvoiceRow(null)}
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
