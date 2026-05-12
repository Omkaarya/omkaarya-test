"use client";

import { useState } from "react";
import { Link as LinkIcon, Globe, Search, Check, Share2, Play, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { useTempleSettings } from "@/lib/use-temple-settings";
import { SettingsAlerts, SettingsSaveBar } from "@/app/components/temple-admin/SettingsSaveBar";

type WebPayload = {
  defaultSubdomain?: string;
  customDomain?: string;
  portalTitle?: string;
  metaDescription?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
};

export default function WebSettingsPage() {
  const { payload, loading, saving, error, save } = useTempleSettings<WebPayload>("web");
  const [draft, setDraft] = useState<WebPayload>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const merged = { ...payload, ...draft };
  const set = <K extends keyof WebPayload>(k: K, v: WebPayload[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) { setSavedAt(Date.now()); setDraft({}); }
  };

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Web Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage your public portal presence and custom domain routing.</p>
        </div>
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save Settings" />
      </div>

      <SettingsAlerts error={error} savedAt={savedAt} />

      <div className="space-y-12">
        <section className="p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-brand">
              <Globe className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Domain Configuration</h3>
            </div>
            <Badge color="blue" size="sm" variant="subtle">SSL Protected</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Default Subdomain</label>
              <Input value={merged.defaultSubdomain ?? ""} onChange={(e) => set("defaultSubdomain", e.target.value)} placeholder="temple-name.omkaarya.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Custom Domain</label>
              <Input value={merged.customDomain ?? ""} onChange={(e) => set("customDomain", e.target.value)} placeholder="bookings.mytemple.org" />
            </div>
          </div>

          <div className="flex justify-start">
            <Button variant="outline" className="h-11 rounded-xl border-zinc-200" leadingIcon={<Check className="w-4 h-4" />}>
              Verify DNS Records
            </Button>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-8">
          <div className="flex items-center gap-3 text-brand">
            <Search className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Search Optimization</h3>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Portal Title Tag</label>
              <Input value={merged.portalTitle ?? ""} onChange={(e) => set("portalTitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Meta Description</label>
              <textarea
                rows={3}
                value={merged.metaDescription ?? ""}
                onChange={(e) => set("metaDescription", e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium outline-none resize-none"
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-8">
          <div className="flex items-center gap-3 text-brand">
            <LinkIcon className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Social Integrations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SocialField icon={<Share2 className="w-5 h-5" />} bg="bg-blue-50 dark:bg-blue-950/20 text-blue-600" label="Facebook"
              value={merged.facebookUrl ?? ""} onChange={(v) => set("facebookUrl", v)} />
            <SocialField icon={<Globe className="w-5 h-5" />} bg="bg-pink-50 dark:bg-pink-950/20 text-pink-600" label="Instagram"
              value={merged.instagramUrl ?? ""} onChange={(v) => set("instagramUrl", v)} />
            <SocialField icon={<Play className="w-5 h-5" />} bg="bg-red-50 dark:bg-red-950/20 text-red-600" label="YouTube"
              value={merged.youtubeUrl ?? ""} onChange={(v) => set("youtubeUrl", v)} />
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <SettingsSaveBar saving={saving} onSave={handleSave} label="Save All Changes" />
      </div>
    </div>
  );
}

function SocialField({ icon, bg, label, value, onChange }: { icon: React.ReactNode; bg: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>
      <div className="flex-1 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{label}</p>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={`${label} URL`} className="h-8 text-xs px-0 bg-transparent border-none shadow-none focus:ring-0" />
      </div>
    </div>
  );
}
