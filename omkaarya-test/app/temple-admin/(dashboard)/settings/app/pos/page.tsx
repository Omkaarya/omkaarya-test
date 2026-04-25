"use client";

import { useState } from "react";
import { Save, Monitor, CreditCard, Plus, Check } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Switch } from "@/app/components/ds/atoms/Switch";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Input } from "@/app/components/ds/atoms/Input";

export default function POSSettingsPage() {
  const [cashDrawer, setCashDrawer] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">POS & Registers</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage physical checkout points, cash drawers, and terminal rules.</p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={<Plus className="w-4 h-4" />}>
          Add Register
        </Button>
      </div>

      <div className="space-y-12">
        {/* Active Registers */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <Monitor className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Active Registers</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {[
                { name: "Main Entrance POS", location: "Entrance Gate", status: "online" },
                { name: "Donation Desk 01", location: "Office Hall", status: "online" },
                { name: "Bookstore Terminal", location: "Retail Store", status: "offline" },
              ].map((reg, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm group hover:border-brand/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{reg.name}</h4>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{reg.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge color={reg.status === "online" ? "success" : "gray"} size="sm" variant="subtle">
                      {reg.status.toUpperCase()}
                    </Badge>
                    <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 h-8 rounded-lg">Edit</Button>
                  </div>
                </div>
              ))}
           </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Checkout Rules */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <CreditCard className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Checkout Rules</h3>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div>
                   <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Require Cash Drawer Open</h4>
                   <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Transaction cannot complete until cash drawer sensor confirms open state.</p>
                </div>
                <Switch checked={cashDrawer} onChange={setCashDrawer} />
              </div>

              <div className="flex items-center justify-between p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div>
                   <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Auto-Print Thermal Receipt</h4>
                   <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Immediately trigger thermal printer after every successful payment.</p>
                </div>
                <Switch checked={autoPrint} onChange={setAutoPrint} />
              </div>
           </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
         <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
           Save POS Configuration
         </Button>
      </div>
    </div>
  );
}
