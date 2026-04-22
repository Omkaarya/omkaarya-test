"use client";

import Link from "next/link";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import { useState } from "react";

export default function NewStorePage() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
        <Link
          href="/temple-admin/inventory/stores"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Create Store Location
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
            Set up a new physical location or point-of-sale register for tracking inventory splits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
         {/* Main Form */}
         <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm space-y-6">
            
            <div className="flex items-center gap-3 pb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Location Details</h4>
            </div>

            <div className="grid grid-cols-2 gap-5">
               <div className="col-span-2">
                 <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Store / Counter Name *</label>
                 <input type="text" placeholder="e.g. Front Desk Counter 1" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
               </div>
               
               <div className="col-span-2">
                 <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Description</label>
                 <textarea rows={3} placeholder="What is this associated with? (e.g. Dedicated counter for archana tickets)" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] resize-none transition-colors" />
               </div>

               <div className="col-span-2">
                 <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Associated Manager *</label>
                 <select className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                    <option value="" disabled selected>Search from staff...</option>
                    <option value="siva">Siva Thirumaran (Super Admin)</option>
                    <option value="arun">Arun Prasad (Manager)</option>
                    <option value="meena">Meena Lakshmi (Manager)</option>
                 </select>
               </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-5">
               <Link href="/temple-admin/inventory/stores" className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  Cancel
               </Link>
               <button className="flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all">
                  <Save className="w-4 h-4" /> Save Store
               </button>
            </div>
         </div>

         {/* Sidebar Controls */}
         <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="text-sm font-bold text-[var(--text-primary)]">Status</h4>
                 <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} name="toggle" id="toggle1" className={`toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer ${isActive ? "border-emerald-500 translate-x-5" : "border-zinc-300 dark:border-zinc-600"}`} style={isActive ? {right: 0} : {}} />
                    <label htmlFor="toggle1" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${isActive ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}></label>
                  </div>
               </div>
               <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                 {isActive ? "Store is active and staff can process POS transactions through it." : "Store is suspended. POS endpoints associated with it will be blocked."}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
