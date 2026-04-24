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

// ── Components ─────────────────────────────────────────────────────

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconBg 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: any; 
  iconBg: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
        <p className="text-[11px] mt-1 text-zinc-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Page Component ──────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Analytics Overview
          </h1>
          <p className="mt-1 text-sm text-zinc-500 font-medium">
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
          <Building2 className="w-4 h-4 text-zinc-400" />
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Global Temple Health</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Temples"
            value="142"
            subtitle="Across 12 Countries"
            icon={Globe}
            iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/20"
          />
          <MetricCard
            title="Plan Breakdown"
            value="64%"
            subtitle="Aaradhana Premium"
            icon={CreditCard}
            iconBg="bg-purple-50 text-purple-600 dark:bg-purple-950/20"
          />
          <MetricCard
            title="Global Devotees"
            value="1.2M+"
            subtitle="Total platform footprint"
            icon={Users}
            iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
          />
          <MetricCard
            title="Avg. Compliance"
            value="98.2%"
            subtitle="Node verification rate"
            icon={ShieldCheck}
            iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/20"
          />
        </div>
      </div>

      {/* ── SECTION 2: Financial & Subscription Analytics ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-4 h-4 text-zinc-400" />
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Financial Performance</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value="₹ 14.2M"
            subtitle="Platform collections YTD"
            icon={TrendingUp}
            iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
          />
          <MetricCard
            title="Pending Subs"
            value="14"
            subtitle="Awaiting verification"
            icon={AlertTriangle}
            iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/20"
          />
          <MetricCard
            title="Active Subs"
            value="128"
            subtitle="Verified accounts"
            icon={CheckCircle2}
            iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/20"
          />
          <MetricCard
            title="Avg. MRR"
            value="₹ 840K"
            subtitle="Recurring Revenue"
            icon={Banknote}
            iconBg="bg-purple-50 text-purple-600 dark:bg-purple-950/20"
          />
        </div>
      </div>

      {/* ── SECTION 3: Operations & Reports ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Revenue by Plan Chart Placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 flex flex-col justify-between shadow-sm min-h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[var(--brand-primary)]" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Revenue Breakdown by Plan</h3>
            </div>
            <button className="text-xs font-bold text-zinc-400 hover:text-[var(--brand-primary)] transition-colors">7 DAYS</button>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs font-medium">
             Chart: Aaradhana (64%), Sankalpa (28%), Prarambha (8%)
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-sm">
           <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-4">Critical Alerts</h3>
           <div className="space-y-3">
              {[
                { title: 'Payment Verification', time: '2h ago', type: 'pending' },
                { title: 'Trial Expiring: Kashi Vishwanath', time: '5h ago', type: 'warning' },
                { title: 'New Temple Onboarded', time: '8h ago', type: 'success' },
              ].map((alert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className={`w-2 h-2 rounded-full ${alert.type === 'pending' ? 'bg-amber-500' : alert.type === 'warning' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{alert.title}</p>
                    <p className="text-[10px] text-zinc-500">{alert.time}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-300" />
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
