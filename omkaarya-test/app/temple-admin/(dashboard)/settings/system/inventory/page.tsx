"use client";

import { Save, PackageSearch, BellRing } from "lucide-react";

export default function InventorySettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">Inventory Alerts</h2>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Configure global low-stock thresholds and alert routing for physical assets.</p>
      </div>

      <div className="space-y-6">
        
        {/* Global Thresholds */}
        <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1.5"><PackageSearch className="w-4 h-4 text-zinc-400" /> Stock Baselines</h4>
          <p className="text-xs font-medium text-[var(--text-muted)] mb-5">Set minimum stock levels before items are flagged as 'Low Stock'. Note: Individual item settings will override these global defaults.</p>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Consumables (Prashadham / Oils)</label>
               <input type="number" defaultValue="50" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold font-mono text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
             </div>
             <div>
               <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">POS Retail Items (Books / Souvenirs)</label>
               <input type="number" defaultValue="20" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold font-mono text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
             </div>
             <div>
               <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Raw Materials (Pooja BOM)</label>
               <input type="number" defaultValue="15" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold font-mono text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
             </div>
             <div>
               <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Fixed Assets</label>
               <input type="number" defaultValue="1" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold font-mono text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
             </div>
          </div>
        </div>

        <hr className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* Alerts */}
        <div>
           <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><BellRing className="w-4 h-4 text-[var(--brand-primary)]" /> Alert Routing</h4>
           <div className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--brand-primary)] bg-[var(--brand-primary)]/5">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">In-App Dashboard Alerts</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Show critical badges in the Temple Admin dashboard.</div>
                </div>
                <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" defaultChecked name="toggle_i1" id="toggle_i1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-emerald-500 appearance-none cursor-pointer translate-x-5" style={{right:0}} />
                  <label htmlFor="toggle_i1" className="toggle-label block overflow-hidden h-5 rounded-full bg-emerald-500 cursor-pointer"></label>
                </div>
             </div>
             <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="flex-1">
                  <div className="text-sm font-bold text-[var(--text-primary)]">Daily Digest Email</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Send a 9:00 AM summary of all low-stock items.</div>
                  <input type="email" placeholder="inventory-manager@omkaaryatemple.lk" className="mt-2 w-full max-w-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-semibold outline-none focus:border-[var(--brand-primary)]" />
                </div>
                <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" defaultChecked name="toggle_i2" id="toggle_i2" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-emerald-500 appearance-none cursor-pointer translate-x-5" style={{right:0}} />
                  <label htmlFor="toggle_i2" className="toggle-label block overflow-hidden h-5 rounded-full bg-emerald-500 cursor-pointer"></label>
                </div>
             </div>
           </div>
        </div>

      </div>

      <div className="pt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
          <Save className="w-4 h-4" /> Save Inventory Alerts
        </button>
      </div>
    </div>
  );
}
