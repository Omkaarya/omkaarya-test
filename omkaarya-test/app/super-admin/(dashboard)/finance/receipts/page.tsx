"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { CheckCircle2, Download, Eye, MoreVertical, Send, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { Pagination } from "@/app/components/ds/molecules/Pagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

// ── Types ──────────────────────────────────────────────────────────

type ReceiptRow = {
  id: string;
  num: string;
  temple: string;
  templeLocation: string;
  invoiceRef: string;
  plan: "Aaradhana" | "Sankalpa" | "Praramba";
  amount: string;
  paymentDate: string;
  method: string;
};

function planBadgeColor(p: string) {
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "pink" as const;
}

// ── Actions Dropdown ────────────────────────────────────────────────

function ActionsDropdown({ actions }: { actions: { label: string; icon: React.ReactNode; onClick: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors">
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1.5">
            {actions.map((a, i) => (
              <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); a.onClick(); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-subtle hover:text-text-primary transition-colors">
                {a.icon}{a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mock Data ──────────────────────────────────────────────────────

const mockReceipts: ReceiptRow[] = [
  { id: "1", num: "RCPT-2026-0018", temple: "Shiva Temple", templeLocation: "London", invoiceRef: "INV-2026-0022", plan: "Aaradhana", amount: "$1,099.00", paymentDate: "18 Apr 2026", method: "Bank transfer" },
  { id: "2", num: "RCPT-2026-0017", temple: "Ganesh Temple", templeLocation: "Singapore", invoiceRef: "INV-2026-0021", plan: "Praramba", amount: "$299.00", paymentDate: "28 Mar 2026", method: "Bank transfer" },
  { id: "3", num: "RCPT-2026-0016", temple: "Sri Mariamman", templeLocation: "Copenhagen", invoiceRef: "INV-2026-0020", plan: "Sankalpa", amount: "$699.00", paymentDate: "22 Mar 2026", method: "Bank transfer" },
  { id: "4", num: "RCPT-2026-0015", temple: "Balaji Tirupati Mandir", templeLocation: "Mississauga", invoiceRef: "INV-2026-0019", plan: "Praramba", amount: "$299.00", paymentDate: "14 Mar 2026", method: "Bank transfer" },
  { id: "5", num: "RCPT-2026-0014", temple: "Sri Murugan Kovil", templeLocation: "Zurich", invoiceRef: "INV-2026-0018", plan: "Sankalpa", amount: "$699.00", paymentDate: "4 Mar 2026", method: "Bank transfer" },
];

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
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const pageSize = 10;

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockReceipts;
    return mockReceipts.filter(r => r.temple.toLowerCase().includes(q) || r.num.toLowerCase().includes(q) || r.invoiceRef.toLowerCase().includes(q));
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

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
          <Link href="/super-admin/finance/receipts/view"><Button variant="outline" size="sm">View</Button></Link>
          <Button variant="outline" size="sm" onClick={() => showToast(`Downloading ${r.num}…`)}>PDF</Button>
          <Button variant="outline" size="sm" onClick={() => showToast(`Emailed to ${r.temple}!`)}>Email</Button>
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
        <Button variant="outline" size="sm" leadingIcon={<Download className="h-4 w-4" />} onClick={() => showToast("Exporting…")}>Export</Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Receipts issued</p>
          <p className="text-2xl font-bold text-green-600">18</p>
          <p className="text-[10px] text-text-tertiary mt-1">all time</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">This month</p>
          <p className="text-xl font-bold text-text-primary">4</p>
          <p className="text-[10px] text-text-tertiary mt-1">$4,295 confirmed</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Pending (no receipt yet)</p>
          <p className="text-xl font-bold text-text-primary">2</p>
          <p className="text-[10px] text-text-tertiary mt-1">awaiting payment confirmation</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-full max-w-[260px]">
          <SearchInput value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }} onClear={search ? () => { setSearch(""); setPage(1); } : undefined} placeholder="Search temple or receipt…" />
        </div>
        <select className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary outline-none focus:border-brand transition-colors cursor-pointer">
          <option>This year</option>
          <option>This month</option>
          <option>Custom range</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border shadow-xs">
        <DataTable<ReceiptRow> columns={columns} data={pageRows} keyExtractor={(r) => r.id} />
        <div className="px-6"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} showResultsCount /></div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
