"use client";

import { Save, Printer, Network, Plus, Play, ChevronDown } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Badge } from "@/app/components/ds/atoms/Badge";

export default function PrintersSettingsPage() {
  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Printers & Hardware</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage thermal printers for automated booking tickets and receipts.</p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
          Save Settings
        </Button>
      </div>

      <div className="space-y-12">
        {/* Network Setup */}
        <section className="p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-8">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3 text-brand">
                <Network className="w-5 h-5" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Local Print Node</h3>
             </div>
             <Badge color="success" size="sm" dot>Connected</Badge>
          </div>
          
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Omkaarya communicates with your local thermal printers via a background agent. Ensure your Print Node machine is online and reachable.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="md:col-span-3 space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Node IP Address</label>
                <Input defaultValue="192.168.1.100" placeholder="0.0.0.0" />
             </div>
             <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Port</label>
                <Input defaultValue="8080" placeholder="8080" />
             </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Mapped Printers */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <Printer className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Saved Hardware</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Printer 1 */}
              <div className="p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:border-brand transition-all shadow-sm group">
                 <div>
                    <div className="flex items-start justify-between">
                       <h5 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Front Desk Epson (80mm)</h5>
                       <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors">
                          <Printer className="w-4 h-4" />
                       </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1 mb-6">Device ID: EPSON_TM_T20II</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                       <select className="w-full h-9 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 outline-none text-[11px] font-bold text-zinc-600 dark:text-zinc-300 appearance-none cursor-pointer hover:bg-zinc-100 transition-colors">
                          <option>Role: Archana Tickets</option>
                          <option>Role: Kitchen KOT</option>
                          <option>Role: Office Copy</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-zinc-100" leadingIcon={<Play className="w-3 h-3" />}>
                       Test
                    </Button>
                 </div>
              </div>

              {/* Printer 2 */}
               <div className="p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:border-brand transition-all shadow-sm group">
                 <div>
                    <div className="flex items-start justify-between">
                       <h5 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Kitchen Star (80mm)</h5>
                       <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors">
                          <Printer className="w-4 h-4" />
                       </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1 mb-6">Device ID: STAR_TCP300_LAN</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                       <select className="w-full h-9 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 outline-none text-[11px] font-bold text-zinc-600 dark:text-zinc-300 appearance-none cursor-pointer hover:bg-zinc-100 transition-colors">
                          <option>Role: Kitchen KOT</option>
                          <option>Role: Archana Tickets</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-zinc-100" leadingIcon={<Play className="w-3 h-3" />}>
                       Test
                    </Button>
                 </div>
              </div>

              {/* Add New */}
              <button className="p-6 rounded-[24px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-brand hover:border-brand hover:bg-brand-50/10 transition-all flex flex-col items-center justify-center gap-2 min-h-[140px]">
                 <Plus className="w-6 h-6 opacity-30" />
                 Discover Hardware
              </button>
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
