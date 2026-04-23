"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Bell, CheckCircle2, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";

// ── Types ──────────────────────────────────────────────────────────

type RenewalRow = {
  id: string;
  temple: string;
  templeLocation: string;
  initials: string;
  plan: string;
  amountCents: number;
  renewalDate: string; // YYYY-MM-DD
  daysLeft: number;
  invoiceSent: boolean;
  status: "active";
};

function planBadgeColor(p: string) {
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "pink" as const;
}

function formatIsoToUi(d: string): string {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

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
  const [rows, setRows] = useState<RenewalRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadErr(null);
      const p = new URLSearchParams();
      p.set("days", "60");
      p.set("page", "1");
      p.set("pageSize", "200");
      const res = await fetch(`/api/subscriptions/upcoming-renewals?${p.toString()}`, { cache: "no-store" });
      const d = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { data: Array<{ id: string; templeName: string; location: string; plan: string; billingCycle: string; amountCents: number; renewalDate: string; daysLeft: number; invoiceSent: boolean }> } }
        | null;
      if (cancel) return;
      if (!d || d.success !== true || !d.data) {
        setRows([]);
        setLoadErr(jsonApiErrorMessage(d) || "Failed to load upcoming renewals");
        return;
      }
      setRows(
        (d.data.data ?? []).map((r) => ({
          id: r.id,
          temple: r.templeName,
          templeLocation: r.location,
          initials: (r.templeName.trim().split(/\s+/).filter(Boolean)[0]?.[0] ?? "T") + (r.templeName.trim().split(/\s+/).filter(Boolean)[1]?.[0] ?? ""),
          plan: r.plan,
          amountCents: r.amountCents,
          renewalDate: r.renewalDate,
          daysLeft: r.daysLeft,
          invoiceSent: r.invoiceSent,
          status: "active",
        }))
      );
    })();
    return () => { cancel = true; };
  }, []);

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
    { key: "amountCents", header: "Amount due", cell: (r) => <span className="text-sm font-bold text-green-600">{formatUsdFromCents(r.amountCents)}</span> },
    { key: "renewalDate", header: "Renewal date", cell: (r) => <span className="text-xs text-text-tertiary">{formatIsoToUi(r.renewalDate)}</span> },
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
        </div>
      ),
    },
  ], [showToast]);

  return (
    <div className="space-y-5">
      {loadErr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {loadErr}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Upcoming renewals</h1>
          <p className="mt-1 text-sm text-text-tertiary">Temples whose subscriptions are due for renewal in the next 60 days</p>
        </div>
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
        <DataTable<RenewalRow> columns={columns} data={rows} keyExtractor={(r) => r.id} />
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
