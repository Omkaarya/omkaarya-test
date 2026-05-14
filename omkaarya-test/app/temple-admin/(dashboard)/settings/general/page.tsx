"use client";

import {
  Save,
  UploadCloud,
  Building2,
  Globe,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { useTempleSettings } from "@/lib/use-temple-settings";

type GeneralPayload = {
  templeName?: string;
  contactEmail?: string;
  primaryPhone?: string;
  physicalAddress?: string;
  systemLanguage?: string;
  primaryTimezone?: string;
};

export default function GeneralSettingsPage() {
  const { payload, loading, saving, error, save } = useTempleSettings<GeneralPayload>("general");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [draft, setDraft] = useState<GeneralPayload>({});

  const merged = { ...payload, ...draft };

  const set = <K extends keyof GeneralPayload>(k: K, v: GeneralPayload[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) {
      setSavedAt(Date.now());
      setDraft({});
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">General Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Configure your temple's core identity, localization, and contact details.
          </p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}
      {savedAt && !error && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">Saved successfully.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-4">Branding</h3>
            <div className="group relative w-full aspect-square rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center transition-all hover:border-brand hover:bg-brand-50/30 cursor-pointer overflow-hidden">
              <div className="flex flex-col items-center text-zinc-400 group-hover:text-brand transition-colors">
                <UploadCloud className="w-10 h-10 mb-2 stroke-[1.5px]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Upload Logo</span>
                <span className="text-[9px] mt-1 font-medium text-zinc-400">SVG, PNG, JPG (Max 2MB)</span>
              </div>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-5 leading-relaxed font-medium text-center italic">
              This logo appears on receipts and official documents.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-brand">
              <Building2 className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Temple Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Official Temple Name</label>
                <Input value={merged.templeName ?? ""} onChange={(e) => set("templeName", e.target.value)} placeholder="Enter temple name..." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Contact Email</label>
                <Input value={merged.contactEmail ?? ""} onChange={(e) => set("contactEmail", e.target.value)} placeholder="admin@temple.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Primary Phone</label>
                <Input value={merged.primaryPhone ?? ""} onChange={(e) => set("primaryPhone", e.target.value)} placeholder="+94 …" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Physical Address</label>
                <Input value={merged.physicalAddress ?? ""} onChange={(e) => set("physicalAddress", e.target.value)} placeholder="Street, City, Zip..." />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          <div className="space-y-6">
            <div className="flex items-center gap-3 text-brand">
              <Globe className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Localization</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">System Language</label>
                <div className="relative">
                  <select value={merged.systemLanguage ?? "English"} onChange={(e) => set("systemLanguage", e.target.value)} className="w-full h-11 pl-4 pr-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all appearance-none cursor-pointer">
                    <option>English</option><option>Tamil</option><option>Sinhala</option><option>Hindi</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Primary Timezone</label>
                <div className="relative">
                  <select value={merged.primaryTimezone ?? "Asia/Kolkata"} onChange={(e) => set("primaryTimezone", e.target.value)} className="w-full h-11 pl-4 pr-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all appearance-none cursor-pointer">
                    <option>Asia/Colombo</option><option>Asia/Kolkata</option><option>UTC</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="primary" size="lg" leadingIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save All Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
