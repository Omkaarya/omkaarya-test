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
  MoreVertical,
  ChevronRight,
  Activity
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Button } from "@/app/components/ds/atoms/Button";

// ── Components ─────────────────────────────────────────────────────

function MetricCard({ title, value, subtitle, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="p-1 rounded-lg bg-zinc-50 dark:bg-zinc-800">
           <Activity className="w-3 h-3 text-zinc-400" />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{value}</h3>
        <p className="text-[11px] mt-1 text-zinc-400 font-medium">{subtitle}</p>
      </div>
    </div>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">POS HQ Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Centralized monitoring and configuration for all temple terminals.</p>
        </div>
        <Link href="/temple-admin/pos/open-session">
          <Button size="lg" leadingIcon={<Plus className="w-4 h-4" />}>
            Open New Terminal
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Registers"
          value="2 / 3"
          subtitle="Running right now"
          icon={Monitor}
          color="bg-blue-50 text-blue-600 dark:bg-blue-950/30"
        />
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden group">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                 <TrendingUp className="w-5 h-5" />
              </div>
              <Badge color="success" size="sm" className="font-bold">LIVE</Badge>
           </div>
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Today's Revenue</p>
           <h3 className="text-3xl font-black text-emerald-600 mt-1">₹ 48,250</h3>
           <div className="mt-4 flex gap-4">
              <div className="flex flex-col">
                 <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Prasadam</span>
                 <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">₹12.4k</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Seva</span>
                 <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">₹32.1k</span>
              </div>
           </div>
        </div>
        <MetricCard
          title="Total Transactions"
          value="246"
          subtitle="Since 6:00 AM"
          icon={BarChart3}
          color="bg-purple-50 text-purple-600 dark:bg-purple-950/30"
        />
        <MetricCard
          title="Cash in Hand"
          value="₹ 18,400"
          subtitle="Verified denominations"
          icon={IndianRupee}
          color="bg-amber-50 text-amber-600 dark:bg-amber-950/30"
        />
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <ActionCard icon={Monitor} label="Launch Terminal" description="Access the sales interface" color="text-blue-500 bg-blue-50" href="/temple-admin/pos/open-session" />
         <ActionCard icon={Settings2} label="Register Config" description="Hardware assignments" color="text-amber-500 bg-amber-50" href="/temple-admin/pos/registers" />
         <ActionCard icon={Clock} label="Shift History" description="Review previous closings" color="text-emerald-500 bg-emerald-50" href="/temple-admin/pos/registers" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Active Terminal Sessions</h3>
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                        <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Register</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cashier</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Sales</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                     {MOCK_SESSIONS.map(session => (
                       <tr key={session.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                   <Monitor className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-zinc-900 dark:text-white">{session.register}</span>
                                   <span className="text-[10px] font-bold text-emerald-600 uppercase">{session.type}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{session.cashier}</span>
                                <span className="text-[10px] text-zinc-400">Active since {session.since}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <span className="text-sm font-black text-[var(--brand-primary)]">{session.total}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                                <ChevronRight className="w-5 h-5" />
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Sales by Channel</h3>
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm space-y-8">
               {SALES_CHANNELS.map(channel => (
                 <div key={channel.label} className="space-y-3">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight">{channel.label}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{channel.count} Transactions</p>
                       </div>
                       <p className="text-sm font-black text-zinc-900 dark:text-white">{channel.value}</p>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                       <div className={`h-full ${channel.color} rounded-full`} style={{ width: channel.width }} />
                    </div>
                 </div>
               ))}
               
               <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
                  <div className="flex gap-3">
                     <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                     <p className="text-[11px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed uppercase">Next Phase: Self-Service Kiosk channels will be integrated here.</p>
                  </div>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}

function ActionCard({ icon: Icon, label, description, color, href }: any) {
  return (
    <Link href={href} className="flex items-center gap-5 p-6 rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[var(--brand-primary)] hover:shadow-md transition-all group">
       <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
       </div>
       <div className="flex flex-col min-w-0">
          <span className="text-sm font-black text-zinc-900 dark:text-white truncate">{label}</span>
          <span className="text-[11px] text-zinc-400 font-medium leading-tight">{description}</span>
       </div>
       <ChevronRight className="w-4 h-4 text-zinc-300 ml-auto group-hover:text-[var(--brand-primary)]" />
    </Link>
  );
}
