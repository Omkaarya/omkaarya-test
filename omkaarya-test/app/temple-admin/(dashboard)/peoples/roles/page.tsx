"use client";

import Link from "next/link";
import { Plus, Search, ShieldAlert, Check, X } from "lucide-react";
import { useState } from "react";

const MODULES = [
  "Dashboard Analytics",
  "Devotee CRM",
  "Pooja Bookings",
  "Donations & Receipts",
  "Inventory & Products",
  "Purchase Orders",
  "Finance Transactions",
  "Reports & Exports",
  "Master Data",
  "Settings Configuration"
];

export default function RolesPermissionsPage() {
  const [activeRole, setActiveRole] = useState("manager");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Roles & Permissions
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Define access constraints and module visibility for your temple staff.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 items-start">
         
         {/* Sidebar: Role Selector */}
         <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] p-2 shadow-sm space-y-1">
            <div className="px-3 pt-3 pb-2">
               <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Standard Roles</h4>
            </div>
            
            <button onClick={() => setActiveRole('admin')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-colors ${activeRole === 'admin' ? "bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
               Temple Admin
            </button>
            <button onClick={() => setActiveRole('manager')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-colors ${activeRole === 'manager' ? "bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
               Operations Manager
            </button>
            <button onClick={() => setActiveRole('accountant')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-colors ${activeRole === 'accountant' ? "bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
               Accountant
            </button>
            <button onClick={() => setActiveRole('priest')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-colors ${activeRole === 'priest' ? "bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
               Head Priest
            </button>
            <button onClick={() => setActiveRole('counter')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-colors ${activeRole === 'counter' ? "bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
               Counter Staff / POS
            </button>

            <div className="px-3 pt-4 pb-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
               <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Custom Roles</h4>
            </div>
            <div className="px-3 py-4 text-center">
               <p className="text-xs text-zinc-400 italic font-medium">No custom roles created. Available on Aaradhana Plan.</p>
            </div>
         </div>

         {/* Matrix Data */}
         <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
               <div>
                 <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Permissions Matrix</h2>
                 <p className="text-xs font-semibold text-zinc-500 mt-1">
                   Viewing access rights for: <span className="text-[var(--brand-primary)]">Operations Manager</span>
                 </p>
               </div>
               
               {/* Display lock for standard roles */}
               <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-900/50">
                 <ShieldAlert className="w-3.5 h-3.5" /> Standard roles cannot be modified.
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white dark:bg-zinc-950 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 border-r border-zinc-100 dark:border-zinc-800">Module / Feature</th>
                      <th className="px-4 py-4 text-center w-24">Create</th>
                      <th className="px-4 py-4 text-center w-24">Read</th>
                      <th className="px-4 py-4 text-center w-24">Update</th>
                      <th className="px-4 py-4 text-center w-24">Delete</th>
                      <th className="px-4 py-4 text-center w-24">Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                    {MODULES.map((mod, i) => (
                      <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-zinc-700 dark:text-zinc-300 border-r border-zinc-100 dark:border-zinc-800">
                           {mod}
                        </td>
                        
                        {/* Simulation Logic for Manager Role View */}
                        {[0,1,2,3,4].map((colIndex) => {
                           let permission = true;
                           
                           // Simulate manager lacking delete/export on Finance & Settings
                           if (mod.includes("Settings") || mod.includes("Finance")) {
                              if (colIndex === 3 || colIndex === 4 || colIndex === 0) permission = false; 
                           }
                           
                           // Everyone reads
                           if (colIndex === 1) permission = true;

                           return (
                             <td key={colIndex} className="px-4 py-3.5 text-center">
                               {permission ? (
                                  <div className="flex justify-center"><Check className="w-4 h-4 text-emerald-500" strokeWidth={3} /></div>
                               ) : (
                                  <div className="flex justify-center"><X className="w-4 h-4 text-zinc-300 dark:text-zinc-700" strokeWidth={3} /></div>
                               )}
                             </td>
                           )
                        })}
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>

         </div>
      </div>
    </div>
  );
}
