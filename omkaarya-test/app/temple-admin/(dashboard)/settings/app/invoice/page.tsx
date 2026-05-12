"use client";

import { useState } from "react";
import { Receipt, Hash, FileText, Loader2 } from "lucide-react";
import { Input } from "@/app/components/ds/atoms/Input";
import { Switch } from "@/app/components/ds/atoms/Switch";
import { useTempleSettings } from "@/lib/use-temple-settings";
import { SettingsAlerts, SettingsSaveBar } from "@/app/components/temple-admin/SettingsSaveBar";

type InvoicePayload = {
  bookingPrefix?: string;
  donationPrefix?: string;
  posPrefix?: string;
  receiptHeaderText?: string;
  receiptFooterText?: string;
  autoEmailEnabled?: boolean;
};

export default function InvoiceSettingsPage() {
  const { payload, loading, saving, error, save } = useTempleSettings<InvoicePayload>("app_invoice");
  const [draft, setDraft] = useState<InvoicePayload>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const merged = { ...payload, ...draft };
  const set = <K extends keyof InvoicePayload>(k: K, v: InvoicePayload[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) { setSavedAt(Date.now()); setDraft({}); }
  };

  if (loading) return <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Invoice & Receipts</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure billing, receipt numbering, and templates.</p>
        </div>
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save Settings" />
      </div>

      <SettingsAlerts error={error} savedAt={savedAt} />

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Hash className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Transaction Numbering</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Booking Prefix</label>
              <Input value={merged.bookingPrefix ?? ""} onChange={(e) => set("bookingPrefix", e.target.value)} placeholder="BK-" className="font-mono" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Donation Prefix</label>
              <Input value={merged.donationPrefix ?? ""} onChange={(e) => set("donationPrefix", e.target.value)} placeholder="DON-" className="font-mono" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">POS Prefix</label>
              <Input value={merged.posPrefix ?? ""} onChange={(e) => set("posPrefix", e.target.value)} placeholder="POS-" className="font-mono" />
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <FileText className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Receipt Templates</h3>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Header Legal Text</label>
              <textarea rows={3} value={merged.receiptHeaderText ?? ""} onChange={(e) => set("receiptHeaderText", e.target.value)} className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium outline-none resize-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Footer / Terms</label>
              <textarea rows={3} value={merged.receiptFooterText ?? ""} onChange={(e) => set("receiptFooterText", e.target.value)} className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium outline-none resize-none" />
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Receipt className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Email Automation</h3>
          </div>

          <div className="flex items-center justify-between p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="max-w-md">
              <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Auto-send Digital Receipts</h4>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                When a transaction is completed, automatically send a PDF receipt to the devotee's email.
              </p>
            </div>
            <Switch checked={merged.autoEmailEnabled ?? true} onChange={(v) => set("autoEmailEnabled", v)} />
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save All Changes" />
      </div>
    </div>
  );
}
