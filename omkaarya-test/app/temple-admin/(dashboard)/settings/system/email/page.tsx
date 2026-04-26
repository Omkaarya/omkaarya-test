"use client";

import { useState } from "react";
import { Save, Mail, Plug2, Send, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Badge } from "@/app/components/ds/atoms/Badge";

export default function EmailGatewayPage() {
  const [provider, setProvider] = useState<"smtp" | "sendgrid">("smtp");

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Email Gateway</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure SMTP or cloud providers for system notifications and digital receipts.</p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
          Save Gateway
        </Button>
      </div>

      <div className="space-y-12">
        {/* Provider Toggle */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-brand">
              <Plug2 className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Primary Provider</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setProvider("smtp")}
                className={`flex items-center gap-4 p-6 rounded-[24px] border-2 transition-all ${provider === "smtp" ? "border-brand bg-brand-50/20 shadow-sm shadow-brand/5" : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-200"}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${provider === "smtp" ? "bg-brand text-white" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"}`}>
                   <Mail className="w-6 h-6" />
                </div>
                <div className="text-left">
                   <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Direct SMTP</h4>
                   <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Use your own mail server.</p>
                </div>
                {provider === "smtp" && <Check className="ml-auto w-5 h-5 text-brand" />}
              </button>

              <button 
                onClick={() => setProvider("sendgrid")}
                className={`flex items-center gap-4 p-6 rounded-[24px] border-2 transition-all ${provider === "sendgrid" ? "border-brand bg-brand-50/20 shadow-sm shadow-brand/5" : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-200"}`}
              >
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

        {/* Credentials Form */}
        <section className="space-y-8 animate-in fade-in duration-500" key={provider}>
           <div className="flex items-center gap-3 text-brand">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Access Credentials</h3>
           </div>

           {provider === "smtp" ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Host Server</label>
                  <Input defaultValue="smtp.gmail.com" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Port</label>
                  <Input defaultValue="587" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Username</label>
                  <Input placeholder="admin@temple.lk" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Password</label>
                  <Input type="password" placeholder="••••••••••••" />
               </div>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">SendGrid API Key</label>
                  <Input type="password" placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Verified Sender Identity</label>
                  <Input placeholder="noreply@omkaarya.lk" />
                </div>
             </div>
           )}
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Test Connection */}
        <section className="p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="max-w-md">
              <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Test Delivery</h4>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Send a test email to verify your configuration before saving.</p>
           </div>
           <div className="flex gap-2">
              <Input placeholder="Recipient email..." className="w-64 h-11" />
              <Button variant="outline" className="h-11 rounded-xl">Send Test</Button>
           </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
         <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
           Save Configuration
         </Button>
      </div>
    </div>
  );
}
