"use client";

import React, { useState } from "react";
import { 
  Monitor, 
  Smartphone, 
  Settings, 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Power, 
  Printer,
  RefreshCcw,
  ExternalLink
} from "lucide-react";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { Badge } from "@/app/components/ds/atoms/Badge";
import Link from "next/link";

// ─── Mock Live Data ────────────────────────────────────────────────

const LIVE_TRANSACTIONS = [
  { id: "TX-9021", time: "2 mins ago", devotee: "Anand Sharma", item: "Normal Archchanai", amount: "LKR 10.00", status: "Printed" },
  { id: "TX-9020", time: "15 mins ago", devotee: "Saraswathi", item: "Ghee Lamp x2", amount: "LKR 30.00", status: "Printed" },
  { id: "TX-9019", time: "22 mins ago", devotee: "Rahul G.", item: "Kunguma Archchanai", amount: "LKR 25.00", status: "Printed" },
  { id: "TX-9018", time: "1 hour ago", devotee: "M. Kumar", item: "Special Seva", amount: "LKR 100.00", status: "Printed" },
];

export default function TempleAdminKioskDashboard() {
  const [terminalStatus, setTerminalStatus] = useState<"online" | "maintenance" | "offline">("online");

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* ─── Header: Terminal Status ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-brand/5 text-brand flex items-center justify-center">
                 <Monitor className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">Kiosk Control Center</h1>
           </div>
           <p className="text-sm text-text-tertiary font-medium">Manage and monitor your self-service terminals from here.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-border shadow-sm">
           <div className="flex items-center gap-2 px-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${terminalStatus === "online" ? "bg-success" : "bg-error"}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Terminal #01</span>
           </div>
           <div className="h-6 w-[1px] bg-border" />
           <Badge variant={terminalStatus === "online" ? "success" : "error"} size="sm">
              {terminalStatus.toUpperCase()}
           </Badge>
           <Link href="/kiosk" target="_blank">
             <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 active:scale-95 transition-all">
                <ExternalLink className="w-3.5 h-3.5" /> View Live
             </button>
           </Link>
        </div>
      </div>

      {/* ─── Metrics ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard 
           title="Today's Collection" 
           value="LKR 4,920" 
           trendPercentage={12}
         />
         <MetricCard 
           title="Devotee Footfall" 
           value="184" 
           trendPercentage={5}
         />
         <MetricCard 
           title="Tickets Printed" 
           value="92" 
         />
         <MetricCard 
           title="Uptime (24h)" 
           value="99.8%" 
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* ─── Live Transaction Feed ─────────────────────────────── */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em]">Live Transaction Feed</h3>
               <button className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2">
                  <RefreshCcw className="w-3 h-3" /> Refresh
               </button>
            </div>
            
            <div className="bg-white rounded-[32px] border border-border overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-subtle/30 border-b border-border">
                     <tr>
                        <th className="px-6 py-4 text-[9px] font-black text-text-tertiary uppercase tracking-widest">Time</th>
                        <th className="px-6 py-4 text-[9px] font-black text-text-tertiary uppercase tracking-widest">Devotee</th>
                        <th className="px-6 py-4 text-[9px] font-black text-text-tertiary uppercase tracking-widest">Ritual / Product</th>
                        <th className="px-6 py-4 text-[9px] font-black text-text-tertiary uppercase tracking-widest text-right">Amount</th>
                        <th className="px-6 py-4 text-[9px] font-black text-text-tertiary uppercase tracking-widest text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {LIVE_TRANSACTIONS.map((tx) => (
                       <tr key={tx.id} className="hover:bg-subtle/10 transition-colors group">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-text-disabled" />
                                <span className="text-[10px] font-bold text-text-tertiary uppercase">{tx.time}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-xs font-black text-text-primary uppercase tracking-tight">{tx.devotee}</td>
                          <td className="px-6 py-5 text-xs font-bold text-text-tertiary uppercase tracking-widest">{tx.item}</td>
                          <td className="px-6 py-5 text-xs font-black text-brand text-right">{tx.amount}</td>
                          <td className="px-6 py-5">
                             <div className="flex justify-center">
                                <Badge variant="success" size="sm" dot>{tx.status}</Badge>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
               <div className="p-4 bg-subtle/20 text-center border-t border-border">
                  <button className="text-[9px] font-black text-brand uppercase tracking-widest">View All Kiosk History</button>
               </div>
            </div>
         </div>

         {/* ─── Device Health & Controls ──────────────────────────── */}
         <div className="space-y-6">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em]">Hardware Health</h3>
            
            <div className="space-y-4">
               {/* Health Cards */}
               <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center">
                           <Activity className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Processor Temp</span>
                     </div>
                     <span className="text-xs font-black text-text-primary">42°C</span>
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                           <Printer className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Thermal Paper</span>
                     </div>
                     <span className="text-xs font-black text-amber-600">12% Left</span>
                  </div>

                  <div className="pt-4 border-t border-border">
                     <h4 className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 text-center">Remote Actions</h4>
                     <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center gap-2 p-4 bg-subtle rounded-2xl hover:bg-brand/5 hover:text-brand transition-all active:scale-95 group">
                           <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                           <span className="text-[8px] font-black uppercase">Reboot</span>
                        </button>
                        <button 
                           onClick={() => setTerminalStatus(terminalStatus === "online" ? "maintenance" : "online")}
                           className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95 group ${terminalStatus === "maintenance" ? "bg-brand text-white" : "bg-subtle"}`}
                        >
                           <Power className="w-5 h-5" />
                           <span className="text-[8px] font-black uppercase">Lock Terminal</span>
                        </button>
                     </div>
                  </div>
               </div>

               {/* Inventory Warning */}
               <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                     <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-tight">Replenish Needed</h4>
                     <p className="text-[9px] font-medium text-amber-700 mt-1 uppercase tracking-widest leading-relaxed">
                        Ghee Lamps are below 20 units. Please restock the machine inventory.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
