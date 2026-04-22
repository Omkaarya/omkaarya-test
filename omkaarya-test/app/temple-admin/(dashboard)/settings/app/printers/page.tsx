"use client";

import { Save, Printer, Network } from "lucide-react";

export default function PrintersSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">Printers & Hardware</h2>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Manage local thermal printers for automated Archana tickets and receipts.</p>
      </div>

      <div className="space-y-6">
        {/* Network Setup */}
        <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
               <Network className="w-4 h-4 text-[var(--brand-primary)]" /> 
               Local Print Node
             </h4>
             <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
             </span>
          </div>
          <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed mb-4">
            Omkaarya communicates with your local thermal printers via a silent background agent. Ensure your Print Node machine is online.
          </p>
          <div className="flex items-center gap-3">
             <div className="flex-1">
               <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Node IP Address</label>
               <input type="text" defaultValue="192.168.1.100" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono font-bold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
             </div>
             <div className="w-32">
               <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Port</label>
               <input type="text" defaultValue="8080" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono font-bold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
             </div>
          </div>
        </div>

        <hr className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* Mapped Printers */}
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><Printer className="w-4 h-4 text-zinc-400" /> Saved Printers</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Printer 1 */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:border-[var(--brand-primary)] transition-colors">
               <div>
                  <h5 className="text-sm font-bold text-[var(--text-primary)]">Front Desk Epson (80mm)</h5>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1 mb-3">USB: EPSON_TM_T20II</p>
               </div>
               <div className="flex items-center gap-2">
                  <select className="flex-1 text-[11px] px-2 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 outline-none text-[var(--text-secondary)] font-bold">
                     <option>Role: Archana Tickets</option>
                     <option>Role: Kitchen</option>
                  </select>
                  <button className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-[var(--text-secondary)] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Test</button>
               </div>
            </div>

            {/* Printer 2 */}
             <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:border-[var(--brand-primary)] transition-colors">
               <div>
                  <h5 className="text-sm font-bold text-[var(--text-primary)]">Kitchen Star (80mm)</h5>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1 mb-3">IP: 192.168.1.150</p>
               </div>
               <div className="flex items-center gap-2">
                  <select className="flex-1 text-[11px] px-2 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 outline-none text-[var(--text-secondary)] font-bold">
                     <option>Role: Kitchen</option>
                     <option>Role: Archana Tickets</option>
                  </select>
                  <button className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-[var(--text-secondary)] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Test</button>
               </div>
            </div>

            {/* Add New */}
            <button className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors min-h-[110px] flex flex-col items-center justify-center gap-1.5">
               <Printer className="w-5 h-5 opacity-50" />
               Discover New Printer
            </button>
          </div>
        </div>

      </div>

      <div className="pt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>
    </div>
  );
}
