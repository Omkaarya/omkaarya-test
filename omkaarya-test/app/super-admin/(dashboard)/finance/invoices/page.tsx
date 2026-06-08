"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { formatMoneyOrZero } from "@/lib/billing/invoice-defaults";
import { buildInvoiceDocumentFromListRow } from "@/lib/billing/invoice-document-mappers";
import { downloadInvoiceAsPdf } from "@/lib/billing/download-invoice-pdf";
import type { BillingProfile } from "@/lib/billing/invoice-types";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Plus,
  Send,
  X,
} from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { InvoiceDetailModal } from "@/app/components/billing/InvoiceDetailModal";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { AdminTableToolbar, AdminTableToolbarEnd, AdminTableToolbarStart } from "@/app/components/admin/AdminTableToolbar";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { ActionGroupCell } from "@/app/components/ds/molecules/TableCells";
import { KpiTileGridSkeleton } from "@/app/components/admin/ApiFetchPlaceholders";
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
  issuedDateRaw: string;
  dueDateRaw: string | null;
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

// ── Invoice Detail Modal ────────────────────────────────────────────

function InvoiceModal({
  invoice,
  profile,
  onClose,
  onDownload,
}: {
  invoice: Invoice;
  profile: BillingProfile | null;
  onClose: () => void;
  onDownload?: () => void;
}) {
  const document = buildInvoiceDocumentFromListRow({
    invoiceNumber: invoice.num,
    issuedDate: invoice.issuedDateRaw,
    dueDate: invoice.dueDateRaw,
    statusLabel: statusLabel(invoice.status),
    templeName: invoice.temple,
    templeAddress: invoice.templeAddress,
    adminEmail: invoice.adminEmail,
    plan: invoice.plan,
    period: invoice.period,
    amountCents: invoice.amountCents,
    currency: invoice.currency,
    profile,
    paymentReference: invoice.num,
  });

  return (
    <InvoiceDetailModal
      title={`Invoice #${invoice.num} Details`}
      document={document}
      onClose={onClose}
      onDownload={onDownload}
    />
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
  const currency = r.currency || "USD";
  return {
    id: r.id,
    num: r.num,
    temple: r.temple,
    templeLocation: r.templeLocation,
    templeAddress: r.templeAddress,
    adminEmail: r.adminEmail,
    plan: r.plan,
    period: r.period,
    amount: formatMoneyOrZero(r.amountCents, currency),
    issuedDateRaw: r.issuedDate,
    dueDateRaw: r.dueDate,
    issuedDate: formatDate(r.issuedDate),
    dueDate: r.dueDate ? formatDate(r.dueDate) : "—",
    status: r.status,
    amountCents: r.amountCents,
    currency,
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
  const [listLoading, setListLoading] = useState(true);
  const [searchDebounced, setSearchDebounced] = useState("");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  const handleDownloadInvoicePdf = useCallback(
    async (invoice: Invoice) => {
      try {
        showToast(`Preparing PDF for ${invoice.num}…`);
        await downloadInvoiceAsPdf(invoice.id, invoice.num);
        showToast(`Invoice ${invoice.num} downloaded`);
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Failed to download invoice PDF");
      }
    },
    [showToast]
  );

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
    setListLoading(true);
    try {
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
    } finally {
      setListLoading(false);
    }
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
      key: "temple", header: "Temple", sortable: false,
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
      cell: (r) => (
        <ActionGroupCell>
          {r.status === "paid" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconOnly
              title="Receipt"
              aria-label="Receipt"
              onClick={async (e) => {
                e.stopPropagation();
                const res = await fetch(`/api/billing/invoices/${encodeURIComponent(r.id)}/receipt`, { cache: "no-store" });
                const d = (await res.json().catch(() => null)) as { success?: boolean; data?: { receiptId?: string } } | null;
                const rid = d && d.success === true && d.data && typeof d.data.receiptId === "string" ? d.data.receiptId : "";
                if (!rid) {
                  showToast(jsonApiErrorMessage(d) || "Receipt not found for this invoice");
                  return;
                }
                window.open(`/super-admin/finance/receipts/view?id=${encodeURIComponent(rid)}`, "_blank", "noopener,noreferrer");
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {(r.status === "pending" || r.status === "overdue") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconOnly
              title="Confirm payments"
              aria-label="Confirm payments"
              onClick={(e) => {
                e.stopPropagation();
                window.open("/super-admin/finance/confirm-payments", "_self");
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            title="View"
            aria-label="View invoice"
            onClick={(e) => {
              e.stopPropagation();
              setViewInvoice(r);
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            title="Email to temple"
            aria-label="Email to temple"
            onClick={async (e) => {
              e.stopPropagation();
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
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            title="Download PDF"
            aria-label="Download invoice PDF"
            onClick={async (e) => {
              e.stopPropagation();
              await handleDownloadInvoicePdf(r);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </ActionGroupCell>
      ),
    },
  ], [showToast, handleDownloadInvoicePdf]);

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
      {kpi.loading ? (
        <KpiTileGridSkeleton columns={4} />
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Paid invoices</p>
            <p className="text-2xl font-bold text-green-600">{counts.paid}</p>
            <p className="text-[10px] text-text-tertiary mt-1">all time (total count)</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Awaiting payment</p>
            <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
            <p className="text-[10px] text-text-tertiary mt-1">pending in system</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Overdue (&gt;14 days)</p>
            <p className="text-2xl font-bold text-red-600">{counts.overdue}</p>
            <p className="text-[10px] text-text-tertiary mt-1">past due date</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Draft invoices</p>
            <p className="text-xl font-bold text-text-primary">{counts.draft}</p>
            <p className="text-[10px] text-text-tertiary mt-1">pro-forma or draft</p>
          </div>
        </div>
      )}

      <AdminListCard>
        <AdminTableToolbar>
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
          <AdminTableToolbarEnd>
            <div className="overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
              <div className="flex min-w-max gap-1 rounded-xl border border-border bg-subtle p-1">
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

        <DataTable<Invoice>
          columns={columns}
          data={pageRows}
          keyExtractor={(r) => r.id}
          isLoading={listLoading}
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
          {listTotal} result{listTotal !== 1 ? "s" : ""} for this status and search · page {page} of {totalPages}
        </p>
      </AdminListCard>

      {viewInvoice && (
        <InvoiceModal
          invoice={viewInvoice}
          profile={profile}
          onClose={() => setViewInvoice(null)}
          onDownload={() => {
            void handleDownloadInvoicePdf(viewInvoice);
          }}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
