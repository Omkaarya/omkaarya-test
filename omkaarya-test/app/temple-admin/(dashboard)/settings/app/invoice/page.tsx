"use client";

import { useState } from "react";
import { Save, Receipt, Hash, FileText } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Switch } from "@/app/components/ds/atoms/Switch";

export default function InvoiceSettingsPage() {
  const [autoEmail, setAutoEmail] = useState(true);

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Invoice & Receipts</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure automated billing, receipt numbering, and custom branding.</p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
          Save Settings
        </Button>
      </div>

      <div className="space-y-12">
        {/* Numbering Rules */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <Hash className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Transaction Numbering</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Booking Prefix</label>
                 <Input defaultValue="BK-" className="font-mono" />
              </div>
              <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Donation Prefix</label>
                 <Input defaultValue="DON-" className="font-mono" />
              </div>
              <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">POS Prefix</label>
                 <Input defaultValue="POS-" className="font-mono" />
              </div>
           </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Content Templates */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <FileText className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Receipt Templates</h3>
           </div>
           
           <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Header Legal Text</label>
                <textarea 
                  rows={3} 
                  defaultValue="Sri Siva Temple of Colombo. Registered Charity #123456. All donations are tax-exempt under Section 80G."
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all placeholder:text-zinc-400 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Footer / Terms</label>
                <textarea 
                  rows={3} 
                  defaultValue="Thank you for your contribution. Please keep this receipt for your records. No refunds on Pooja bookings."
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all placeholder:text-zinc-400 resize-none"
                />
              </div>
           </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Automation */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <Receipt className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Email Automation</h3>
           </div>
           
           <div className="flex items-center justify-between p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="max-w-md">
                 <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Auto-send Digital Receipts</h4>
                 <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                   When a transaction is completed, automatically send a PDF receipt to the devotee's registered email address.
                 </p>
              </div>
              <Switch checked={autoEmail} onChange={setAutoEmail} />
           </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
         <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
           Save All Changes
         </Button>
      </div>
    </div>
  );
}
