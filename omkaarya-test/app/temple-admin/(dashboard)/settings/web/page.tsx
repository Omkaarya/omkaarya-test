"use client";

import { Save, Link as LinkIcon, Edit3 } from "lucide-react";

export default function WebSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">Web Settings</h2>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Manage your public portal presence and custom domain routing.</p>
      </div>

      <div className="space-y-6">
        {/* Domain Mapping */}
        <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1">
            <GlobeIcon /> Domain Configuration
          </h4>
          <p className="text-xs font-medium text-[var(--text-muted)] mb-4">Set up a custom domain to point to your Omkaarya portal (e.g. bookings.mytemple.org).</p>
          
          <div className="flex gap-3 items-center">
            <div className="flex-1">
               <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Subdomain (Default)</label>
               <input type="text" defaultValue="siva-temple.omkaarya.com" disabled className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/50 text-sm font-semibold text-[var(--text-muted)] cursor-not-allowed" />
            </div>
            <div className="flex-1">
               <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Custom Domain</label>
               <input type="text" placeholder="e.g. bookings.siva-temple.org" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
            </div>
          </div>
          <button className="mt-3 px-4 py-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold hover:bg-[var(--brand-primary)]/20 transition-colors">Verify DNS Records</button>
        </div>

        {/* SEO Overrides */}
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">SEO Details</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Portal Title Tag</label>
              <input type="text" defaultValue="Siva Temple | Pooja Bookings & Logistics" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Meta Description</label>
              <textarea rows={2} defaultValue="Official bookings and donations portal for the Sri Siva Temple of Colombo." className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] transition-colors resize-none" />
            </div>
          </div>
        </div>

        <hr className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* Social Links */}
        <div>
           <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-zinc-400" /> Social Integrations</h4>
           <div className="space-y-3">
             <div className="flex items-center gap-3">
               <div className="w-[120px] text-xs font-bold text-[var(--text-secondary)]">Facebook URL</div>
               <input type="url" placeholder="https://facebook.com/..." className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]" />
             </div>
             <div className="flex items-center gap-3">
               <div className="w-[120px] text-xs font-bold text-[var(--text-secondary)]">Instagram URL</div>
               <input type="url" placeholder="https://instagram.com/..." className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]" />
             </div>
           </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
          <Save className="w-4 h-4" /> Save Web Settings
        </button>
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand-primary)]"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  )
}
