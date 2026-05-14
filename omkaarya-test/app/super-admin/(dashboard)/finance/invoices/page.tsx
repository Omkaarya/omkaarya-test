"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import {
  Calendar,
  CheckCircle2,
  Download,
  Expand,
  Eye,
  FileText,
  ChevronDown,
  Plus,
  Send,
  X,
} from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { AdminTableToolbar, AdminTableToolbarEnd, AdminTableToolbarStart } from "@/app/components/admin/AdminTableToolbar";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────

type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

type Invoice = {
  id: string;
  num: string;
  temple: string;
  templeLocation: string;
  templeAddress: string;
  adminEmail: string;
  plan: string;
  period: string;
  amount: string;
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  amountCents: number;
  currency: string;
};

function statusColor(s: InvoiceStatus) {
  switch (s) {
    case "paid": return "success" as const;
    case "pending": return "warning" as const;
    case "overdue": return "error" as const;
    case "draft": return "gray" as const;
  }
}

function statusLabel(s: InvoiceStatus) {
  switch (s) {
    case "paid": return "Paid";
    case "pending": return "Awaiting payment";
    case "overdue": return "Overdue";
    case "draft": return "Draft";
  }
}

function planBadgeColor(p: string) {
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "pink" as const;
}

function formatDate(d: string) {
  if (!d || d === "—") return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

const FILTERS = [
  { id: "all", label: "All invoices" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Awaiting payment" },
  { id: "overdue", label: "Overdue" },
  { id: "draft", label: "Draft" },
] as const;

// ── Actions Dropdown ────────────────────────────────────────────────

function ActionsDropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors" aria-expanded={open} aria-label="Open actions menu">
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
      {open && <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-150" onClick={() => setOpen(false)}><div className="p-1.5">{children}</div></div>}
    </div>
  );
}

function DropdownItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-subtle hover:text-text-primary transition-colors">
      {icon}{label}
    </button>
  );
}

// ── Invoice Detail Modal ────────────────────────────────────────────

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

function InvoiceModal({
  invoice,
  profile,
  onClose,
}: {
  invoice: Invoice;
  profile: BillingProfile | null;
  onClose: () => void;
}) {
  const currency = invoice.currency || profile?.money?.currency || "USD";
  const taxRateBps = profile?.tax?.rateBps ?? 0;
  const taxCents = Math.max(0, Math.round(((invoice.amountCents ?? 0) * taxRateBps) / 10_000));
  const subtotal = formatMoney(currency, invoice.amountCents ?? 0);
  const tax = formatMoney(currency, taxCents);
  const total = formatMoney(currency, (invoice.amountCents ?? 0) + taxCents);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface shadow-xs">
              <FileText className="h-5 w-5 text-text-tertiary" />
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"><Expand className="h-4 w-4" /></button>
              <button onClick={onClose} className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"><X className="h-5 w-5" /></button>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-bold text-text-primary">Invoice #{invoice.num} Details</h3>
          <p className="text-sm text-text-tertiary">Manage your invoice details here.</p>
        </div>
        <div className="space-y-6 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg">🛕</div>
          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">Invoice</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-text-secondary"><FileText className="h-4 w-4 text-text-tertiary" />{invoice.num}</div>
              <div className="flex items-center gap-2 text-sm text-text-secondary"><Calendar className="h-4 w-4 text-text-tertiary" />Issued On: {formatDate(invoice.issuedDate)}</div>
              <div className="flex items-center gap-2 text-sm text-text-secondary"><Calendar className="h-4 w-4 text-text-tertiary" />Due On: {formatDate(invoice.dueDate)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Invoice From:</p>
              <p className="text-sm font-medium text-text-primary">{profile?.issuer?.name ?? "—"}</p>
              <p className="text-sm text-text-secondary">{profile?.issuer?.address ?? "—"}</p>
              <p className="text-sm text-text-tertiary">{profile?.issuer?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Invoice To:</p>
              <p className="text-sm font-medium text-text-primary">{invoice.temple}</p>
              <p className="text-sm text-text-secondary">{invoice.templeAddress}</p>
              <p className="text-sm text-text-tertiary">{invoice.adminEmail}</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left">
              <thead><tr className="border-b border-border bg-subtle">
                <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Plan</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Period</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Issued</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Due</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Amount</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Status</th>
              </tr></thead>
              <tbody><tr>
                <td className="px-4 py-3 text-sm text-text-primary">{invoice.plan}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{invoice.period}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(invoice.issuedDate)}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(invoice.dueDate)}</td>
                <td className="px-4 py-3 text-sm text-text-primary tabular-nums font-semibold">{invoice.amount}</td>
                <td className="px-4 py-3"><Badge color={statusColor(invoice.status)} size="sm" dot>{statusLabel(invoice.status)}</Badge></td>
              </tr></tbody>
            </table>
          </div>
          <div className="flex items-start justify-between gap-8">
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Payment Info</p>
              <p className="text-sm text-text-secondary">
                {(profile?.paymentMethodLabel ?? "—")}{profile?.bank?.accountName ? ` — ${profile.bank.accountName}` : ""}
              </p>
              <p className="text-sm text-text-secondary">Amount: {subtotal}</p>
            </div>
            <div className="text-right space-y-1 min-w-[200px]">
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Sub Total</span><span className="text-text-primary tabular-nums">{subtotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">{profile?.tax?.label ?? "Tax"}</span><span className="text-text-primary tabular-nums">{tax}</span></div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border"><span className="text-text-primary">Total</span><span className="text-text-primary tabular-nums">{total}</span></div>
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 p-5">
            <p className="text-sm font-bold text-text-primary mb-2">Terms and Conditions</p>
            <ul className="text-sm text-text-secondary space-y-1.5 list-disc pl-4">
              <li>All payments must be made according to the agreed schedule. Late payments may incur additional fees.</li>
              <li>We are not liable for any indirect, incidental, or consequential damages.</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="primary" leadingIcon={<Download className="h-4 w-4" />}>Download Invoice</Button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-success-500/20 bg-status-success-bg text-status-success-text px-5 py-4 shadow-xl">
      <CheckCircle2 className="h-5 w-5 shrink-0" /><p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

type ApiRow = {
  id: string;
  num: string;
  temple: string;
  templeLocation: string;
  templeAddress: string;
  adminEmail: string;
  plan: string;
  period: string;
  amountCents: number;
  issuedDate: string;
  dueDate: string | null;
  status: InvoiceStatus;
  currency: string;
  isTrialProforma: boolean;
};

function mapApiRow(r: ApiRow): Invoice {
  return {
    id: r.id,
    num: r.num,
    temple: r.temple,
    templeLocation: r.templeLocation,
    templeAddress: r.templeAddress,
    adminEmail: r.adminEmail,
    plan: r.plan,
    period: r.period,
    amount: formatUsdFromCents(r.amountCents),
    issuedDate: r.issuedDate,
    dueDate: r.dueDate ?? "—",
    status: r.status,
    amountCents: r.amountCents,
    currency: r.currency,
  };
}

// ── Page ────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rows, setRows] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [listTotal, setListTotal] = useState(0);
  const [listTotalPages, setListTotalPages] = useState(1);
  const [kpi, setKpi] = useState({ all: 0, paid: 0, pending: 0, overdue: 0, draft: 0, loading: true, error: "" });
  const [searchDebounced, setSearchDebounced] = useState("");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  const statusForApi = (tab: string) => {
    if (tab === "all") return "all";
    if (tab === "pending") return "awaiting";
    return tab;
  };

  const loadKpi = useCallback(async () => {
    setKpi((k) => ({ ...k, loading: true, error: "" }));
    const paths = [
      { key: "all" as const, s: "all" },
      { key: "paid" as const, s: "paid" },
      { key: "pending" as const, s: "awaiting" },
      { key: "overdue" as const, s: "overdue" },
      { key: "draft" as const, s: "draft" },
    ];
    try {
      const out: Record<string, number> = { all: 0, paid: 0, pending: 0, overdue: 0, draft: 0 };
      for (const { key, s } of paths) {
        const p = new URLSearchParams();
        p.set("status", s);
        p.set("page", "1");
        p.set("pageSize", "1");
        const res = await fetch(`/api/billing/invoices?${p.toString()}`, { cache: "no-store" });
        const d = (await res.json().catch(() => null)) as
          | { success?: boolean; data?: { total?: number } }
          | null;
        if (d && typeof d === "object" && "success" in d && d.success && d.data && typeof d.data.total === "number") {
          out[key] = d.data.total;
        }
      }
      setKpi({
        all: out.all ?? 0,
        paid: out.paid ?? 0,
        pending: out.pending ?? 0,
        overdue: out.overdue ?? 0,
        draft: out.draft ?? 0,
        loading: false,
        error: "",
      });
    } catch (e) {
      const err = e instanceof Error ? e.message : "Load failed";
      setKpi((k) => ({ ...k, loading: false, error: err }));
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const profRes = await fetch("/api/billing/profile", { cache: "no-store" });
      const prof = (await profRes.json().catch(() => null)) as { success?: boolean; data?: BillingProfile } | null;
      if (!cancel && prof && prof.success === true && prof.data) {
        setProfile(prof.data);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const loadList = useCallback(async () => {
    const p = new URLSearchParams();
    p.set("status", statusForApi(filter));
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
    const res = await fetch(`/api/billing/invoices?${p.toString()}`, { cache: "no-store" });
    const d = (await res.json().catch(() => null)) as
      | { success?: boolean; data?: { data: ApiRow[]; total: number; totalPages: number } }
      | null;
    if (!d || d.success !== true || !d.data) {
      setRows([]);
      setListTotal(0);
      setListTotalPages(1);
      showToast(jsonApiErrorMessage(d) || "Failed to load invoices");
      return;
    }
    setRows((d.data.data ?? []).map(mapApiRow));
    setListTotal(d.data.total);
    setListTotalPages(Math.max(1, d.data.totalPages));
  }, [filter, page, pageSize, searchDebounced, showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load invoice KPI counts
    void loadKpi();
  }, [loadKpi]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load paginated invoice list
    void loadList();
  }, [loadList]);

  const counts = {
    all: kpi.all,
    paid: kpi.paid,
    pending: kpi.pending,
    overdue: kpi.overdue,
    draft: kpi.draft,
  };

  const pageRows = rows;
  const totalPages = listTotalPages;

  const columns = useMemo<ColumnDef<Invoice>[]>(() => [
    { key: "num", header: "Invoice no.", cell: (r) => <span className="text-xs font-mono text-text-tertiary">{r.num}</span> },
    {
      key: "temple", header: "Temple", sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-sm">🛕</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{r.temple}</p>
            <p className="text-[10px] text-text-tertiary truncate">{r.templeLocation}</p>
          </div>
        </div>
      ),
    },
    { key: "plan", header: "Plan", cell: (r) => <Badge color={planBadgeColor(r.plan)} size="sm" dot>{r.plan}</Badge> },
    { key: "period", header: "Period", cell: (r) => <span className="text-xs text-text-tertiary">{r.period}</span> },
    { key: "amount", header: "Amount", cell: (r) => <span className="text-sm font-bold text-text-primary">{r.amount}</span> },
    { key: "issuedDate", header: "Issue date", cell: (r) => <span className="text-xs text-text-tertiary">{r.issuedDate}</span> },
    { key: "dueDate", header: "Due date", cell: (r) => <span className={`text-xs ${r.status === "overdue" ? "text-red-600 font-semibold" : "text-text-tertiary"}`}>{r.dueDate}</span> },
    { key: "status", header: "Status", cell: (r) => <Badge color={statusColor(r.status)} size="sm" dot>{statusLabel(r.status)}</Badge> },
    {
      key: "actions", header: "Actions", align: "right",
      cell: (r) => {
        const items: React.ReactNode[] = [];
        if (r.status === "paid") {
          items.push(
            <DropdownItem
              key="receipt"
              icon={<Eye className="h-4 w-4" />}
              label="Receipt"
              onClick={async () => {
                const res = await fetch(`/api/billing/invoices/${encodeURIComponent(r.id)}/receipt`, { cache: "no-store" });
                const d = (await res.json().catch(() => null)) as { success?: boolean; data?: { receiptId?: string } } | null;
                const rid = d && d.success === true && d.data && typeof d.data.receiptId === "string" ? d.data.receiptId : "";
                if (!rid) {
                  showToast(jsonApiErrorMessage(d) || "Receipt not found for this invoice");
                  return;
                }
                window.open(`/super-admin/finance/receipts/view?id=${encodeURIComponent(rid)}`, "_blank", "noopener,noreferrer");
              }}
            />
          );
        }
        if (r.status === "pending" || r.status === "overdue") {
          items.push(
            <DropdownItem
              key="confirm"
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Confirm payments"
              onClick={() => window.open("/super-admin/finance/confirm-payments", "_self")}
            />
          );
        }
        items.push(<DropdownItem key="view" icon={<Eye className="h-4 w-4" />} label="View" onClick={() => setViewInvoice(r)} />);
        items.push(
          <DropdownItem
            key="email"
            icon={<Send className="h-4 w-4" />}
            label="Email to temple"
            onClick={async () => {
              const res = await fetch(`/api/billing/invoices/${encodeURIComponent(r.id)}/email`, {
                method: "POST",
                headers: { Accept: "application/json" },
              });
              const d = await res.json().catch(() => null);
              if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
                showToast(jsonApiErrorMessage(d) || "Failed to email invoice");
                return;
              }
              showToast(`Invoice emailed to ${r.temple}`);
            }}
          />
        );
        items.push(
          <DropdownItem
            key="export"
            icon={<Download className="h-4 w-4" />}
            label="Export CSV"
            onClick={() => {
              const p = new URLSearchParams();
              if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
              p.set("status", statusForApi(filter));
              window.open(`/api/billing/invoices/export?${p.toString()}`, "_blank", "noopener,noreferrer");
            }}
          />
        );
        return <ActionsDropdown>{items}</ActionsDropdown>;
      },
    },
  ], [showToast, filter, searchDebounced]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Invoices</h1>
          <p className="mt-1 text-sm text-text-tertiary">Subscription invoices sent to temples — track payment status and generate receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/super-admin/finance/invoices/generate">
            <Button variant="primary" size="sm" leadingIcon={<Plus className="h-4 w-4" />}>Generate invoice</Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Paid invoices</p>
          <p className="text-2xl font-bold text-green-600">{kpi.loading ? "…" : counts.paid}</p>
          <p className="text-[10px] text-text-tertiary mt-1">all time (total count)</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Awaiting payment</p>
          <p className="text-2xl font-bold text-amber-600">{kpi.loading ? "…" : counts.pending}</p>
          <p className="text-[10px] text-text-tertiary mt-1">pending in system</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Overdue (&gt;14 days)</p>
          <p className="text-2xl font-bold text-red-600">{kpi.loading ? "…" : counts.overdue}</p>
          <p className="text-[10px] text-text-tertiary mt-1">past due date</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Draft invoices</p>
          <p className="text-xl font-bold text-text-primary">{kpi.loading ? "…" : counts.draft}</p>
          <p className="text-[10px] text-text-tertiary mt-1">pro-forma or draft</p>
        </div>
      </div>

      <AdminListCard>
        <AdminTableToolbar stacked>
          <AdminTableToolbarStart>
            <SearchInput
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={search ? () => { setSearch(""); setPage(1); } : undefined}
              placeholder="Search temple, invoice no., or email…"
            />
          </AdminTableToolbarStart>
          <AdminTableToolbarEnd className="w-full md:w-full">
            <div className="overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
              <div className="flex min-w-max gap-1 rounded-xl border border-border bg-subtle p-1 sm:min-w-0 sm:flex-1">
                {FILTERS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setFilter(id);
                      setPage(1);
                    }}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:flex-1 sm:px-4 sm:py-2.5 ${
                      filter === id ? "bg-brand-50 text-brand font-bold shadow-xs" : "text-text-tertiary hover:text-text-primary"
                    }`}
                  >
                    {label} ({counts[id as keyof typeof counts]})
                  </button>
                ))}
              </div>
            </div>
          </AdminTableToolbarEnd>
        </AdminTableToolbar>

        <DataTable<Invoice> columns={columns} data={pageRows} keyExtractor={(r) => r.id} />

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
          {listTotal} result{listTotal !== 1 ? "s" : ""} for this status and search · page {page} of {totalPages}
        </p>
      </AdminListCard>

      {viewInvoice && <InvoiceModal invoice={viewInvoice} profile={profile} onClose={() => setViewInvoice(null)} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
