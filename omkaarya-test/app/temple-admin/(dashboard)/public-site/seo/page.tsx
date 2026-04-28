"use client";

import { useState } from "react";
import {
  Search, Globe, Lock, ExternalLink, Copy, Check,
  RefreshCw, ShieldCheck, AlertTriangle, ChevronDown
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Badge } from "@/app/components/ds/atoms/Badge";

type DomainStatus = "verified" | "pending" | "error" | "none";

interface DomainRecord {
  type: string;
  name: string;
  value: string;
  status: DomainStatus;
}

const DNS_RECORDS: DomainRecord[] = [
  {
    type: "CNAME",
    name: "www",
    value: "proxy.omkaarya.com",
    status: "verified",
  },
  {
    type: "A",
    name: "@",
    value: "76.76.21.21",
    status: "pending",
  },
  {
    type: "TXT",
    name: "_omk-verify",
    value: "omk-verify=a1b2c3d4e5f6g7h8",
    status: "verified",
  },
];

const STATUS_CONFIG: Record<DomainStatus, { label: string; color: "success" | "warning" | "error" | "gray"; icon: React.ElementType }> = {
  verified: { label: "Verified", color: "success", icon: ShieldCheck },
  pending: { label: "Pending", color: "warning", icon: RefreshCw },
  error: { label: "Error", color: "error", icon: AlertTriangle },
  none: { label: "Not Set", color: "gray", icon: Globe },
};

export default function SEODomainPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [domainStatus] = useState<"custom" | "subdomain">("subdomain");
  const [customDomain, setCustomDomain] = useState("");

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              SEO & Domain
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Configure search optimization, custom domain routing and URL structure.
            </p>
          </div>
        </div>
        <Button variant="primary" size="lg">
          Save Settings
        </Button>
      </div>

      <div className="space-y-12">
        {/* ── Domain Configuration ──────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Globe className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Domain Configuration</h3>
          </div>

          {/* Subdomain Card */}
          <div className="p-6 rounded-[24px] border-2 border-brand/20 bg-white dark:bg-zinc-950 shadow-sm shadow-brand/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Default Subdomain
                </span>
                <Badge color="success" size="sm" variant="subtle">Active</Badge>
              </div>
              <Badge color="blue" size="sm" variant="subtle">SSL Secured</Badge>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-mono text-zinc-900 dark:text-white">
                sivatemple.site.omkaarya.com
              </code>
              <button
                onClick={() => copyToClipboard("sivatemple.site.omkaarya.com", "subdomain")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:border-brand/30 transition-all"
              >
                {copied === "subdomain" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy
              </button>
              <Button variant="ghost" size="sm" trailingIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Open
              </Button>
            </div>
            <p className="mt-3 text-[11px] font-medium text-zinc-400">
              This subdomain is always active and cannot be changed. Your custom domain will point to this address.
            </p>
          </div>

          {/* Custom Domain */}
          <div className="p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  Custom Domain
                </h4>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                  Point your own domain (e.g. www.sivatemple.org) to your Omkaarya microsite.
                </p>
              </div>
              <Badge color="brand" size="sm" variant="subtle">Sankalpa+</Badge>
            </div>

            <div className="flex gap-3">
              <Input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. www.sivatemple.org or bookings.mytemple.org"
                leadingIcon={<Globe className="w-4 h-4" />}
                className="flex-1"
              />
              <Button variant="outline" className="h-11 rounded-xl shrink-0">
                Verify DNS
              </Button>
            </div>

            {/* DNS Records Table */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Required DNS Records
              </p>
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-zinc-400">Type</th>
                      <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-zinc-400">Name</th>
                      <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-zinc-400">Value</th>
                      <th className="text-left px-4 py-3 font-black uppercase tracking-wider text-zinc-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DNS_RECORDS.map((record, i) => {
                      const config = STATUS_CONFIG[record.status];
                      const StatusIcon = config.icon;
                      return (
                        <tr
                          key={i}
                          className="border-b border-zinc-50 dark:border-zinc-900 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <code className="text-[10px] font-mono font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">
                              {record.type}
                            </code>
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">{record.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-zinc-900 dark:text-white truncate max-w-[180px]">
                                {record.value}
                              </code>
                              <button
                                onClick={() => copyToClipboard(record.value, `record-${i}`)}
                                className="text-zinc-300 hover:text-brand transition-colors shrink-0"
                              >
                                {copied === `record-${i}` ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge color={config.color} size="sm" variant="subtle">
                              {config.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] font-medium text-zinc-400">
                DNS propagation can take up to 48 hours. SSL certificate will be automatically issued after verification.
              </p>
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* ── SEO Metadata ──────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Search className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Search Optimization</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                Page Title (SEO Title Tag)
              </label>
              <Input defaultValue="Sri Siva Temple | Pooja Bookings, Events & Donations | Colombo" />
              <div className="flex justify-between px-1">
                <p className="text-[10px] font-medium text-zinc-400">Recommended: 50–60 characters</p>
                <span className="text-[10px] font-bold text-zinc-500">61 / 60</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                defaultValue="Official online portal of Sri Siva Temple, Colombo. Book poojas, view event schedules, donate securely and explore our 400-year heritage."
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all placeholder:text-zinc-400 resize-none"
              />
              <p className="text-[10px] font-medium text-zinc-400 px-1">Recommended: 150–160 characters</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                Keywords (comma-separated)
              </label>
              <Input defaultValue="siva temple, pooja booking colombo, sri lanka temple, online donation" />
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* ── Google Search Preview ─────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand">
            <Search className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Search Result Preview</h3>
          </div>

          <div className="p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="space-y-1 max-w-lg">
              <p className="text-[11px] font-medium text-zinc-400">sivatemple.site.omkaarya.com</p>
              <h3 className="text-lg font-normal text-blue-700 dark:text-blue-400 leading-tight cursor-pointer hover:underline">
                Sri Siva Temple | Pooja Bookings, Events & Donations | Colombo
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Official online portal of Sri Siva Temple, Colombo. Book poojas, view event schedules, donate securely and explore our 400-year heritage.
              </p>
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* ── Social Open Graph ─────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Globe className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Social Share (Open Graph)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                OG Title
              </label>
              <Input defaultValue="Sri Siva Temple — Colombo's Sacred Heritage" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                OG Image URL
              </label>
              <Input placeholder="https://cdn.image.com/og-banner.jpg" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
              OG Description
            </label>
            <textarea
              rows={2}
              defaultValue="Experience the divine — book poojas, donate and explore events at Sri Siva Temple, Colombo."
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all placeholder:text-zinc-400 resize-none"
            />
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* ── URL Structure ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-brand">
              <Lock className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">URL Structure & Slugs</h3>
            </div>
            <Badge color="brand" size="sm" variant="subtle">Sankalpa+</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Events Page URL", value: "events", prefix: "/temple-admin" },
              { label: "Donations Page URL", value: "donate", prefix: "/temple-admin" },
              { label: "Contact Page URL", value: "contact-us", prefix: "/temple-admin" },
            ].map((url) => (
              <div key={url.label} className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                  {url.label}
                </label>
                <Input
                  defaultValue={url.value}
                  prefixText={`${url.prefix}/`}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <Button variant="primary" size="lg">
          Save SEO & Domain Settings
        </Button>
      </div>
    </div>
  );
}
