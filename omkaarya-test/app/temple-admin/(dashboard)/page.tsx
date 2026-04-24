"use client";

import { 
  DollarSign, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ChevronRight,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";

// ── Components ─────────────────────────────────────────────────────

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 tracking-tight uppercase">{title}</p>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{value}</h3>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function TempleDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Temple Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Namaste! Here's what's happening at your temple today.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">24 Apr, 2024</span>
           </div>
           <Link href="/temple-admin/pos/open-session" className="px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">
             Open POS
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daily Collection" 
          value="₹42,850" 
          change="+12.5%" 
          trend="up" 
          icon={DollarSign} 
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" 
        />
        <StatCard 
          title="Total Devotees" 
          value="1,284" 
          change="+4.2%" 
          trend="up" 
          icon={Users} 
          color="bg-blue-50 text-blue-600 dark:bg-blue-950/30" 
        />
        <StatCard 
          title="Today's Sevas" 
          value="24" 
          change="-2.1%" 
          trend="down" 
          icon={Calendar} 
          color="bg-purple-50 text-purple-600 dark:bg-purple-950/30" 
        />
        <StatCard 
          title="POS Sessions" 
          value="03" 
          change="+1 Active" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-orange-50 text-orange-600 dark:bg-orange-950/30" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Transactions</h3>
              <Link href="/temple-admin/finance/transactions" className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
           </div>
           <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                       <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Devotee</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Purpose</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Time</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {[
                      { name: "Rahul Sharma", purpose: "Abhishekam", amount: "₹501", time: "10:24 AM" },
                      { name: "Priya Patel", purpose: "General Donation", amount: "₹1,000", time: "09:45 AM" },
                      { name: "Suresh Kumar", purpose: "Prasad Box", amount: "₹150", time: "09:12 AM" },
                      { name: "Meena Iyer", purpose: "Archana", amount: "₹251", time: "08:30 AM" },
                    ].map((tx, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                         <td className="px-6 py-4">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{tx.name}</span>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">{tx.purpose}</span>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-sm font-black text-emerald-600">{tx.amount}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className="text-xs font-bold text-zinc-400">{tx.time}</span>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-4">
           <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Quick Shortcuts</h3>
           <div className="grid grid-cols-1 gap-3">
              <ShortcutButton icon={Users} label="Add New Devotee" href="/temple-admin/peoples/devotees" color="text-blue-500 bg-blue-50" />
              <ShortcutButton icon={Calendar} label="Book a Seva" href="/temple-admin/bookings/new" color="text-purple-500 bg-purple-50" />
              <ShortcutButton icon={DollarSign} label="Generate Receipt" href="/temple-admin/finance/receipts/generate" color="text-emerald-500 bg-emerald-50" />
              <ShortcutButton icon={LayoutDashboard} label="Inventory Check" href="/temple-admin/inventory/low-stock" color="text-orange-500 bg-orange-50" />
           </div>
        </div>

      </div>

    </div>
  );
}

function ShortcutButton({ icon: Icon, label, href, color }: any) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[var(--brand-primary)] hover:shadow-md transition-all group">
       <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
             <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-zinc-900 dark:text-white">{label}</span>
       </div>
       <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[var(--brand-primary)] transition-colors" />
    </Link>
  );
}
