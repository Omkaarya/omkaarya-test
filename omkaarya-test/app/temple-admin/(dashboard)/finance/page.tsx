"use client";

import Link from "next/link";
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  BarChart3,
  Search,
  ChevronRight,
  MoreVertical,
  Eye,
  FileText
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { Badge } from "@/app/components/ds/atoms/Badge";

// ── Stat Bar Component ───────────────────────────────────────────

function StatBar({ label, value, percentage, colorClass }: { label: string, value: string, percentage: number, colorClass: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="text-[11px] font-bold text-text-secondary w-28 text-right shrink-0">{label}</div>
      <div className="flex-1 h-[22px] bg-gray-100 rounded-lg overflow-hidden border border-border/50 relative">
        <div 
          className={`h-full rounded-lg flex items-center px-2 transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        >
           <span className="text-[10px] font-black text-white">{value}</span>
        </div>
      </div>
    </div>
  );
}

export default function FinanceDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-[11px] font-bold text-text-tertiary mb-1">
              <span>Finance</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand">Dashboard</span>
           </div>
           <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Finance Dashboard</h1>
           <p className="text-[12px] text-text-tertiary mt-1">Financial overview for Shiva Temple — London · April 2026</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" leadingIcon={<BarChart3 className="w-4 h-4" />}>View Reports</Button>
           <Link href="/temple-admin/finance/transactions?action=add">
             <Button size="sm" leadingIcon={<Plus className="w-4 h-4" />}>Add Transaction</Button>
           </Link>
        </div>
      </div>

      {/* ── Metrics Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard 
            title="Total income (this month)" 
            value="£4,820" 
            trendPercentage={12}
            trendLabel="vs last month"
            chartColor="success"
         />
         <MetricCard 
            title="Total expenses (this month)" 
            value="£2,140" 
            trendPercentage={8}
            trendLabel="vs last month"
            chartColor="warning"
         />
         <MetricCard 
            title="Net surplus (this month)" 
            value="£2,680" 
            trendPercentage={4}
            trendLabel="Healthy surplus"
            chartColor="brand"
         />
         <MetricCard 
            title="Total donations (this month)" 
            value="£2,340" 
            trendPercentage={15}
            trendLabel="34 donors"
            chartColor="brand"
         />
      </div>

      {/* ── Breakdown Charts ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
            <div className="text-[12px] font-bold text-text-primary mb-4">Income breakdown — April 2026</div>
            <div className="space-y-1">
               <StatBar label="Donations" value="£2,340" percentage={48} colorClass="bg-blue-500" />
               <StatBar label="Pooja bookings" value="£1,560" percentage={32} colorClass="bg-brand" />
               <StatBar label="Counter sales" value="£920" percentage={19} colorClass="bg-status-success-text" />
            </div>
         </div>
         <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
            <div className="text-[12px] font-bold text-text-primary mb-4">Expense breakdown — April 2026</div>
            <div className="space-y-1">
               <StatBar label="Inventory purchases" value="£1,120" percentage={52} colorClass="bg-amber-500" />
               <StatBar label="Staff / priest" value="£750" percentage={35} colorClass="bg-purple-500" />
               <StatBar label="Maintenance" value="£270" percentage={13} colorClass="bg-brand" />
            </div>
         </div>
      </div>

      {/* ── Recent Transactions ────────────────────────────────────── */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-text-primary">Recent transactions</h2>
            <Link href="/temple-admin/finance/transactions">
               <Button variant="outline" size="sm" trailingIcon={<ChevronRight className="w-4 h-4" />}>View All</Button>
            </Link>
         </div>

         <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-border">
                     <tr>
                        <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Date</th>
                        <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Description</th>
                        <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Type</th>
                        <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Category</th>
                        <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Amount</th>
                        <th className="px-5 py-3"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border-secondary">
                     {[
                        { date: "Today 09:14", desc: "Rudrabhishekam — Rajan Kumar", type: "Pooja", cat: "Pooja income", amt: "+£75.00", pos: true, color: "brand" },
                        { date: "Today 08:30", desc: "Cash donation — Priya Sharma", type: "Donation", cat: "Cash donation", amt: "+£120.00", pos: true, color: "info" },
                        { date: "Yesterday", desc: "Rose garland × 12 — supplier", type: "Expense", cat: "Inventory purchase", amt: "-£36.00", pos: false, color: "danger" },
                        { date: "Yesterday", desc: "Prasad packet × 5 — counter sale", type: "Sale", cat: "POS sales", amt: "+£7.50", pos: true, color: "ok" },
                     ].map((txn, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="px-5 py-4 text-[11px] text-text-tertiary font-medium">{txn.date}</td>
                           <td className="px-5 py-4">
                              <div className="text-[12px] font-bold text-text-primary">{txn.desc}</div>
                           </td>
                           <td className="px-5 py-4">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold
                                 ${txn.color === 'brand' ? 'bg-brand-muted text-brand' : 
                                   txn.color === 'info' ? 'bg-blue-50 text-blue-600' : 
                                   txn.color === 'danger' ? 'bg-status-danger-bg text-status-danger-text' : 
                                   'bg-status-success-bg text-status-success-text'}
                              `}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${
                                    txn.color === 'brand' ? 'bg-brand' : 
                                    txn.color === 'info' ? 'bg-blue-600' : 
                                    txn.color === 'danger' ? 'bg-status-danger-text' : 
                                    'bg-status-success-text'
                                 }`} />
                                 {txn.type}
                              </div>
                           </td>
                           <td className="px-5 py-4 text-[11px] text-text-secondary font-medium">{txn.cat}</td>
                           <td className={`px-5 py-4 text-right text-[13px] font-black tracking-tight ${txn.pos ? 'text-status-success-text' : 'text-status-danger-text'}`}>
                              {txn.amt}
                           </td>
                           <td className="px-5 py-4 text-right">
                              <Button variant="ghost" size="sm" iconOnly><Eye className="w-4 h-4" /></Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-gray-50/20">
               <span className="text-[11px] text-text-tertiary font-bold">Showing 4 of 248 transactions</span>
               <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0 justify-center">1</Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 justify-center">2</Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 justify-center">3</Button>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
