"use client";

import { useState } from "react";
import { Save, Mail, Plug2, Send, ShieldCheck, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { useTempleSettings } from "@/lib/use-temple-settings";

type EmailPayload = {
  provider?: "smtp" | "sendgrid";
  smtpHost?: string;
  smtpPort?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  sendgridApiKey?: string;
  sendgridSender?: string;
};

export default function EmailGatewayPage() {
  const { payload, loading, saving, error, save } = useTempleSettings<EmailPayload>("system_email");
  const [draft, setDraft] = useState<EmailPayload>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const merged = { ...payload, ...draft } as EmailPayload;
  const provider: "smtp" | "sendgrid" = merged.provider === "sendgrid" ? "sendgrid" : "smtp";
  const set = <K extends keyof EmailPayload>(k: K, v: EmailPayload[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    const ok = await save({ provider, ...draft });
    if (ok) {
      setSavedAt(Date.now());
      setDraft({});
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Email Gateway</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure SMTP or cloud providers for system notifications.</p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Gateway"}
        </Button>
      </div>

      {error && <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><p>{error}</p></div>}
      {savedAt && !error && <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><p>Saved successfully.</p></div>}

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Plug2 className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Primary Provider</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => set("provider", "smtp")} className={`flex items-center gap-4 p-6 rounded-[24px] border-2 transition-all ${provider === "smtp" ? "border-brand bg-brand-50/20 shadow-sm shadow-brand/5" : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-200"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${provider === "smtp" ? "bg-brand text-white" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"}`}>
                <Mail className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Direct SMTP</h4>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Use your own mail server.</p>
              </div>
              {provider === "smtp" && <Check className="ml-auto w-5 h-5 text-brand" />}
            </button>

            <button onClick={() => set("provider", "sendgrid")} className={`flex items-center gap-4 p-6 rounded-[24px] border-2 transition-all ${provider === "sendgrid" ? "border-brand bg-brand-50/20 shadow-sm shadow-brand/5" : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-200"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${provider === "sendgrid" ? "bg-brand text-white" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"}`}>
                <Send className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">SendGrid API</h4>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Cloud-based email delivery.</p>
              </div>
              {provider === "sendgrid" && <Check className="ml-auto w-5 h-5 text-brand" />}
            </button>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-8" key={provider}>
          <div className="flex items-center gap-3 text-brand">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Access Credentials</h3>
          </div>

          {provider === "smtp" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Host Server</label>
                <Input value={merged.smtpHost ?? ""} onChange={(e) => set("smtpHost", e.target.value)} placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Port</label>
                <Input value={merged.smtpPort ?? ""} onChange={(e) => set("smtpPort", e.target.value)} placeholder="587" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Username</label>
                <Input value={merged.smtpUsername ?? ""} onChange={(e) => set("smtpUsername", e.target.value)} placeholder="admin@temple.lk" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Password</label>
                <Input type="password" value={merged.smtpPassword ?? ""} onChange={(e) => set("smtpPassword", e.target.value)} placeholder="Leave blank to keep current" />
                <p className="text-[10px] text-zinc-400">Stored securely. Leave empty when editing other fields to keep the current password.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">SendGrid API Key</label>
                <Input type="password" value={merged.sendgridApiKey ?? ""} onChange={(e) => set("sendgridApiKey", e.target.value)} placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Verified Sender Identity</label>
                <Input value={merged.sendgridSender ?? ""} onChange={(e) => set("sendgridSender", e.target.value)} placeholder="noreply@omkaarya.lk" />
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <Button variant="primary" size="lg" leadingIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
