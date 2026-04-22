"use client";

import { Save, Receipt, Hash } from "lucide-react";

export default function InvoiceSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">Invoice & Receipts</h2>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Configure automated numbering and compliance details for receipts.</p>
      </div>

      <div className="space-y-6">
        {/* Numbering Formatting */}
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><Hash className="w-4 h-4 text-zinc-400" /> Auto-Numbering Prefixes</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Pooja Booking Prefix</label>
              <input type="text" defaultValue="BK-" className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-bold font-mono outline-none focus:border-[var(--brand-primary)]" />
              <p className="text-[10px] text-zinc-400 mt-2 font-mono">Output: BK-00010</p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Donation Receipt Prefix</label>
              <input type="text" defaultValue="DON-" className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-bold font-mono outline-none focus:border-[var(--brand-primary)]" />
              <p className="text-[10px] text-zinc-400 mt-2 font-mono">Output: DON-00045</p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">POS Sales Prefix</label>
              <input type="text" defaultValue="POS-" className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-bold font-mono outline-none focus:border-[var(--brand-primary)]" />
              <p className="text-[10px] text-zinc-400 mt-2 font-mono">Output: POS-00891</p>
            </div>
          </div>
        </div>

        <hr className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* Templates */}
        <div>
           <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><Receipt className="w-4 h-4 text-zinc-400" /> Receipt Content</h4>
           <div className="space-y-4">
             <div>
               <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Footer Text (Printed Receipts)</label>
               <textarea rows={2} defaultValue="Thank you for your generous contribution. May the blessings of the Lord be with you." className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] resize-none" />
             </div>
             <div>
               <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Terms & Conditions (Invoices)</label>
               <textarea rows={3} defaultValue="1. All donations are strictly non-refundable. 2. Please present this receipt for any pooja claims." className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] resize-none" />
             </div>
           </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
           <div>
             <h4 className="text-sm font-bold text-[var(--text-primary)]">Auto-Email Receipts</h4>
             <p className="text-xs text-[var(--text-muted)] mt-0.5">Automatically send a digital PDF receipt if a devotee's email is present.</p>
           </div>
           <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-emerald-500 appearance-none cursor-pointer translate-x-5" style={{right: 0}} />
              <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-emerald-500 cursor-pointer"></label>
            </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
          <Save className="w-4 h-4" /> Save Invoice Details
        </button>
      </div>
    </div>
  );
}
