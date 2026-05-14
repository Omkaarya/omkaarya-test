"use client";

import { useState } from "react";
import { Monitor, CreditCard, Loader2 } from "lucide-react";
import { Switch } from "@/app/components/ds/atoms/Switch";
import { useTempleSettings } from "@/lib/use-temple-settings";
import { SettingsAlerts, SettingsSaveBar } from "@/app/components/temple-admin/SettingsSaveBar";

type PosPayload = {
  cashDrawerRequired?: boolean;
  autoPrintReceipt?: boolean;
  defaultRegisterFloat?: number;
  closeOutRequiresManager?: boolean;
};

export default function POSSettingsPage() {
  const { payload, loading, saving, error, save } = useTempleSettings<PosPayload>("app_pos");
  const [draft, setDraft] = useState<PosPayload>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const merged = { ...payload, ...draft };
  const set = <K extends keyof PosPayload>(k: K, v: PosPayload[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) { setSavedAt(Date.now()); setDraft({}); }
  };

  if (loading) return <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">POS Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure terminal rules and checkout policies.</p>
        </div>
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save POS Configuration" />
      </div>

      <SettingsAlerts error={error} savedAt={savedAt} />

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Monitor className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Active Registers</h3>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage individual registers from the <a href="/temple-admin/pos/registers" className="text-brand font-bold">POS · Registers</a> page.
          </p>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <CreditCard className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Checkout Rules</h3>
          </div>

          <div className="space-y-4">
            <ToggleRow
              title="Require Cash Drawer Open"
              description="Transaction cannot complete until cash drawer sensor confirms open state."
              checked={merged.cashDrawerRequired ?? true}
              onChange={(v) => set("cashDrawerRequired", v)}
            />
            <ToggleRow
              title="Auto-Print Thermal Receipt"
              description="Immediately trigger thermal printer after every successful payment."
              checked={merged.autoPrintReceipt ?? false}
              onChange={(v) => set("autoPrintReceipt", v)}
            />
            <ToggleRow
              title="Manager Approval to Close Out"
              description="Require manager PIN to close a register session."
              checked={merged.closeOutRequiresManager ?? false}
              onChange={(v) => set("closeOutRequiresManager", v)}
            />
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save POS Configuration" />
      </div>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
      <div>
        <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{title}</h4>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
