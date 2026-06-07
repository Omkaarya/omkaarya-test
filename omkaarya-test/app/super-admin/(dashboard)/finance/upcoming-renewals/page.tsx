"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { AdminTableToolbar, AdminTableToolbarEnd, AdminTableToolbarStart } from "@/app/components/admin/AdminTableToolbar";
import SelectInput from "@/app/components/admin/SelectInput";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { buildGenerateInvoiceHref } from "@/lib/invoice-temple-prefill";

// ── Types ──────────────────────────────────────────────────────────

type RenewalRow = {
  id: string;
  tenantId: string;
  temple: string;
  templeLocation: string;
  initials: string;
  plan: string;
  billingCycle: string;
  amountCents: number;
  renewalDate: string; // YYYY-MM-DD
  daysLeft: number;
  invoiceSent: boolean;
  status: "active";
};

function planBadgeColor(p: string) {
  if (p === "Prarambha") return "success" as const;
  if (p === "Aaradhana") return "purple" as const;
  if (p === "Sankalpa") return "indigo" as const;
  return "gray" as const;
}

function formatIsoToUi(d: string): string {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function UpcomingRenewalsPage() {
  const [rows, setRows] = useState<RenewalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "sent" | "unsent">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setLoadErr(null);
      try {
        const p = new URLSearchParams();
        p.set("days", "30");
        p.set("page", "1");
        p.set("pageSize", "200");
        const res = await fetch(`/api/subscriptions/upcoming-renewals?${p.toString()}`, { cache: "no-store" });
        const d = (await res.json().catch(() => null)) as
          | { success?: boolean; data?: { data: Array<{ id: string; tenantId?: string; templeName: string; location: string; plan: string; billingCycle: string; amountCents: number; renewalDate: string; daysLeft: number; invoiceSent: boolean }> } }
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
            tenantId: r.tenantId ?? r.id,
            temple: r.templeName,
            templeLocation: r.location,
            initials: (r.templeName.trim().split(/\s+/).filter(Boolean)[0]?.[0] ?? "T") + (r.templeName.trim().split(/\s+/).filter(Boolean)[1]?.[0] ?? ""),
            plan: r.plan,
            billingCycle: r.billingCycle,
            amountCents: r.amountCents,
            renewalDate: r.renewalDate,
            daysLeft: r.daysLeft,
            invoiceSent: r.invoiceSent,
            status: "active",
          }))
        );
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const text = `${r.temple} ${r.templeLocation} ${r.plan}`.toLowerCase();
      const matchQ = !q || text.includes(q);
      const matchInv =
        invoiceFilter === "all" ||
        (invoiceFilter === "sent" && r.invoiceSent) ||
        (invoiceFilter === "unsent" && !r.invoiceSent);
      return matchQ && matchInv;
    });
  }, [rows, search, invoiceFilter]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const pageRows = useMemo(() => {
    const safe = Math.min(page, totalPages);
    const start = (safe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  const columns = useMemo<ColumnDef<RenewalRow>[]>(() => [
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
    { key: "amountCents", header: "Amount due", cell: (r) => <span className="text-sm font-bold text-green-600">{formatUsdFromCents(r.amountCents)}</span> },
    { key: "renewalDate", header: "Renewal date", cell: (r) => <span className="text-xs text-text-tertiary">{formatIsoToUi(r.renewalDate)}</span> },
    {
      key: "daysLeft", header: "Days left",
      cell: (r) => (
        <span className={`text-sm font-bold tabular-nums ${r.daysLeft <= 7 ? "text-red-600" : r.daysLeft <= 14 ? "text-amber-600" : "text-text-tertiary"}`}>
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
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={buildGenerateInvoiceHref({
              tenantId: r.tenantId,
              plan: r.plan,
              billingCycle: r.billingCycle,
            })}
          >
            <Button variant="primary" size="sm">Generate invoice</Button>
          </Link>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-5">
      {loadErr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {loadErr}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Upcoming renewals</h1>
          <p className="mt-1 text-sm text-text-tertiary">Temples whose subscriptions are due for renewal in the next 30 days</p>
        </div>
      </div>

      <div className="rounded-xl border-[1.5px] border-blue-300 bg-blue-50 dark:bg-blue-950/20 p-4 flex gap-3 items-start">
        <span className="text-lg shrink-0 mt-0.5">💡</span>
        <div>
          <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Renewal workflow</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            Generate invoice 30 days before renewal → temple receives email → temple transfers payment → you confirm here → receipt auto-generated → subscription extended. Set reminders at 30, 14, and 7 days before renewal date.
          </p>
        </div>
      </div>

      <AdminListCard>
        <AdminTableToolbar>
          <AdminTableToolbarStart>
            <SearchInput
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={search ? () => setSearch("") : undefined}
              placeholder="Search temple, location, or plan…"
            />
          </AdminTableToolbarStart>
          <AdminTableToolbarEnd>
            <SelectInput
              value={invoiceFilter}
              onChange={(e) => {
                setInvoiceFilter(e.target.value as "all" | "sent" | "unsent");
                setPage(1);
              }}
              className="text-xs text-text-secondary"
              wrapperClassName="w-full min-w-[140px] sm:w-auto"
            >
              <option value="all">All invoices</option>
              <option value="sent">Invoice sent</option>
              <option value="unsent">Invoice not sent</option>
            </SelectInput>
          </AdminTableToolbarEnd>
        </AdminTableToolbar>

        <DataTable<RenewalRow>
          columns={columns}
          data={pageRows}
          keyExtractor={(r) => r.id}
          isLoading={loading}
          loadingRows={pageSize}
        />

        <AdminPagination
          page={Math.min(page, totalPages)}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
        <p className="border-t border-border px-4 py-3 text-xs text-text-tertiary">
          {totalFiltered} renewal{totalFiltered !== 1 ? "s" : ""} in the next 30 days · {rows.length} loaded
        </p>
      </AdminListCard>
    </div>
  );
}
