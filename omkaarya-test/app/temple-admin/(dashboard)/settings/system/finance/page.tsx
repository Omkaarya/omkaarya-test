"use client";

import { Save, Wallet, Percent } from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";

export default function FinanceSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">Finance & Taxes</h2>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Manage global tax rates, currency parameters, and receipt compliance.</p>
      </div>

      <div className="space-y-6">
        
        {/* Currency & Base Metrics */}
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><Wallet className="w-4 h-4 text-zinc-400" /> Base Metrics</h4>
          <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Primary Currency</label>
              <SelectInput className="!rounded-xl !py-2.5 !pl-4 !text-sm !font-semibold !text-[var(--text-primary)]">
                <option value="LKR">LKR (Sri Lankan Rupee)</option>
                <option value="INR">INR (Indian Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
              </SelectInput>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Currency Separator</label>
              <SelectInput className="!rounded-xl !py-2.5 !pl-4 !text-sm !font-semibold !text-[var(--text-primary)]">
                <option value="comma">Comma (1,000,000)</option>
                <option value="dot">Dot (1.000.000)</option>
              </SelectInput>
            </div>
          </div>
        </div>

        <hr className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* Taxes */}
        <div>
           <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><Percent className="w-4 h-4 text-zinc-400" /> Tax Modules</h4>
           <div className="space-y-3">
             <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="flex-1">
                  <div className="text-sm font-bold text-[var(--text-primary)]">VAT (Value Added Tax)</div>
                  <div className="text-xs text-[var(--text-muted)]">Applied broadly to non-religious items (books, souvenirs, etc).</div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <input type="number" defaultValue={18} className="w-20 pl-3 pr-6 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-bold font-mono outline-none focus:border-[var(--brand-primary)] text-right" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">%</span>
                   </div>
                   <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" defaultChecked name="toggle_t1" id="toggle_t1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-emerald-500 appearance-none cursor-pointer translate-x-5" style={{right:0}} />
                    <label htmlFor="toggle_t1" className="toggle-label block overflow-hidden h-5 rounded-full bg-emerald-500 cursor-pointer"></label>
                  </div>
                </div>
             </div>

             <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="flex-1">
                  <div className="text-sm font-bold text-[var(--text-primary)]">SSCL (Social Security Contribution Levy)</div>
                  <div className="text-xs text-[var(--text-muted)]">Applied to organizational revenue streams.</div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <input type="number" defaultValue={2.5} step={0.1} className="w-20 pl-3 pr-6 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-bold font-mono outline-none focus:border-[var(--brand-primary)] text-right" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">%</span>
                   </div>
                   <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle_t2" id="toggle_t2" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-zinc-300 dark:border-zinc-600 appearance-none cursor-pointer" />
                    <label htmlFor="toggle_t2" className="toggle-label block overflow-hidden h-5 rounded-full bg-zinc-300 dark:bg-zinc-600 cursor-pointer"></label>
                  </div>
                </div>
             </div>
           </div>
        </div>

      </div>

      <div className="pt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
          <Save className="w-4 h-4" /> Save Tax Configurations
        </button>
      </div>
    </div>
  );
}
