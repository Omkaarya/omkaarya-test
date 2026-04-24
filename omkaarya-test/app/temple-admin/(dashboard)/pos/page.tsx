"use client";

import { useState } from "react";
import { 
  Monitor, 
  IndianRupee, 
  Users2, 
  BarChart3, 
  ArrowRight, 
  Settings2, 
  Clock, 
  Plus, 
  TrendingUp, 
  PieChart, 
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
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
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{title}</h3>
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

function ActionCard({ 
  href, 
  icon: Icon, 
  iconColor, 
  iconBg, 
  title, 
  description 
}: { 
  href: string; 
  icon: any; 
  iconColor: string; 
  iconBg: string; 
  title: string; 
  description: string;
}) {
  return (
    <Link href={href} className="group flex items-start gap-4 p-5 rounded-xl border border-zinc-200 bg-white shadow-sm hover:border-[var(--brand-primary)] hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-[var(--brand-primary)] transition-colors">{title}</h3>
        <p className="text-xs text-zinc-500 font-medium leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_SESSIONS = [
  { id: '1', register: 'REG-001', type: 'Prasadam', cashier: 'Ramesh Kumar', since: '08:30 AM', total: '₹ 12,400', status: 'Active' },
  { id: '2', register: 'REG-002', type: 'All Categories', cashier: 'Suresh Raina', since: '09:15 AM', total: '₹ 32,150', status: 'Active' },
];

const SALES_CHANNELS = [
  { label: 'Prasadam Counter', value: '₹ 12,400', count: 86, color: 'bg-emerald-500', width: '38%' },
  { label: 'Pooja/Seva Tickets', value: '₹ 32,150', count: 142, color: 'bg-amber-500', width: '52%' },
  { label: 'General Store', value: '₹ 3,700', count: 18, color: 'bg-blue-500', width: '10%' },
];

// ── Page Component ──────────────────────────────────────────────────

export default function PosHqDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            POS HQ Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 font-medium">
            Centralized monitoring and configuration for all temple terminals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/temple-admin/pos/open-session">
            <button className="h-11 px-6 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Open New Terminal
            </button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Registers"
          value="2 / 3"
          subtitle="Running right now"
          icon={Monitor}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/20"
        />
        
        {/* Expanded Revenue Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Today's Revenue</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-950/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">₹ 48,250</p>
            <div className="mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-800 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                <span>Prasadam</span>
                <span className="text-zinc-600 dark:text-zinc-300">₹12,400</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                <span>Pooja/Seva</span>
                <span className="text-zinc-600 dark:text-zinc-300">₹32,150</span>
              </div>
            </div>
          </div>
        </div>

        <MetricCard
          title="Total Transactions"
          value="246"
          subtitle="Since 6:00 AM"
          icon={BarChart3}
          iconBg="bg-purple-50 text-purple-600 dark:bg-purple-950/20"
        />
        <MetricCard
          title="Cash in Hand"
          value="₹ 18,400"
          subtitle="Verified by denominations"
          icon={IndianRupee}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/20"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionCard
          href="/temple-admin/pos/open-session"
          icon={Monitor}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/20"
          title="Launch Terminal"
          description="Access the POS sales interface for this counter."
        />
        <ActionCard
          href="/temple-admin/pos/registers"
          icon={Settings2}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950/20"
          title="Register Config"
          description="Manage hardware and terminal assignments."
        />
        <ActionCard
          href="/temple-admin/pos/registers"
          icon={Clock}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950/20"
          title="Shift Management"
          description="Review denominations and close active shifts."
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Active Terminal Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Active Terminal Sessions</h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Real-time sales monitoring</p>
              </div>
              <button className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:underline uppercase tracking-wider">
                Full Report <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-left">
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Register</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Counter Type</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cashier</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500">Today's Sales</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {MOCK_SESSIONS.map((session) => (
                    <tr key={session.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-zinc-400" />
                          </div>
                          <span className="font-bold text-zinc-900 dark:text-white">{session.register}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={session.type === 'All Categories' ? 'indigo' : 'success'} size="sm" className="font-bold">
                          {session.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">{session.cashier}</span>
                          <span className="text-[10px] text-zinc-500">Since {session.since}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[var(--brand-primary)]">{session.total}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Sales by Channel Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-950/20">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Sales by Channel</h3>
            </div>
            <Badge color="success" size="sm" className="font-bold animate-pulse">LIVE</Badge>
          </div>
          
          <div className="space-y-6 flex-1">
            {SALES_CHANNELS.map((item) => (
              <div key={item.label} className="group cursor-pointer">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.label}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">{item.count} Transactions</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.value}</p>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
             <div className="flex items-center gap-3 text-amber-600">
               <AlertTriangle className="w-4 h-4" />
               <p className="text-[10px] font-bold uppercase tracking-wide leading-tight">Next Phase: Self-Service Kiosk channels will be integrated here.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
