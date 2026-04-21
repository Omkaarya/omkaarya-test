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

// ── Types ──────────────────────────────────────────────────────────

type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";
type PlanName = "Aaradhana" | "Sankalpa" | "Mandala";
type BillingCycle = "Monthly" | "Annual";

type SubscriptionRow = {
  id: string;
  invoiceId: string;
  templeName: string;
  templeInitials: string;
  templeAddress: string;
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
  cardLast4: string;
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
  onClose,
}: {
  subscription: SubscriptionRow;
  onClose: () => void;
}) {
  const invoiceStatus = subscription.status === "Active" || subscription.verifiedBy ? "Paid" : "Unpaid";

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
              <p className="text-sm font-medium text-text-primary">Pepulux</p>
              <p className="text-sm text-text-secondary">
                2972 Westheimer Rd, Santa Ana, Illinois 85486
              </p>
              <p className="text-sm text-text-tertiary">user@example.com</p>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Invoice To:</p>
              <p className="text-sm font-medium text-text-primary">{subscription.templeName}</p>
              <p className="text-sm text-text-secondary">
                {subscription.templeAddress}
              </p>
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
                    ₹{subscription.amount.toLocaleString()}
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
                Credit Card: {subscription.cardLast4 ? `4216 **** **** ${subscription.cardLast4}` : "—"}
              </p>
              <p className="text-sm text-text-secondary">
                Amount: ₹{subscription.amount.toLocaleString()}
              </p>
            </div>
            <div className="text-right space-y-1 min-w-[200px]">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Sub Total</span>
                <span className="text-text-primary tabular-nums">₹{subscription.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax</span>
                <span className="text-text-primary tabular-nums">₹0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                <span className="text-text-primary">Total</span>
                <span className="text-text-primary tabular-nums">₹{subscription.amount.toLocaleString()}</span>
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
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
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
              <p className="mt-1 font-semibold text-text-primary">₹{subscription.amount.toLocaleString()}</p>
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
                  <p className="text-xs text-text-tertiary">{subscription.receiptId}.pdf</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" /> View
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
  const [filter, setFilter] = useState<FilterId>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [verifyingRow, setVerifyingRow] = useState<SubscriptionRow | null>(null);
  const [invoiceRow, setInvoiceRow] = useState<SubscriptionRow | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Mock Data ────────────────────────────────────────────────────

  const [rows, setRows] = useState<SubscriptionRow[]>([
    {
      id: "Sub ID 001",
      invoiceId: "INV251001",
      templeName: "Sri Jagannath Temple",
      templeInitials: "SJ",
      templeAddress: "Grand Road, Puri, Odisha 752001",
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
      cardLast4: "5765",
    },
    {
      id: "Sub ID 002",
      invoiceId: "INV251002",
      templeName: "Swaminarayan Mandir",
      templeInitials: "SM",
      templeAddress: "Kalupur, Ahmedabad, Gujarat 380001",
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
      cardLast4: "8842",
    },
    {
      id: "Sub ID 003",
      invoiceId: "INV251003",
      templeName: "Meenakshi Amman Temple",
      templeInitials: "MA",
      templeAddress: "Madurai, Tamil Nadu 625001",
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
      cardLast4: "3321",
    },
    {
      id: "Sub ID 004",
      invoiceId: "INV251004",
      templeName: "Kashi Vishwanath Temple",
      templeInitials: "KV",
      templeAddress: "Lahori Tola, Varanasi, UP 221001",
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
      cardLast4: "7209",
    },
    {
      id: "Sub ID 005",
      invoiceId: "INV251005",
      templeName: "Tirupati Balaji Temple",
      templeInitials: "TB",
      templeAddress: "Tirumala, Tirupati, AP 517504",
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
      cardLast4: "4410",
    },
    {
      id: "Sub ID 006",
      invoiceId: "INV251006",
      templeName: "Somnath Temple",
      templeInitials: "ST",
      templeAddress: "Somnath, Prabhas Patan, Gujarat 362268",
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
      cardLast4: "1150",
    },
    {
      id: "Sub ID 007",
      invoiceId: "INV251007",
      templeName: "Siddhivinayak Temple",
      templeInitials: "SV",
      templeAddress: "Prabhadevi, Mumbai, MH 400028",
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
      cardLast4: "2277",
    },
    {
      id: "Sub ID 008",
      invoiceId: "INV251008",
      templeName: "Golden Temple",
      templeInitials: "GT",
      templeAddress: "Golden Temple Rd, Amritsar, Punjab 143006",
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
      cardLast4: "6693",
    },
    {
      id: "Sub ID 009",
      invoiceId: "INV251009",
      templeName: "Rameshwaram Temple",
      templeInitials: "RT",
      templeAddress: "Rameswaram, Tamil Nadu 623526",
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
      cardLast4: "9981",
    },
    {
      id: "Sub ID 010",
      invoiceId: "INV251010",
      templeName: "Badrinath Temple",
      templeInitials: "BT",
      templeAddress: "Badrinath, Chamoli, Uttarakhand 246422",
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
      cardLast4: "3587",
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
          r.receiptId.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.adminEmail.toLowerCase().includes(q)
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

  // ── Metrics (for tab badges) ─────────────────────────────────────

  const counts = useMemo(() => {
    return {
      All: rows.length,
      Pending: rows.filter((r) => r.status === "Pending").length,
      Active: rows.filter((r) => r.status === "Active").length,
      Expired: rows.filter((r) => r.status === "Expired").length,
      Rejected: rows.filter((r) => r.status === "Rejected").length,
    };
  }, [rows]);

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
    showToast(
      `Subscription activated for ${verifyingRow.templeName}. Confirmation email sent to ${verifyingRow.adminEmail}.`,
      "success"
    );
  }, [verifyingRow, showToast]);

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
    showToast(`Subscription rejected for ${verifyingRow.templeName}.`, "error");
  }, [verifyingRow, showToast]);

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
        onClick: () =>
          showToast(`Change plan dialog for ${row.templeName} — coming soon.`, "success"),
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
        onClick: () =>
          showToast(`Extend subscription for ${row.templeName} — coming soon.`, "success"),
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
            ₹{row.amount.toLocaleString()}
          </span>
        ),
      },
      {
        key: "expiresOn",
        header: "Expander",
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

      {/* Invoice Detail Modal */}
      {invoiceRow && (
        <InvoiceModal
          subscription={invoiceRow}
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
