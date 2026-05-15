"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { CheckCircle2, Download, X } from "lucide-react";
import Link from "next/link";

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

type ReceiptRow = {
  id: string;
  num: string;
  temple: string;
  templeLocation: string;
  invoiceRef: string;
  plan: string;
  amount: string;
  paymentDate: string;
  method: string;
};

function planBadgeColor(p: string) {
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "pink" as const;
}

type ApiR = {
  id: string;
  num: string;
  temple: string;
  templeLocation: string;
  invoiceRef: string;
  plan: string;
  amountCents: number;
  paymentDate: string;
  method: string;
};

function mapR(r: ApiR): ReceiptRow {
  return {
    id: r.id,
    num: r.num,
    temple: r.temple,
    templeLocation: r.templeLocation,
    invoiceRef: r.invoiceRef,
    plan: r.plan,
    amount: formatUsdFromCents(r.amountCents),
    paymentDate: r.paymentDate,
    method: r.method,
  };
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-success-500/20 bg-status-success-bg text-status-success-text px-5 py-4 shadow-xl">
      <CheckCircle2 className="h-5 w-5 shrink-0" /><p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

export default function ReceiptsPage() {
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"this-year" | "this-month">("this-month");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<string | null>(null);
  const [rows, setRows] = useState<ReceiptRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [listTotal, setListTotal] = useState(0);
  const [kpis, setKpis] = useState<{
    receiptsIssuedAllTime: number;
    receiptsIssuedThisPeriod: number;
    confirmedAmountCentsThisPeriod: number;
    pendingCount: number;
  } | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [kpisLoading, setKpisLoading] = useState(true);

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

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
      if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
      p.set("period", periodFilter);
      const res = await fetch(`/api/billing/receipts?${p.toString()}`, { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { data: ApiR[]; totalPages: number; total?: number } }
        | null;
      if (!d || d.success !== true || !d.data) {
        setRows([]);
        setTotalPages(1);
        setListTotal(0);
        showToast(jsonApiErrorMessage(d) || "Failed to load receipts");
        return;
      }
      setRows((d.data.data ?? []).map(mapR));
      setTotalPages(Math.max(1, d.data.totalPages));
      setListTotal(typeof d.data.total === "number" ? d.data.total : (d.data.data ?? []).length);
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize, searchDebounced, showToast, periodFilter]);

  const loadKpis = useCallback(async () => {
    setKpisLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("period", periodFilter);
      const res = await fetch(`/api/billing/receipts/kpis?${p.toString()}`, { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { receiptsIssuedAllTime: number; receiptsIssuedThisPeriod: number; confirmedAmountCentsThisPeriod: number; pendingCount: number } }
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch receipts when deps change
    void load();
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch KPIs when period changes
    void loadKpis();
  }, [loadKpis]);

  const pageRows = rows;

  const columns = useMemo<ColumnDef<ReceiptRow>[]>(() => [
    { key: "num", header: "Receipt no.", cell: (r) => <span className="text-xs font-mono text-text-tertiary">{r.num}</span> },
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
    { key: "invoiceRef", header: "Invoice ref", cell: (r) => <span className="text-xs font-mono text-text-tertiary">{r.invoiceRef}</span> },
    { key: "plan", header: "Plan", cell: (r) => <Badge color={planBadgeColor(r.plan)} size="sm" dot>{r.plan}</Badge> },
    { key: "amount", header: "Amount paid", cell: (r) => <span className="text-sm font-bold text-green-600">{r.amount}</span> },
    { key: "paymentDate", header: "Payment date", cell: (r) => <span className="text-xs text-text-tertiary">{r.paymentDate}</span> },
    { key: "method", header: "Method", cell: (r) => <Badge color="indigo" size="sm">🏦 {r.method}</Badge> },
    {
      key: "actions", header: "Actions", align: "right",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/super-admin/finance/receipts/view?id=${encodeURIComponent(r.id)}`}><Button variant="outline" size="sm">View</Button></Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/api/billing/receipts/${encodeURIComponent(r.id)}/print`, "_blank", "noopener,noreferrer")}
          >
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const res = await fetch(`/api/billing/receipts/${encodeURIComponent(r.id)}/email`, {
                method: "POST",
                headers: { Accept: "application/json" },
              });
              const d = await res.json().catch(() => null);
              if (!res.ok || (d && typeof d === "object" && "success" in d && (d as { success?: boolean }).success === false)) {
                showToast(jsonApiErrorMessage(d) || "Failed to email receipt");
                return;
              }
              showToast(`Receipt emailed to ${r.temple}`);
            }}
          >
            Email
          </Button>
        </div>
      ),
    },
  ], [showToast]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Receipts</h1>
          <p className="mt-1 text-sm text-text-tertiary">Payment receipts issued to temples after bank transfer confirmed — PDF auto-generated</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leadingIcon={<Download className="h-4 w-4" />}
          onClick={() => {
            const p = new URLSearchParams();
            if (searchDebounced.trim()) p.set("q", searchDebounced.trim());
            p.set("period", periodFilter);
            window.open(`/api/billing/receipts/export?${p.toString()}`, "_blank", "noopener,noreferrer");
          }}
        >
          Export
        </Button>
      </div>

      {/* Metric Cards */}
      {kpisLoading ? (
        <KpiTileGridSkeleton columns={3} />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Receipts issued</p>
            <p className="text-2xl font-bold text-green-600">{kpis?.receiptsIssuedAllTime ?? 0}</p>
            <p className="text-[10px] text-text-tertiary mt-1">all time</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">{periodFilter === "this-year" ? "This year" : "This month"}</p>
            <p className="text-xl font-bold text-text-primary">{kpis?.receiptsIssuedThisPeriod ?? 0}</p>
            <p className="text-[10px] text-text-tertiary mt-1">{formatUsdFromCents(kpis?.confirmedAmountCentsThisPeriod ?? 0)} confirmed</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Pending (no receipt yet)</p>
            <p className="text-xl font-bold text-text-primary">{kpis?.pendingCount ?? 0}</p>
            <p className="text-[10px] text-text-tertiary mt-1">awaiting payment confirmation</p>
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
              placeholder="Search temple or receipt…"
            />
          </AdminTableToolbarStart>
          <AdminTableToolbarEnd>
            <SelectInput
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value as "this-year" | "this-month");
                setPage(1);
              }}
              className="text-xs text-text-secondary"
              wrapperClassName="w-full min-w-[120px] sm:w-auto"
            >
              <option value="this-year">This year</option>
              <option value="this-month">This month</option>
            </SelectInput>
          </AdminTableToolbarEnd>
        </AdminTableToolbar>

        <DataTable<ReceiptRow>
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
