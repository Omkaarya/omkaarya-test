"use client";

import { useState } from "react";
import { Save, Wallet, Percent, ChevronDown } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Switch } from "@/app/components/ds/atoms/Switch";
import { Badge } from "@/app/components/ds/atoms/Badge";

export default function FinanceSettingsPage() {
  const [taxEnabled, setTaxEnabled] = useState(true);

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Finance & Taxes</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure global currency metrics, tax rates, and fiscal year settings.</p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
          Save Finance Settings
        </Button>
      </div>

      <div className="space-y-12">
        {/* Currency & Base Metrics */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <Wallet className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Currency Metrics</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Base Currency</label>
                 <div className="relative">
                   <select className="w-full h-11 pl-4 pr-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand appearance-none cursor-pointer">
                      <option>LKR - Sri Lankan Rupee</option>
                      <option>INR - Indian Rupee</option>
                      <option>USD - US Dollar</option>
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Fiscal Year Start</label>
                 <div className="relative">
                   <select className="w-full h-11 pl-4 pr-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand appearance-none cursor-pointer">
                      <option>January 1st</option>
                      <option>April 1st</option>
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                 </div>
              </div>
           </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Tax Rates */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-brand">
                 <Percent className="w-5 h-5" />
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Taxation & Compliance</h3>
              </div>
              <Switch checked={taxEnabled} onChange={setTaxEnabled} />
           </div>
           
           {taxEnabled && (
             <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">VAT Percentage</label>
                    <Input defaultValue="18.00" suffixText="%" className="font-mono" />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">SSCL Percentage</label>
                    <Input defaultValue="2.50" suffixText="%" className="font-mono" />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Service Charge</label>
                    <Input defaultValue="0.00" suffixText="%" className="font-mono" />
                 </div>
               </div>

               <div className="p-6 rounded-[24px] bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30">
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 shrink-0">
                      <Percent className="w-4 h-4" />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Cumulative Taxation</h4>
                      <p className="text-[11px] font-medium text-amber-700/70 dark:text-amber-400/70 mt-1 leading-relaxed">
                        Taxes will be calculated cumulatively on the subtotal. Ensure your legal entity status in Sri Lanka matches these rates for compliance audit.
                      </p>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
         <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
           Save Fiscal Settings
         </Button>
      </div>
    </div>
  );
}
