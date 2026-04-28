"use client";

import { 
  Building2, 
  Users, 
  CreditCard, 
  Banknote, 
  CalendarDays, 
  TrendingUp, 
  Globe, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Monitor
} from "lucide-react";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";

// ── Page Component ──────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
            Analytics Overview
          </h1>
          <p className="mt-1 text-sm text-text-tertiary font-medium">
            Global platform health, multi-tenant performance, and financial monitoring.
          </p>
        </div>
        <Badge color="success" size="sm" className="font-bold py-1 px-3">
          SYSTEM ONLINE
        </Badge>
      </div>

      {/* ── SECTION 1: Temple Analytics ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Building2 className="w-4 h-4 text-text-disabled" />
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Global Temple Health</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Temples"
            value="142"
            trendLabel="Across 12 Countries"
            chartColor="brand"
          />
          <MetricCard
            title="Plan Breakdown"
            value="64%"
            trendLabel="Aaradhana Premium"
            chartColor="brand"
          />
          <MetricCard
            title="Global Devotees"
            value="1.2M+"
            trendLabel="Total platform footprint"
            chartColor="brand"
          />
          <MetricCard
            title="Avg. Compliance"
            value="98.2%"
            trendLabel="Node verification rate"
            chartColor="success"
          />
        </div>
      </div>

      {/* ── SECTION 2: Financial & Subscription Analytics ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-4 h-4 text-text-disabled" />
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Financial Performance</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value="₹ 14.2M"
            trendLabel="Platform collections YTD"
            chartColor="success"
          />
          <MetricCard
            title="Pending Subs"
            value="14"
            trendLabel="Awaiting verification"
            chartColor="warning"
          />
          <MetricCard
            title="Active Subs"
            value="128"
            trendLabel="Verified accounts"
            chartColor="brand"
          />
          <MetricCard
            title="Avg. MRR"
            value="₹ 840K"
            trendLabel="Recurring Revenue"
            chartColor="brand"
          />
        </div>
      </div>

      {/* ── SECTION 3: Operations & Reports ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Revenue by Plan Chart Placeholder */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between shadow-xs min-h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight">Revenue Breakdown by Plan</h3>
            </div>
            <button className="text-xs font-bold text-text-tertiary hover:text-brand transition-colors">7 DAYS</button>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl text-text-disabled text-xs font-medium">
             Chart: Aaradhana (64%), Sankalpa (28%), Prarambha (8%)
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
           <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight mb-4">Critical Alerts</h3>
           <div className="space-y-3">
              {[
                { title: 'Payment Verification', time: '2h ago', type: 'pending' },
                { title: 'Trial Expiring: Kashi Vishwanath', time: '5h ago', type: 'warning' },
                { title: 'New Temple Onboarded', time: '8h ago', type: 'success' },
              ].map((alert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-subtle border border-border">
                  <div className={`w-2 h-2 rounded-full ${alert.type === 'pending' ? 'bg-amber-500' : alert.type === 'warning' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-text-primary">{alert.title}</p>
                    <p className="text-[10px] text-text-tertiary">{alert.time}</p>
        <AdminFiltersBar
          search={searchInput}
          onSearchChange={setSearchInput}
          status={statusFilter}
          onStatusChange={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          country={country}
          onCountryChange={(nextCountry) => {
            setCountry(nextCountry);
            setPage(1);
          }}
          countries={countries}
          sortBy={sortBy}
          onSortByChange={(nextSortBy) => {
            setSortBy(nextSortBy as TemplesSortBy);
            setPage(1);
          }}
        />

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <p className="px-4 py-10 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <AdminDataTable
            headers={tableHeaders}
            isEmpty={rows.length === 0}
            empty={
              <p className="px-4 py-12 text-center text-sm text-zinc-500">
                No temples match your filters.
              </p>
            }
          >
            {rows.map((row) => (
              <tr key={row.tenantId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Temp ID {row.tenantId}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                      aria-hidden
                    >
                      {initials(row.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</p>
                      {row.portalHost ? (
                        <a
                          href={`https://${row.portalHost}`}
                          className="truncate text-xs text-zinc-500 hover:text-[var(--brand-primary)] dark:text-zinc-400"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {row.portalHost}
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">—</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-text-disabled" />
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
