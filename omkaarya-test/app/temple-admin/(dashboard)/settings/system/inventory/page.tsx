"use client";

import { useState } from "react";
import { PackageSearch, BellRing, Package, Book, Layers, Box, Loader2 } from "lucide-react";
import { Input } from "@/app/components/ds/atoms/Input";
import { Switch } from "@/app/components/ds/atoms/Switch";
import { useTempleSettings } from "@/lib/use-temple-settings";
import { SettingsAlerts, SettingsSaveBar } from "@/app/components/temple-admin/SettingsSaveBar";

type InventoryAlertsPayload = {
  consumablesThreshold?: number;
  retailThreshold?: number;
  rawMaterialsThreshold?: number;
  fixedAssetsThreshold?: number;
  dashboardAlertsEnabled?: boolean;
  emailDigestEnabled?: boolean;
  emailDigestRecipient?: string;
};

export default function InventorySettingsPage() {
  const { payload, loading, saving, error, save } = useTempleSettings<InventoryAlertsPayload>("system_inventory");
  const [draft, setDraft] = useState<InventoryAlertsPayload>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const merged = { ...payload, ...draft };
  const set = <K extends keyof InventoryAlertsPayload>(k: K, v: InventoryAlertsPayload[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) { setSavedAt(Date.now()); setDraft({}); }
  };

  if (loading) return <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Inventory Alerts</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure global low-stock thresholds and alert routing.</p>
        </div>
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save Settings" />
      </div>

      <SettingsAlerts error={error} savedAt={savedAt} />

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <PackageSearch className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Stock Baselines</h3>
          </div>

          <div className="p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ThresholdField icon={<Package className="w-3 h-3" />} label="Consumables (Oil / Ghee)" value={merged.consumablesThreshold} onChange={(n) => set("consumablesThreshold", n)} />
              <ThresholdField icon={<Book className="w-3 h-3" />} label="Retail Items (Books)" value={merged.retailThreshold} onChange={(n) => set("retailThreshold", n)} />
              <ThresholdField icon={<Layers className="w-3 h-3" />} label="Raw Materials (BOM)" value={merged.rawMaterialsThreshold} onChange={(n) => set("rawMaterialsThreshold", n)} />
              <ThresholdField icon={<Box className="w-3 h-3" />} label="Fixed Assets" value={merged.fixedAssetsThreshold} onChange={(n) => set("fixedAssetsThreshold", n)} />
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <BellRing className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Alert Routing</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
              <div>
                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">In-App Dashboard Alerts</h4>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Show low-stock badges in the Temple Admin dashboard.</p>
              </div>
              <Switch checked={merged.dashboardAlertsEnabled ?? true} onChange={(v) => set("dashboardAlertsEnabled", v)} />
            </div>

            <div className="p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Daily Digest Email</h4>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Send a daily summary of low-stock items.</p>
                </div>
                <Switch checked={merged.emailDigestEnabled ?? true} onChange={(v) => set("emailDigestEnabled", v)} />
              </div>
              {(merged.emailDigestEnabled ?? true) && (
                <div className="pt-4 border-t border-zinc-50 dark:border-zinc-900">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 mb-2">Recipient Email</label>
                  <Input type="email" value={merged.emailDigestRecipient ?? ""} onChange={(e) => set("emailDigestRecipient", e.target.value)} placeholder="manager@temple.com" />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save All Changes" />
      </div>
    </div>
  );
}

function ThresholdField({
  icon, label, value, onChange,
}: { icon: React.ReactNode; label: string; value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 flex items-center gap-2">
        {icon} {label}
      </label>
      <Input type="number" value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))} suffixText="Units" className="font-mono" />
    </div>
  );
}
