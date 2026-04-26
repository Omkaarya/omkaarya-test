"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  MoreHorizontal, 
  ChevronRight,
  LayoutGrid,
  LayoutList,
  Mail,
  Phone,
  ArrowUpRight,
  ChevronLeft,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import StatusBadge from "@/app/components/admin/StatusBadge";

const BOOKINGS = [
  { id: "BK-001", service: "Rudrabhishekam", devotee: "Lakshmi Devi", phone: "+91 98765 43210", priest: "Kamal Sharma", date: "12 Dec 2024", time: "06:00 AM", amount: "₹7,500", status: "Confirmed", source: "Walk-in" },
  { id: "BK-002", service: "Sathyanarayana Pooja", devotee: "Anjali Sharma", phone: "+91 98076 54321", priest: "Ramesh Kumar", date: "15 Dec 2024", time: "07:30 AM", amount: "₹1,200", status: "Pending", source: "Online" },
  { id: "BK-003", service: "Navagraha Homam", devotee: "Ravi Prakash", phone: "+91 81234 55769", priest: "Vijay Singh", date: "18 Dec 2024", time: "09:00 AM", amount: "₹15,000", status: "Confirmed", source: "Walk-in" },
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

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      
      {/* Block 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="TOTAL SEVAS" value="124" sub="all time" />
        <MetricCard title="TODAY" value="08" sub="scheduled" />
        <MetricCard title="PENDING" value="05" sub="requests" />
      </div>

      {/* Block 2: Unified Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-50 dark:border-zinc-800">
           <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Bookings & Schedules</h2>
              <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-[10px] font-bold text-orange-600 border border-orange-100 dark:border-orange-800">124 Bookings</span>
           </div>
           <Button leadingIcon={<Plus className="w-4 h-4" />}>
             New Booking
           </Button>
        </div>

        {/* Integrated Filter Bar */}
        <div className="px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-4 bg-white dark:bg-zinc-900">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10"
                placeholder="Search by Booking ID, Devotee Name, or Seva..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
              {["All Bookings", "Confirmed", "Pending", "Cancelled"].map(tab => (
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
                 <option>All Services</option>
              </select>
           </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950 border-y border-zinc-50 dark:border-zinc-800">
                 <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tenant ID</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Service / Seva</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Devotee Details</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Schedule</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                 {BOOKINGS.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-colors group">
                       <td className="px-8 py-5 text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-tighter">
                          {b.id}
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Calendar className="w-4 h-4" />
                             </div>
                             <div>
                                <div className="text-xs font-black text-zinc-900 dark:text-white leading-tight">{b.service}</div>
                                <div className="text-[10px] font-medium text-zinc-400 mt-0.5">{b.source}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-zinc-900 dark:text-white">{b.devotee}</span>
                             <span className="text-[10px] font-medium text-zinc-400 mt-0.5">{b.phone}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{b.date}</span>
                             <span className="text-[10px] font-medium text-zinc-400 mt-0.5">{b.time}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-sm font-black text-emerald-600">
                             {b.amount}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <StatusBadge status={b.status} />
                       </td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"><Eye className="w-4 h-4" /></button>
                             <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"><Pencil className="w-4 h-4" /></button>
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
