"use client";

import { useState, useMemo, useCallback } from "react";
import { CheckCircle2, Download, X } from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { Pagination } from "@/app/components/ds/molecules/Pagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

// ── Types ──────────────────────────────────────────────────────────

type Transaction = {
  id: string;
  date: string;
  temple: string;
  templeLocation: string;
  initials: string;
  invoiceId: string;
  plan: "Aaradhana" | "Sankalpa" | "Praramba";
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

// ── Mock Data ──────────────────────────────────────────────────────

const mockTransactions: Transaction[] = [
  { id: "TXN-001", date: "18 Apr", temple: "Shiva Temple", templeLocation: "London", initials: "ST", invoiceId: "INV-2026-0022", plan: "Aaradhana", amount: "$1,099.00", method: "Bank transfer", status: "paid" },
  { id: "TXN-002", date: "28 Mar", temple: "Ganesh Temple", templeLocation: "Singapore", initials: "GT", invoiceId: "INV-2026-0021", plan: "Praramba", amount: "$299.00", method: "Bank transfer", status: "paid" },
  { id: "TXN-003", date: "22 Mar", temple: "Sri Mariamman", templeLocation: "Copenhagen", initials: "SM", invoiceId: "INV-2026-0020", plan: "Sankalpa", amount: "$699.00", method: "Bank transfer", status: "paid" },
  { id: "TXN-004", date: "14 Mar", temple: "Balaji Tirupati", templeLocation: "Mississauga", initials: "BT", invoiceId: "INV-2026-0019", plan: "Praramba", amount: "$299.00", method: "Bank transfer", status: "paid" },
  { id: "TXN-005", date: "4 Mar", temple: "Sri Murugan Kovil", templeLocation: "Zurich", initials: "MK", invoiceId: "INV-2026-0018", plan: "Sankalpa", amount: "$699.00", method: "Bank transfer", status: "paid" },
  { id: "TXN-006", date: "21 Apr", temple: "Lakshmi Mandir", templeLocation: "Toronto", initials: "LM", invoiceId: "INV-2026-0025", plan: "Aaradhana", amount: "$1,099.00", method: "Bank transfer", status: "pending" },
  { id: "TXN-007", date: "18 Apr", temple: "Sri Murugan Kovil", templeLocation: "Zurich", initials: "MK", invoiceId: "INV-2026-0024", plan: "Sankalpa", amount: "$699.00", method: "Bank transfer", status: "pending" },
  { id: "TXN-008", date: "10 Apr", temple: "Venkateswara", templeLocation: "Oslo", initials: "VT", invoiceId: "INV-2026-0023", plan: "Praramba", amount: "$299.00", method: "Bank transfer", status: "overdue" },
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-success-500/20 bg-status-success-bg text-status-success-text px-5 py-4 shadow-xl">
      <CheckCircle2 className="h-5 w-5 shrink-0" /><p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("this-month");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const pageSize = 10;

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  const filtered = useMemo(() => {
    let list = mockTransactions;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(t => t.temple.toLowerCase().includes(q) || t.invoiceId.toLowerCase().includes(q));
    if (statusFilter !== "all") list = list.filter(t => t.status === statusFilter);
    if (planFilter !== "all") list = list.filter(t => t.plan === planFilter);
    return list;
  }, [search, statusFilter, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    { key: "date", header: "Date", cell: (r) => <span className="text-xs text-text-tertiary">{r.date}</span> },
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
    { key: "invoiceId", header: "Invoice", cell: (r) => <span className="text-xs font-mono text-text-tertiary">{r.invoiceId}</span> },
    { key: "plan", header: "Plan", cell: (r) => <Badge color={planBadgeColor(r.plan)} size="sm" dot>{r.plan}</Badge> },
    { key: "amount", header: "Amount", cell: (r) => <span className="text-sm font-bold text-green-600">{r.amount}</span> },
    { key: "method", header: "Method", cell: (r) => <Badge color="indigo" size="sm">🏦 {r.method}</Badge> },
    { key: "status", header: "Status", cell: (r) => <Badge color={statusBadgeColor(r.status)} size="sm" dot>{statusLabel(r.status)}</Badge> },
    {
      key: "actions", header: "Actions", align: "right",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          {r.status === "paid" && <Button variant="outline" size="sm" onClick={() => showToast("Opening receipt…")}>Receipt</Button>}
          {r.status === "pending" && <Button variant="primary" size="sm" onClick={() => showToast("Navigating to confirm…")}>Confirm</Button>}
          {r.status === "overdue" && <Button variant="outline" size="sm" onClick={() => showToast("Reminder sent!")}>Remind</Button>}
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
        <Button variant="outline" size="sm" leadingIcon={<Download className="h-4 w-4" />} onClick={() => showToast("Exporting…")}>Export</Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Total received (Apr)</p>
          <p className="text-2xl font-bold text-green-600">$5,592</p>
          <p className="text-[10px] text-text-tertiary mt-1">6 payments confirmed</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Pending confirmation</p>
          <p className="text-2xl font-bold text-amber-600">$2,198</p>
          <p className="text-[10px] text-text-tertiary mt-1">2 transfers submitted</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Overdue</p>
          <p className="text-2xl font-bold text-red-600">$1,099</p>
          <p className="text-[10px] text-text-tertiary mt-1">1 temple — 18 days overdue</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Avg collection time</p>
          <p className="text-xl font-bold text-text-primary">4.2 days</p>
          <p className="text-[10px] text-text-tertiary mt-1">invoice to payment</p>
        </div>
      </div>

      {/* Toolbar: Search + Dropdown Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-full max-w-[260px]">
          <SearchInput value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }} onClear={search ? () => { setSearch(""); setPage(1); } : undefined} placeholder="Search temple or transaction…" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary outline-none focus:border-brand transition-colors cursor-pointer">
          <option value="all">All status</option>
          <option value="paid">Confirmed</option>
          <option value="pending">Pending confirmation</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary outline-none focus:border-brand transition-colors cursor-pointer">
          <option value="all">All plans</option>
          <option value="Aaradhana">Aaradhana</option>
          <option value="Sankalpa">Sankalpa</option>
          <option value="Praramba">Praramba</option>
        </select>
        <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary outline-none focus:border-brand transition-colors cursor-pointer">
          <option value="this-month">This month</option>
          <option value="last-month">Last month</option>
          <option value="this-year">This year</option>
          <option value="custom">Custom range</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border shadow-xs">
        <DataTable<Transaction> columns={columns} data={pageRows} keyExtractor={(r) => r.id} />
        <div className="px-6"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} showResultsCount /></div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
