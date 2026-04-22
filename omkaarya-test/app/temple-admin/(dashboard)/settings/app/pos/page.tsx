"use client";

import { Save, Monitor, CreditCard } from "lucide-react";

export default function POSSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">POS & Registers</h2>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Configure cash drawer behavior and POS terminal defaults.</p>
      </div>

      <div className="space-y-6">
        {/* Terminals */}
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><Monitor className="w-4 h-4 text-zinc-400" /> Active Registers</h4>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--brand-primary)] bg-[var(--brand-primary)]/5">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">Counter 1 (Main Office)</div>
                  <div className="text-xs text-[var(--text-muted)]">Assigned to: Default Printer A</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--brand-primary)] text-white uppercase tracking-wider">Default</span>
             </div>
             <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">Counter 2 (Prashadham Stall)</div>
                  <div className="text-xs text-[var(--text-muted)]">Assigned to: Kitchen Printer B</div>
                </div>
                <button className="text-xs font-bold text-zinc-400 hover:text-[var(--brand-primary)] transition-colors">Set Default</button>
             </div>
             <button className="w-full py-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors">
               + Add New Register
             </button>
          </div>
        </div>

        <hr className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* Payments */}
        <div>
           <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-zinc-400" /> Checkout Rules</h4>
           <div className="space-y-4 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
             
             <div className="flex items-center justify-between">
               <div>
                 <div className="text-sm font-bold text-[var(--text-primary)]">Require Cash Drawer Open</div>
                 <div className="text-xs text-[var(--text-muted)] mt-0.5">Fire drawer kick command on cash completion.</div>
               </div>
               <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle2" id="toggle2" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-emerald-500 appearance-none cursor-pointer translate-x-5" style={{right: 0}} />
                  <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-emerald-500 cursor-pointer"></label>
                </div>
             </div>

             <hr className="border-t border-zinc-200 dark:border-zinc-700" />

             <div className="flex items-center justify-between">
               <div>
                 <div className="text-sm font-bold text-[var(--text-primary)]">Auto-Print POS Receipts</div>
                 <div className="text-xs text-[var(--text-muted)] mt-0.5">Don't ask to print, just print immediately on success.</div>
               </div>
               <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle3" id="toggle3" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-zinc-300 dark:border-zinc-600 appearance-none cursor-pointer" />
                  <label htmlFor="toggle3" className="toggle-label block overflow-hidden h-5 rounded-full bg-zinc-300 dark:bg-zinc-600 cursor-pointer"></label>
                </div>
             </div>

           </div>
        </div>

      </div>

      <div className="pt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
          <Save className="w-4 h-4" /> Save POS Settings
        </button>
      </div>
    </div>
  );
}
