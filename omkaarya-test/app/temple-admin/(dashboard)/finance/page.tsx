"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  HeartHandshake,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  TrendingDown,
  PieChart,
  Calendar,
  ChevronLeft,
  Eye,
  Trash2,
  FileText
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import StatusBadge from "@/app/components/admin/StatusBadge";

// ── Mock Data ──────────────────────────────────────────────────────

const RECENT_TXNS = [
  { id: "TXN-142", desc: "Rudrabhishekam — Rajan Kumar", type: "Pooja Income", amt: "₹7,500.00", status: "Completed", date: "18 Apr 2026", method: "Cash" },
  { id: "TXN-143", desc: "Cash Donation — Anonymous", type: "Donation", amt: "₹2,000.00", status: "Completed", date: "16 Apr 2026", method: "Bank transfer" },
  { id: "TXN-144", desc: "Rose Garland × 12 — Supplier", type: "Expense", amt: "-₹3,600.00", status: "Completed", date: "14 Apr 2026", method: "Cash" },
  { id: "TXN-145", desc: "Prasad Packet × 5 — Counter Sale", type: "Counter Sale", amt: "₹750.00", status: "Completed", date: "12 Apr 2026", method: "Card" },
];

function MetricCard({ title, value, sub }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-1">
       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
       <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{value}</h3>
          <span className="text-[10px] font-bold text-zinc-400">{sub}</span>
       </div>
    </div>
  );
}

export default function FinanceDashboardPage() {
  const [activeTab, setActiveTab] = useState("All Transactions");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      
      {/* Block 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="TOTAL INCOME" value="₹482,000" sub="this month" />
        <MetricCard title="TOTAL EXPENSES" value="₹214,000" sub="this month" />
        <MetricCard title="NET SURPLUS" value="₹268,000" sub="available" />
      </div>

      {/* Block 2: Unified Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-50 dark:border-zinc-800">
           <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Financial Ledger</h2>
              <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-[10px] font-bold text-orange-600 border border-orange-100 dark:border-orange-800">145 Txns</span>
           </div>
           <Button leadingIcon={<Plus className="w-4 h-4" />}>
             Add Transaction
           </Button>
        </div>

        {/* Integrated Filter Bar */}
        <div className="px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-4 bg-white dark:bg-zinc-900">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10"
                placeholder="Search transactions, receipts, or devotees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
              {["All Transactions", "Income", "Expenses", "Donations"].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                 >
                    {tab}
                 </button>
              ))}
           </div>
           <div className="flex items-center gap-2">
              <select className="h-10 px-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-bold text-zinc-500 outline-none cursor-pointer">
                 <option>This Month</option>
                 <option>Last 3 Months</option>
              </select>
           </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950 border-y border-zinc-50 dark:border-zinc-800">
                 <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Txn ID</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Method</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                 {RECENT_TXNS.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-colors group">
                       <td className="px-8 py-5 text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-tighter">
                          {row.id}
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex flex-col">
                             <div className="text-xs font-black text-zinc-900 dark:text-white leading-tight">{row.desc}</div>
                             <div className="text-[10px] font-medium text-zinc-400 mt-1">{row.date}</div>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <span className="inline-flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                             🏦 {row.method}
                          </span>
                       </td>
                       <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${row.type === 'Expense' ? 'bg-red-500' : 'bg-purple-500'}`} />
                             {row.type}
                          </span>
                       </td>
                       <td className={`px-8 py-5 text-sm font-black ${row.amt.startsWith("-") ? 'text-red-500' : 'text-emerald-600'}`}>
                          {row.amt}
                       </td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"><FileText className="w-4 h-4" /></button>
                             <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"><Eye className="w-4 h-4" /></button>
                             <button className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Integrated Pagination */}
        <div className="px-8 py-5 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-950/30 border-t border-zinc-50 dark:border-zinc-800">
           <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              Showing Results: 
              <select className="h-8 px-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[10px] font-bold outline-none cursor-pointer">
                 <option>10 per page</option>
                 <option>20 per page</option>
              </select>
           </div>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
                 <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-orange-500/20">1</div>
              <button className="px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-600 flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
                 Next <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
