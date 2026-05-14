"use client";

import { useState } from "react";
import { Wallet, Percent, ChevronDown, Loader2 } from "lucide-react";
import { Input } from "@/app/components/ds/atoms/Input";
import { Switch } from "@/app/components/ds/atoms/Switch";
import { useTempleSettings } from "@/lib/use-temple-settings";
import { SettingsAlerts, SettingsSaveBar } from "@/app/components/temple-admin/SettingsSaveBar";

type FinancePayload = {
  baseCurrency?: string;
  currencySeparator?: string;
  fiscalYearStart?: string;
  taxEnabled?: boolean;
  vatPercent?: string;
  ssclPercent?: string;
  serviceCharge?: string;
};

export default function FinanceSettingsPage() {
  const { payload, loading, saving, error, save } = useTempleSettings<FinancePayload>("system_finance");
  const [draft, setDraft] = useState<FinancePayload>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const merged = { ...payload, ...draft };
  const set = <K extends keyof FinancePayload>(k: K, v: FinancePayload[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) { setSavedAt(Date.now()); setDraft({}); }
  };

  if (loading) return <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Finance & Taxes</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure global currency, tax rates, and fiscal year settings.</p>
        </div>
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save Finance Settings" />
      </div>

      <SettingsAlerts error={error} savedAt={savedAt} />

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Wallet className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Currency Metrics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Base Currency</label>
              <div className="relative">
                <select value={merged.baseCurrency ?? "INR"} onChange={(e) => set("baseCurrency", e.target.value)}
                  className="w-full h-11 pl-4 pr-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold outline-none appearance-none cursor-pointer">
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="LKR">LKR - Sri Lankan Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - Pound Sterling</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Currency Separator</label>
              <select value={merged.currencySeparator ?? "comma"} onChange={(e) => set("currencySeparator", e.target.value)}
                className="w-full h-11 pl-4 pr-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold outline-none">
                <option value="comma">Comma (1,000,000)</option>
                <option value="dot">Dot (1.000.000)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Fiscal Year Start</label>
              <select value={merged.fiscalYearStart ?? "April 1"} onChange={(e) => set("fiscalYearStart", e.target.value)}
                className="w-full h-11 pl-4 pr-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold outline-none">
                <option>January 1</option>
                <option>April 1</option>
              </select>
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-brand">
              <Percent className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Taxation & Compliance</h3>
            </div>
            <Switch checked={merged.taxEnabled ?? false} onChange={(v) => set("taxEnabled", v)} />
          </div>

          {merged.taxEnabled && (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">VAT Percentage</label>
                  <Input value={merged.vatPercent ?? ""} onChange={(e) => set("vatPercent", e.target.value)} suffixText="%" className="font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">SSCL Percentage</label>
                  <Input value={merged.ssclPercent ?? ""} onChange={(e) => set("ssclPercent", e.target.value)} suffixText="%" className="font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Service Charge</label>
                  <Input value={merged.serviceCharge ?? ""} onChange={(e) => set("serviceCharge", e.target.value)} suffixText="%" className="font-mono" />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save Fiscal Settings" />
      </div>
    </div>
  );
}
