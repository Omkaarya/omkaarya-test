"use client";

import { useState } from "react";
import { Save, PackageSearch, BellRing, Package, Book, Layers, Box } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Switch } from "@/app/components/ds/atoms/Switch";

export default function InventorySettingsPage() {
  const [dashboardAlerts, setDashboardAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Inventory Alerts</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure global low-stock thresholds and alert routing for physical assets.</p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
          Save Settings
        </Button>
      </div>

      <div className="space-y-12">
        
        {/* Global Thresholds */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
             <PackageSearch className="w-5 h-5" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Stock Baselines</h3>
          </div>
          
          <div className="p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-8 max-w-2xl">
              Set minimum stock levels before items are flagged as 'Low Stock'. Individual item settings will override these global defaults.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 flex items-center gap-2">
                    <Package className="w-3 h-3" /> Consumables (Oil / Ghee)
                 </label>
                 <Input defaultValue="50" type="number" suffixText="Units" className="font-mono" />
               </div>
               <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 flex items-center gap-2">
                    <Book className="w-3 h-3" /> Retail Items (Books)
                 </label>
                 <Input defaultValue="20" type="number" suffixText="Units" className="font-mono" />
               </div>
               <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Raw Materials (BOM)
                 </label>
                 <Input defaultValue="15" type="number" suffixText="Units" className="font-mono" />
               </div>
               <div className="space-y-2">
                 <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 flex items-center gap-2">
                    <Box className="w-3 h-3" /> Fixed Assets
                 </label>
                 <Input defaultValue="1" type="number" suffixText="Units" className="font-mono" />
               </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Alerts */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <BellRing className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Alert Routing</h3>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">In-App Dashboard Alerts</h4>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Show critical low-stock badges in the main Temple Admin dashboard and sidebar.</p>
                </div>
                <Switch checked={dashboardAlerts} onChange={setDashboardAlerts} />
              </div>

              <div className="p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Daily Digest Email</h4>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Send a daily summary of all low-stock items at 9:00 AM.</p>
                  </div>
                  <Switch checked={emailDigest} onChange={setEmailDigest} />
                </div>
                {emailDigest && (
                  <div className="pt-4 border-t border-zinc-50 dark:border-zinc-900 animate-in fade-in duration-300">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 mb-2">Recipient Email</label>
                    <Input type="email" defaultValue="inventory@omkaaryatemple.lk" placeholder="manager@temple.com" />
                  </div>
                )}
              </div>
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
