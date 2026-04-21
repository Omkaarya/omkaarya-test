"use client";

import { useState, useMemo, useCallback } from "react";
import { Bell, CheckCircle2, Download, FileText, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

// ── Types ──────────────────────────────────────────────────────────

type RenewalRow = {
  id: string;
  temple: string;
  templeLocation: string;
  initials: string;
  plan: "Aaradhana" | "Sankalpa" | "Praramba";
  amount: string;
  renewalDate: string;
  daysLeft: number;
  invoiceSent: boolean;
  status: "active";
};

function planBadgeColor(p: string) {
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "pink" as const;
}

// ── Mock Data ──────────────────────────────────────────────────────

const mockRenewals: RenewalRow[] = [
  { id: "RNW-001", temple: "Shiva Temple", templeLocation: "London", initials: "ST", plan: "Aaradhana", amount: "$1,099", renewalDate: "20 Apr 2027", daysLeft: 364, invoiceSent: false, status: "active" },
  { id: "RNW-002", temple: "Sri Mariamman", templeLocation: "Copenhagen", initials: "SM", plan: "Sankalpa", amount: "$699", renewalDate: "19 Mar 2027", daysLeft: 332, invoiceSent: false, status: "active" },
  { id: "RNW-003", temple: "Balaji Tirupati Mandir", templeLocation: "Mississauga", initials: "BT", plan: "Praramba", amount: "$299", renewalDate: "4 Jan 2027", daysLeft: 258, invoiceSent: false, status: "active" },
  { id: "RNW-004", temple: "Ganesh Temple", templeLocation: "Singapore", initials: "GT", plan: "Praramba", amount: "$299", renewalDate: "28 Feb 2027", daysLeft: 313, invoiceSent: false, status: "active" },
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-success-500/20 bg-status-success-bg text-status-success-text px-5 py-4 shadow-xl">
      <CheckCircle2 className="h-5 w-5 shrink-0" /><p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

export default function UpcomingRenewalsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  const columns = useMemo<ColumnDef<RenewalRow>[]>(() => [
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
    { key: "amount", header: "Amount due", cell: (r) => <span className="text-sm font-bold text-green-600">{r.amount}</span> },
    { key: "renewalDate", header: "Renewal date", cell: (r) => <span className="text-xs text-text-tertiary">{r.renewalDate}</span> },
    {
      key: "daysLeft", header: "Days left",
      cell: (r) => (
        <span className={`text-sm font-bold tabular-nums ${r.daysLeft < 30 ? "text-red-600" : r.daysLeft < 60 ? "text-amber-600" : "text-text-tertiary"}`}>
          {r.daysLeft} days
        </span>
      ),
    },
    {
      key: "invoiceSent", header: "Invoice sent?",
      cell: (r) => (
        <span className={`text-xs ${r.invoiceSent ? "text-green-600 font-semibold" : "text-text-tertiary"}`}>
          {r.invoiceSent ? "✓ Sent" : "Not yet"}
        </span>
      ),
    },
    {
      key: "status", header: "Status",
      cell: () => <Badge color="success" size="sm" dot>Active</Badge>,
    },
    {
      key: "actions", header: "Actions", align: "right",
      cell: () => (
        <div className="flex items-center gap-1.5">
          <Link href="/super-admin/finance/invoices/generate">
            <Button variant="primary" size="sm">Generate invoice</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => showToast("Reminder sent!")}>Remind</Button>
        </div>
      ),
    },
  ], [showToast]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Upcoming renewals</h1>
          <p className="mt-1 text-sm text-text-tertiary">Temples whose subscriptions are due for renewal in the next 60 days</p>
        </div>
        <Button variant="primary" size="sm" leadingIcon={<Bell className="h-4 w-4" />} onClick={() => showToast("Sending renewal reminders…")}>Send all reminders</Button>
      </div>

      {/* Info Alert Banner */}
      <div className="rounded-xl border-[1.5px] border-blue-300 bg-blue-50 dark:bg-blue-950/20 p-4 flex gap-3 items-start">
        <span className="text-lg shrink-0 mt-0.5">💡</span>
        <div>
          <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Renewal workflow</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            Generate invoice 30 days before renewal → temple receives email → temple transfers payment → you confirm here → receipt auto-generated → subscription extended. Set reminders at 30, 14, and 7 days before renewal date.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border shadow-xs">
        <DataTable<RenewalRow> columns={columns} data={mockRenewals} keyExtractor={(r) => r.id} />
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
