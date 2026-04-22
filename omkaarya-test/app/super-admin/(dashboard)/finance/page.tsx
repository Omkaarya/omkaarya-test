"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileText,
  Landmark,
  Plus,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

// ── Types ──────────────────────────────────────────────────────────

type TempleSummary = {
  id: string;
  name: string;
  location: string;
  portalUrl: string;
  initials: string;
  plan: "Aaradhana" | "Sankalpa" | "Praramba";
  billing: string;
  amount: string;
  status: "active" | "pending" | "trial";
  nextRenewal: string;
};

// ── Helpers ──────────────────────────────────────────────────────────

function statusBadgeColor(s: string) {
  if (s === "active") return "success" as const;
  if (s === "pending") return "warning" as const;
  if (s === "trial") return "warning" as const;
  return "gray" as const;
}

function statusLabel(s: string) {
  if (s === "active") return "Active";
  if (s === "pending") return "Awaiting payment";
  if (s === "trial") return "Trial";
  return s;
}

function planBadgeColor(p: string) {
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "pink" as const;
}

// ── Mock Data ──────────────────────────────────────────────────────

const TEMPLES: TempleSummary[] = [
  { id: "1", name: "Shiva Temple", location: "London, UK", portalUrl: "shiva-london.omkaarya.com", initials: "ST", plan: "Aaradhana", billing: "Bank transfer", amount: "$1,099/yr", status: "active", nextRenewal: "20 Apr 2027" },
  { id: "2", name: "Sri Murugan Kovil", location: "Zurich, CH", portalUrl: "murugan-zurich.omkaarya.com", initials: "SM", plan: "Sankalpa", billing: "Bank transfer", amount: "$699/yr", status: "active", nextRenewal: "14 Feb 2027" },
  { id: "3", name: "Lakshmi Mandir", location: "Toronto, CA", portalUrl: "lakshmi-toronto.omkaarya.com", initials: "LM", plan: "Aaradhana", billing: "Bank transfer", amount: "$1,099/yr", status: "pending", nextRenewal: "—" },
  { id: "4", name: "Ganesh Temple", location: "Singapore", portalUrl: "ganesh-sg.omkaarya.com", initials: "GT", plan: "Praramba", billing: "Bank transfer", amount: "$299/yr", status: "active", nextRenewal: "28 Feb 2027" },
  { id: "5", name: "Durga Devi Temple", location: "Amsterdam, NL", portalUrl: "durga-amsterdam.omkaarya.com", initials: "DD", plan: "Sankalpa", billing: "Bank transfer", amount: "$699/yr", status: "trial", nextRenewal: "—" },
  { id: "6", name: "Balaji Tirupati Mandir", location: "Mississauga, CA", portalUrl: "balaji-ca.omkaarya.com", initials: "BT", plan: "Praramba", billing: "Bank transfer", amount: "$299/yr", status: "active", nextRenewal: "4 Jan 2027" },
];

// ── Bar Chart Component ──────────────────────────────────────────

function HorizontalBarChart({ title, subtitle, bars }: {
  title: string;
  subtitle?: string;
  bars: { label: string; value: string; percentage: number; color: string }[];
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
        {subtitle && <span className="text-[10px] text-text-tertiary">{subtitle}</span>}
      </div>
      <div className="space-y-3">
        {bars.map((bar, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-[140px] text-right shrink-0 truncate">{bar.label}</span>
            <div className="flex-1 bg-subtle rounded h-[22px] overflow-hidden">
              <div
                className={`h-full rounded flex items-center px-2 transition-all duration-500 ${bar.color}`}
                style={{ width: `${bar.percentage}%` }}
              >
                <span className="text-[10px] font-bold text-white whitespace-nowrap">{bar.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-success-500/20 bg-status-success-bg text-status-success-text px-5 py-4 shadow-xl">
      <CheckCircle2 className="h-5 w-5 shrink-0" />
      <p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────

export default function RevenueDashboard() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  const columns = useMemo<ColumnDef<TempleSummary>[]>(() => [
    {
      key: "name", header: "Temple", sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-sm">🛕</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{r.name}</p>
            <p className="text-[10px] text-text-tertiary truncate">{r.location} · {r.portalUrl}</p>
          </div>
        </div>
      ),
    },
    {
      key: "plan", header: "Plan",
      cell: (r) => <Badge color={planBadgeColor(r.plan)} size="sm" dot>{r.plan}</Badge>,
    },
    {
      key: "billing", header: "Billing",
      cell: () => <Badge color="indigo" size="sm">Bank transfer</Badge>,
    },
    {
      key: "amount", header: "Amount",
      cell: (r) => <span className="text-sm font-bold text-green-600">{r.amount}</span>,
    },
    {
      key: "status", header: "Status",
      cell: (r) => <Badge color={statusBadgeColor(r.status)} size="sm" dot>{statusLabel(r.status)}</Badge>,
    },
    {
      key: "nextRenewal", header: "Next renewal",
      cell: (r) => <span className="text-xs text-text-tertiary">{r.nextRenewal}</span>,
    },
    {
      key: "actions", header: "Actions", align: "right",
      cell: () => (
        <div className="flex items-center gap-1.5">
          <Link href="/super-admin/finance/invoices/generate">
            <Button variant="outline" size="sm">Invoice</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => showToast("Opening receipt…")}>Receipt</Button>
        </div>
      ),
    },
  ], [showToast]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Revenue Dashboard</h1>
          <p className="mt-1 text-sm text-text-tertiary">Pepulux subscription revenue from all onboarded temples · April 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leadingIcon={<Download className="h-4 w-4" />} onClick={() => showToast("Exporting report…")}>Export</Button>
          <Link href="/super-admin/finance/invoices/generate">
            <Button variant="primary" size="sm" leadingIcon={<Plus className="h-4 w-4" />}>Generate invoice</Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="text-lg mb-2">💰</div>
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">MRR (Monthly Recurring)</p>
          <p className="text-2xl font-bold text-green-600">$2,847</p>
          <p className="text-[10px] text-text-tertiary mt-1">from 8 active temples</p>
          <p className="text-[10px] font-semibold text-green-600 mt-1">↑ 18% vs last month</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="text-lg mb-2">📈</div>
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">ARR (Annual Recurring)</p>
          <p className="text-2xl font-bold text-brand">$34,164</p>
          <p className="text-[10px] text-text-tertiary mt-1">projected annual revenue</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="text-lg mb-2">⏳</div>
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Pending payments</p>
          <p className="text-2xl font-bold text-amber-600">$3,297</p>
          <p className="text-[10px] text-text-tertiary mt-1">3 invoices awaiting bank transfer</p>
          <p className="text-[10px] font-semibold text-amber-600 mt-1">2 overdue &gt; 14 days</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="text-lg mb-2">🛕</div>
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">Active temples</p>
          <p className="text-2xl font-bold text-indigo-600">8</p>
          <p className="text-[10px] text-text-tertiary mt-1">2 on trial · 6 paying</p>
        </div>
      </div>

      {/* Two Charts Side by Side */}
      <div className="grid grid-cols-2 gap-3">
        <HorizontalBarChart
          title="Revenue by plan"
          subtitle="this month"
          bars={[
            { label: "Aaradhana (Yearly)", value: "$1,099 × 2", percentage: 62, color: "bg-brand" },
            { label: "Sankalpa (Yearly)", value: "$699 × 3", percentage: 38, color: "bg-indigo-500" },
            { label: "Praramba (Yearly)", value: "$299 × 3", percentage: 20, color: "bg-purple-500" },
          ]}
        />
        <HorizontalBarChart
          title="Monthly revenue trend"
          bars={[
            { label: "January", value: "$997", percentage: 35, color: "bg-green-500" },
            { label: "February", value: "$1,398", percentage: 48, color: "bg-green-500" },
            { label: "March", value: "$2,097", percentage: 62, color: "bg-green-500" },
            { label: "April (current)", value: "$2,847", percentage: 78, color: "bg-brand" },
          ]}
        />
      </div>

      {/* Temple Subscription Summary Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text-primary">Temple subscription summary</h2>
          <Link href="/super-admin/finance/subscriptions">
            <Button variant="outline" size="sm">View all →</Button>
          </Link>
        </div>
        <div className="bg-surface rounded-xl border border-border shadow-xs">
          <DataTable<TempleSummary> columns={columns} data={TEMPLES} keyExtractor={(r) => r.id} />
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
