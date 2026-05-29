"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/app/components/ds/molecules/Breadcrumb";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { Button } from "@/app/components/ds/atoms/Button";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import { Monitor, Clock, Settings, ArrowRight, MonitorCheck, Loader2, AlertCircle } from "lucide-react";
import {
  fetchTempleAdminJson,
  type DashboardSummary,
  type PosOrder,
  type PosRegister,
  type PosSession,
} from "@/lib/temple-admin-api";

function fmtCurrency(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return `${currency} 0`;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

export default function PosDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [registers, setRegisters] = useState<PosRegister[]>([]);
  const [sessions, setSessions] = useState<PosSession[]>([]);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [sumData, regs, sess, ords] = await Promise.all([
          fetchTempleAdminJson<{ summary: DashboardSummary }>("/api/temple-admin/dashboard/summary"),
          fetchTempleAdminJson<{ items: PosRegister[] }>("/api/temple-admin/pos/registers"),
          fetchTempleAdminJson<{ items: PosSession[] }>("/api/temple-admin/pos/sessions"),
          fetchTempleAdminJson<{ items: PosOrder[] }>("/api/temple-admin/pos/orders?limit=20"),
        ]);
        if (!cancelled) {
          setSummary(sumData.summary ?? null);
          setRegisters(regs.items ?? []);
          setSessions(sess.items ?? []);
          setOrders(ords.items ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load POS data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRegisters = registers.filter((r) => r.is_active).length;
  const openSessions = sessions.filter((s) => s.status === "open");
  const todaysRevenue = summary ? Number(summary.pos.todayTotal) : 0;
  const avgTx = summary && summary.pos.todayOrders > 0
    ? Number(summary.pos.todayTotal) / summary.pos.todayOrders
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <Breadcrumb
            items={[{ label: "Sales", href: "/temple-admin/finance" }, { label: "POS" }]}
            className="mb-2"
          />
          <h1 className="text-display-xs font-bold text-text-primary tracking-tight">Point of Sale</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/temple-admin/pos/open-session">
            <Button size="md" leadingIcon={<Monitor className="w-4 h-4" />}>Open POS Terminal</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Registers"
          value={loading ? "…" : `${activeRegisters} / ${registers.length}`}
          chartColor="gray"
        />
        <MetricCard
          title="Today's Revenue"
          value={loading ? "…" : fmtCurrency(todaysRevenue)}
          chartColor="success"
        />
        <MetricCard
          title="Open Sessions"
          value={loading ? "…" : String(openSessions.length)}
          chartColor="warning"
        />
        <MetricCard
          title="Avg Transaction"
          value={loading ? "…" : fmtCurrency(avgTx)}
          chartColor="brand"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <ActionCard icon={Monitor} title="Terminal" description="Access the checkout interface." href="/temple-admin/pos/open-session" />
        <ActionCard icon={Clock} title="Sessions" description="Manage active shifts." href="/temple-admin/pos/registers" />
        <ActionCard icon={Settings} title="Registers" description="Configure registers." href="/temple-admin/pos/registers" />
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="text-md font-bold text-text-primary">Active Sessions</h3>
          <Link href="/temple-admin/pos/registers">
            <Button variant="outline" size="sm" trailingIcon={<ArrowRight className="w-4 h-4" />}>View Registers</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <thead className="bg-subtle">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Register</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Opened by</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Opened at</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Float</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-text-tertiary text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </div>
                  </td>
                </tr>
              ) : openSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <MonitorCheck className="w-10 h-10 text-text-disabled" />
                      <p className="text-sm font-medium text-text-tertiary">No sessions are currently active.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                openSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-subtle/30">
                    <td className="min-w-0 overflow-hidden px-6 py-4 text-sm font-semibold text-text-primary">
                      <TruncateText title={s.register_name}>{s.register_name}</TruncateText>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{s.opened_by ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{new Date(s.opened_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{fmtCurrency(s.opening_float)}</td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-600 uppercase">Open</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="text-md font-bold text-text-primary">Recent orders</h3>
          <span className="text-xs text-text-tertiary">{orders.length} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <thead className="bg-subtle">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Lines</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-text-tertiary">
                    Loading…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-text-tertiary">
                    No POS orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-6 py-3 text-sm font-mono font-semibold text-text-primary">{o.reference}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{o.line_count}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{o.payment_method ?? "—"}</td>
                    <td className="px-6 py-3 text-xs font-bold uppercase">{o.payment_status}</td>
                    <td className="px-6 py-3 text-sm font-bold text-emerald-600">{fmtCurrency(o.total_amount, o.currency)}</td>
                    <td className="px-6 py-3 text-xs text-text-tertiary">{new Date(o.occurred_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, href }: { icon: React.ElementType; title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-xs hover:border-brand transition-all group flex items-start gap-5">
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-md font-bold text-text-primary mb-1">{title}</h3>
          <p className="text-sm font-medium text-text-tertiary leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );
}
