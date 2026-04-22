"use client";

import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, Store } from "lucide-react";
import { useState } from "react";

export default function NewSupplierPage() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
        <Link
          href="/temple-admin/inventory/suppliers"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Register Supplier
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
            Onboard a new vendor to supply inventory items or raw materials to the temple.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
         {/* Main Form */}
         <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm space-y-6">
            
            {/* Logo Upload Section */}
            <div>
               <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Company Logo</h4>
               <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center text-zinc-400">
                     <Store className="w-6 h-6 mb-1 opacity-50" />
                  </div>
                  <div className="flex-1">
                     <label className="flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed border-[var(--brand-primary)]/50 bg-[var(--brand-primary)]/5 hover:bg-[var(--brand-primary)]/10 cursor-pointer transition-colors">
                        <UploadCloud className="w-5 h-5 text-[var(--brand-primary)] mb-1" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--brand-primary)]">Click to Upload JPG/PNG</span>
                     </label>
                  </div>
               </div>
            </div>

            <hr className="border-t border-zinc-100 dark:border-zinc-800" />

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-5">
               <div className="col-span-2">
                 <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Supplier Name *</label>
                 <input type="text" placeholder="e.g. Omkara Pooja Samagiri" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
               </div>
               <div>
                 <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Email Address</label>
                 <input type="email" placeholder="contact@supplier.com" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
               </div>
               <div>
                 <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Whatsapp Number *</label>
                 <div className="flex">
                    <span className="flex items-center justify-center px-3 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-xl text-sm font-bold text-zinc-500">
                       +94
                    </span>
                    <input type="tel" placeholder="77 123 4567" className="w-full px-4 py-2.5 rounded-r-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
                 </div>
               </div>
               <div className="col-span-2">
                 <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Billing Address</label>
                 <textarea rows={2} placeholder="Full address" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] resize-none transition-colors" />
               </div>
            </div>

            <div className="pt-6 flex justify-end gap-3">
               <Link href="/temple-admin/inventory/suppliers" className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  Cancel
               </Link>
               <button className="flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all">
                  <Save className="w-4 h-4" /> Save Supplier
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
                 {isActive ? "Supplier is active and can be used in new Purchase Orders." : "Supplier is disabled and hidden from new PO creation."}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
