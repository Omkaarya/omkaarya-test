"use client";

import { Save, Link as LinkIcon, Globe, Search, Facebook, Instagram, Youtube, Check } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Badge } from "@/app/components/ds/atoms/Badge";

export default function WebSettingsPage() {
  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Web Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage your public portal presence and custom domain routing.</p>
        </div>
        <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
          Save Settings
        </Button>
      </div>

      <div className="space-y-12">
        {/* Domain Mapping */}
        <section className="p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-8">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3 text-brand">
                <Globe className="w-5 h-5" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Domain Configuration</h3>
             </div>
             <Badge color="blue" size="sm" variant="subtle">SSL Protected</Badge>
          </div>
          
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Set up a custom domain to point to your Omkaarya portal. Ensure your DNS records are configured correctly before verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Subdomain (Default)</label>
                <Input defaultValue="siva-temple.omkaarya.com" disabled className="bg-zinc-100/50 dark:bg-zinc-900/50" />
             </div>
             <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Custom Domain</label>
                <Input placeholder="bookings.mytemple.org" />
             </div>
          </div>
          
          <div className="flex justify-start">
             <Button variant="outline" className="h-11 rounded-xl border-zinc-200" leadingIcon={<Check className="w-4 h-4" />}>
                Verify DNS Records
             </Button>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* SEO Overrides */}
        <section className="space-y-8">
           <div className="flex items-center gap-3 text-brand">
              <Search className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Search Optimization</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Portal Title Tag</label>
                <Input defaultValue="Siva Temple | Pooja Bookings & Logistics" />
                <p className="text-[10px] font-medium text-zinc-400 px-1 uppercase tracking-tight">Appears in browser tabs and search results.</p>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Meta Description</label>
                <textarea 
                   rows={3} 
                   defaultValue="Official bookings and donations portal for the Sri Siva Temple of Colombo." 
                   className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all placeholder:text-zinc-400 resize-none"
                />
              </div>
           </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Social Links */}
        <section className="space-y-8">
           <div className="flex items-center gap-3 text-brand">
              <LinkIcon className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Social Integrations</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center shrink-0">
                    <Facebook className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <Input placeholder="Facebook URL" variant="ghost" className="h-10 text-xs px-0" />
                 </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                 <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/20 text-pink-600 flex items-center justify-center shrink-0">
                    <Instagram className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <Input placeholder="Instagram URL" variant="ghost" className="h-10 text-xs px-0" />
                 </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                 <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 flex items-center justify-center shrink-0">
                    <Youtube className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <Input placeholder="Youtube URL" variant="ghost" className="h-10 text-xs px-0" />
                 </div>
              </div>
           </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
         <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />}>
           Save All Changes
         </Button>
      </div>
    </div>
  );
}