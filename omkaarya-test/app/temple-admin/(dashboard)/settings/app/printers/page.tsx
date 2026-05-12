"use client";

import { useState } from "react";
import { Network, Loader2 } from "lucide-react";
import { Input } from "@/app/components/ds/atoms/Input";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { useTempleSettings } from "@/lib/use-temple-settings";
import { SettingsAlerts, SettingsSaveBar } from "@/app/components/temple-admin/SettingsSaveBar";

type PrinterMapping = {
  id: string;
  name: string;
  deviceId: string;
  role: string;
};

type PrintersPayload = {
  nodeIp?: string;
  nodePort?: string;
  mappedPrinters?: PrinterMapping[];
};

export default function PrintersSettingsPage() {
  const { payload, loading, saving, error, save } = useTempleSettings<PrintersPayload>("app_printers");
  const [draft, setDraft] = useState<PrintersPayload>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const merged = { ...payload, ...draft };
  const set = <K extends keyof PrintersPayload>(k: K, v: PrintersPayload[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) { setSavedAt(Date.now()); setDraft({}); }
  };

  if (loading) return <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Printers & Hardware</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage thermal printers and node connection.</p>
        </div>
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save Settings" />
      </div>

      <SettingsAlerts error={error} savedAt={savedAt} />

      <div className="space-y-12">
        <section className="p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-brand">
              <Network className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Local Print Node</h3>
            </div>
            <Badge color="success" size="sm" dot>Configured</Badge>
          </div>

          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Omkaarya communicates with local thermal printers via a background agent. Set the IP/port of your Print Node.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Node IP Address</label>
              <Input value={merged.nodeIp ?? ""} onChange={(e) => set("nodeIp", e.target.value)} placeholder="192.168.1.100" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Port</label>
              <Input value={merged.nodePort ?? ""} onChange={(e) => set("nodePort", e.target.value)} placeholder="8080" />
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
