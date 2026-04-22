"use client";

import { Save, UploadCloud } from "lucide-react";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">General Settings</h2>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Configure your temple's core identity and localization.</p>
      </div>

      <div className="space-y-5">
        {/* Logo Upload */}
        <div className="flex items-start gap-5 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center text-[var(--brand-primary)] shrink-0 cursor-pointer hover:border-[var(--brand-primary)] transition-colors">
            <UploadCloud className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Logo</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Temple Logo</h4>
            <p className="text-xs font-medium text-[var(--text-muted)] mt-1 mb-3">Upload your official temple logo. Used on receipts, portals, and emails. Recommended ratio 1:1, max 2MB.</p>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors">Choose File...</button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Temple Name *</label>
            <input type="text" defaultValue="Omkaarya Main Temple" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Primary Contact Number</label>
            <input type="text" defaultValue="+94 77 123 4567" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Official Email</label>
            <input type="email" defaultValue="admin@omkaaryatemple.lk" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Address</label>
            <textarea rows={3} defaultValue="123 Temple Road, Colombo 06" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] transition-colors resize-none" />
          </div>
        </div>

        <hr className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* Localization */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Timezone</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
              <option>Asia/Colombo (IST)</option>
              <option>Asia/Kolkata (IST)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">System Language</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
              <option>English</option>
              <option>Tamil</option>
              <option>Sinhala</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
          <Save className="w-4 h-4" /> Save General Settings
        </button>
      </div>
    </div>
  );
}
