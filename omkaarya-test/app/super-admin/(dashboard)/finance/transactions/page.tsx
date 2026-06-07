"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { formatMoneyFromCents } from "@/lib/temple-pricing-plans";
import { useBillingCurrency } from "@/lib/use-billing-currency";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { AlertCircle, CheckCircle2, Download, X } from "lucide-react";

import SelectInput from "@/app/components/admin/SelectInput";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { AdminTableToolbar, AdminTableToolbarEnd, AdminTableToolbarStart } from "@/app/components/admin/AdminTableToolbar";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { KpiTileGridSkeleton } from "@/app/components/admin/ApiFetchPlaceholders";

// ── Types ──────────────────────────────────────────────────────────

type Transaction = {
  id: string;
  date: string;
  temple: string;
  templeLocation: string;
  initials: string;
  invoiceId: string;
  invoiceUuid: string;
  plan: string;
  amount: string;
  method: string;
  status: "paid" | "pending" | "overdue";
};

function statusBadgeColor(s: string) {
  if (s === "paid") return "success" as const;
  if (s === "pending") return "warning" as const;
  return "error" as const;
}
function statusLabel(s: string) {
  if (s === "paid") return "Paid";
  if (s === "pending") return "Pending confirmation";
  return "Overdue";
}
function planBadgeColor(p: string) {
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "pink" as const;
}

function Toast({ message, onClose, variant = "success" }: { message: string; onClose: () => void; variant?: "success" | "error" }) {
  const isError = variant === "error";
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border px-5 py-4 shadow-xl ${
      isError
        ? "border-red-500/20 bg-red-50 text-red-800"
        : "border-success-500/20 bg-status-success-bg text-status-success-text"
    }`}>
      {isError ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
      <p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

type ApiTx = {
  id: string;
  date: string;
  temple: string;
  templeLocation: string;
  templeInitials: string;
  invoiceId: string;
  invoiceRef: string;
  plan: string;
  amountCents: number;
  currency: string;
  method: string;
  status: "paid" | "pending" | "overdue";
};

function mapTx(r: ApiTx, currency: string): Transaction {
  const rowCurrency = r.currency || currency;
  return {
    id: r.id,
    date: r.date,
    temple: r.temple,
    templeLocation: r.templeLocation,
    initials: r.templeInitials,
    invoiceId: r.invoiceRef,
    invoiceUuid: r.invoiceId,
    plan: r.plan,
    amount: formatMoneyFromCents(r.amountCents, rowCurrency),
    method: r.method,
    status: r.status,
  };
}

export default function TransactionsPage() {
  const billingCurrency = useBillingCurrency();
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("this-month");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");
  const [rows, setRows] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [listTotal, setListTotal] = useState(0);
  const [kpis, setKpis] = useState<{
    paidAmountCents: number;
    paidCount: number;
    pendingAmountCents: number;
    pendingCount: number;
    overdueAmountCents: number;
    overdueCount: number;
    avgCollectionDays: number | null;
  } | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [kpisLoading, setKpisLoading] = useState(true);

  const showToast = useCallback((msg: string, variant: "success" | "error" = "success") => {
    setToastVariant(variant);
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setListLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("page", String(page));
      p.set("pageSize", String(pageSize));
      if (statusFilter !== "all") p.set("status", statusFilter);
      if (planFilter !== "all") p.set("plan", planFilter);
      if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
      if (periodFilter !== "custom") p.set("period", periodFilter);
      const res = await fetch(`/api/billing/transactions?${p.toString()}`, { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { data: ApiTx[]; totalPages: number; total?: number } }
        | null;
      if (!d || d.success !== true || !d.data) {
        setRows([]);
        setTotalPages(1);
        setListTotal(0);
        showToast(jsonApiErrorMessage(d) || "Failed to load transactions", "error");
        return;
      }
      setRows((d.data.data ?? []).map((row) => mapTx(row, billingCurrency)));
      setTotalPages(Math.max(1, d.data.totalPages));
      setListTotal(typeof d.data.total === "number" ? d.data.total : (d.data.data ?? []).length);
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize, statusFilter, planFilter, searchDebounced, showToast, periodFilter, billingCurrency]);

  const loadKpis = useCallback(async () => {
    setKpisLoading(true);
    try {
      const p = new URLSearchParams();
      if (periodFilter !== "custom") p.set("period", periodFilter);
      const res = await fetch(`/api/billing/transactions/kpis?${p.toString()}`, { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { paidAmountCents: number; paidCount: number; pendingAmountCents: number; pendingCount: number; overdueAmountCents: number; overdueCount: number; avgCollectionDays: number | null } }
        | null;
      if (!d || d.success !== true || !d.data) {
        setKpis(null);
        return;
      }
      setKpis(d.data);
    } finally {
      setKpisLoading(false);
    }
  }, [periodFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch transactions when deps change
    void load();
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch KPIs when period changes
    void loadKpis();
  }, [loadKpis]);

  const pageRows = rows;

  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    { key: "date", header: "Date", cell: (r) => <span className="text-xs text-text-tertiary">{r.date}</span> },
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
    { key: "invoiceId", header: "Invoice", cell: (r) => <span className="text-xs font-mono text-text-tertiary" title={r.id}>{r.invoiceId}</span> },
    { key: "plan", header: "Plan", cell: (r) => <Badge color={planBadgeColor(r.plan)} size="sm" dot>{r.plan}</Badge> },
    { key: "amount", header: "Amount", cell: (r) => <span className="text-sm font-bold text-green-600">{r.amount}</span> },
    { key: "method", header: "Method", cell: (r) => <Badge color="indigo" size="sm">🏦 {r.method}</Badge> },
    { key: "status", header: "Status", cell: (r) => <Badge color={statusBadgeColor(r.status)} size="sm" dot>{statusLabel(r.status)}</Badge> },
    {
      key: "actions", header: "Actions", align: "right",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          {r.status === "paid" && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const res = await fetch(`/api/billing/invoices/${encodeURIComponent(r.invoiceUuid)}/receipt`, { cache: "no-store" });
                const d = (await res.json().catch(() => null)) as { success?: boolean; data?: { receiptId?: string } } | null;
                const rid = d && d.success === true && d.data && typeof d.data.receiptId === "string" ? d.data.receiptId : "";
                if (!rid) {
                  showToast(jsonApiErrorMessage(d) || "Receipt not found for this invoice", "error");
                  return;
                }
                window.open(`/super-admin/finance/receipts/view?id=${encodeURIComponent(rid)}`, "_blank", "noopener,noreferrer");
              }}
            >
              Receipt
            </Button>
          )}
          {(r.status === "pending" || r.status === "overdue") && (
            <Button variant="primary" size="sm" onClick={() => window.open("/super-admin/finance/confirm-payments", "_self")}>
              Confirm payments
            </Button>
          )}
        </div>
      ),
    },
  ], [showToast]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Transactions</h1>
          <p className="mt-1 text-sm text-text-tertiary">All subscription payments received from temples — bank transfers and confirmed payments</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leadingIcon={<Download className="h-4 w-4" />}
          disabled={listLoading}
          onClick={() => {
            const p = new URLSearchParams();
            if (statusFilter !== "all") p.set("status", statusFilter);
            if (planFilter !== "all") p.set("plan", planFilter);
            if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
            if (periodFilter !== "custom") p.set("period", periodFilter);
            window.open(`/api/billing/transactions/export?${p.toString()}`, "_blank", "noopener,noreferrer");
          }}
        >
          Export CSV
        </Button>
      </div>

      {/* Metric Cards */}
      {kpisLoading ? (
        <KpiTileGridSkeleton columns={4} />
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Total received</p>
            <p className="text-2xl font-bold text-green-600">{formatMoneyFromCents(kpis?.paidAmountCents ?? 0, billingCurrency)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">{kpis?.paidCount ?? 0} payment(s) confirmed</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Pending confirmation</p>
            <p className="text-2xl font-bold text-amber-600">{formatMoneyFromCents(kpis?.pendingAmountCents ?? 0, billingCurrency)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">{kpis?.pendingCount ?? 0} invoice(s) awaiting bank transfer</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{formatMoneyFromCents(kpis?.overdueAmountCents ?? 0, billingCurrency)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">{kpis?.overdueCount ?? 0} invoice(s) past due date</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Avg collection time</p>
            <p className="text-xl font-bold text-text-primary">{kpis?.avgCollectionDays === null || kpis === null ? "—" : `${kpis.avgCollectionDays} days`}</p>
            <p className="text-[10px] text-text-tertiary mt-1">invoice to payment</p>
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
              placeholder="Search temple or transaction…"
            />
          </AdminTableToolbarStart>
          <AdminTableToolbarEnd>
            <SelectInput
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs text-text-secondary"
              wrapperClassName="w-full min-w-[140px] sm:w-auto"
            >
              <option value="all">All status</option>
              <option value="paid">Confirmed</option>
              <option value="pending">Pending confirmation</option>
              <option value="overdue">Overdue</option>
            </SelectInput>
            <SelectInput
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs text-text-secondary"
              wrapperClassName="w-full min-w-[120px] sm:w-auto"
            >
              <option value="all">All plans</option>
              <option value="Aaradhana">Aaradhana</option>
              <option value="Sankalpa">Sankalpa</option>
              <option value="Prarambha">Prarambha</option>
            </SelectInput>
            <SelectInput
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs text-text-secondary"
              wrapperClassName="w-full min-w-[120px] sm:w-auto"
            >
              <option value="this-month">This month</option>
              <option value="last-month">Last month</option>
              <option value="this-year">This year</option>
              <option value="custom">Custom range</option>
            </SelectInput>
          </AdminTableToolbarEnd>
        </AdminTableToolbar>

        <DataTable<Transaction>
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
          {listTotal} result{listTotal !== 1 ? "s" : ""} matching filters · page {page} of {totalPages}
        </p>
      </AdminListCard>

      {toast && <Toast message={toast} variant={toastVariant} onClose={() => setToast(null)} />}
    </div>
  );
}
