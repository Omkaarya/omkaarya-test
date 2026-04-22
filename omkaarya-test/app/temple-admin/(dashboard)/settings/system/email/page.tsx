"use client";

import { Save, Mail, Plug2 } from "lucide-react";
import { useState } from "react";

export default function EmailGatewayPage() {
  const [provider, setProvider] = useState("smtp");

  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">Email Gateway</h2>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Configure automated transactional emails (receipts, bookings, resets) to devotees.</p>
      </div>

      <div className="space-y-6">
        
        {/* Provider Switcher */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => setProvider("smtp")}
             className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
             provider === "smtp" ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
           }`}>
              <Plug2 className={`w-5 h-5 shrink-0 ${provider === "smtp" ? "text-[var(--brand-primary)]" : "text-zinc-400"}`} />
              <div>
                 <h5 className={`text-sm font-bold ${provider === "smtp" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>Custom SMTP Server</h5>
                 <p className="text-[10px] text-[var(--text-muted)] mt-1">Connect your own mail server (e.g., Google Workspace, Office 365, Mailgun).</p>
              </div>
           </button>
           <button 
             onClick={() => setProvider("sendgrid")}
             className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
             provider === "sendgrid" ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
           }`}>
              <Mail className={`w-5 h-5 shrink-0 ${provider === "sendgrid" ? "text-[var(--brand-primary)]" : "text-zinc-400"}`} />
              <div>
                 <h5 className={`text-sm font-bold ${provider === "sendgrid" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>SendGrid API</h5>
                 <p className="text-[10px] text-[var(--text-muted)] mt-1">Use a Twilio SendGrid API Key for high deliverability volumes.</p>
              </div>
           </button>
        </div>

        {/* Credentials Form */}
        <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
           
           <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
             {provider === "smtp" ? "SMTP Credentials" : "API Configuration"}
           </h4>

           {provider === "smtp" && (
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Host address</label>
                  <input type="text" placeholder="smtp.gmail.com" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Port</label>
                  <input type="text" placeholder="587 or 465" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Username (Email)</label>
                  <input type="email" placeholder="noreply@omkaaryatemple.lk" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Password / App Password</label>
                  <input type="password" placeholder="••••••••••••••••" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="tls" defaultChecked className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 accent-[var(--brand-primary)]" />
                  <label htmlFor="tls" className="text-xs font-bold text-[var(--text-muted)]">Use TLS/SSL Encryption</label>
                </div>
             </div>
           )}

           {provider === "sendgrid" && (
             <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">API Key</label>
                  <input type="password" placeholder="SG.xxxxxxxxxxxxxxxxxx" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono font-bold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Verified Sender Email</label>
                  <input type="email" placeholder="noreply@omkaaryatemple.lk" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
                </div>
             </div>
           )}
        </div>

        <button className="px-4 py-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors">
          Send Test Email
        </button>

      </div>

      <div className="pt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
          <Save className="w-4 h-4" /> Save Email Configuration
        </button>
      </div>
    </div>
  );
}
