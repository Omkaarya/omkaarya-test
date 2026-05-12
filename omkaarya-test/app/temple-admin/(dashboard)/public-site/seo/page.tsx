"use client";

import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  Search,
  Globe,
  Lock,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { useTempleSettings } from "@/lib/use-temple-settings";

type DomainStatus = "verified" | "pending" | "error" | "none";

interface DomainRecord {
  type: string;
  name: string;
  value: string;
  status: DomainStatus;
}

const DNS_RECORDS: DomainRecord[] = [
  { type: "CNAME", name: "www", value: "proxy.omkaarya.com", status: "verified" },
  { type: "A", name: "@", value: "76.76.21.21", status: "pending" },
  { type: "TXT", name: "_omk-verify", value: "omk-verify=a1b2c3d4e5f6g7h8", status: "verified" },
];

const STATUS_CONFIG: Record<
  DomainStatus,
  { label: string; color: "success" | "warning" | "error" | "gray"; icon: ElementType }
> = {
  verified: { label: "Verified", color: "success", icon: ShieldCheck },
  pending: { label: "Pending", color: "warning", icon: RefreshCw },
  error: { label: "Error", color: "error", icon: AlertTriangle },
  none: { label: "Not Set", color: "gray", icon: Globe },
};

type PublicSeoPayload = {
  defaultSubdomain: string;
  customDomain: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogImageUrl: string;
  ogDescription: string;
  eventsSlug: string;
  donationsSlug: string;
  contactSlug: string;
};

const DEFAULT_SEO: PublicSeoPayload = {
  defaultSubdomain: "",
  customDomain: "",
  seoTitle: "",
  metaDescription: "",
  keywords: "",
  ogTitle: "",
  ogImageUrl: "",
  ogDescription: "",
  eventsSlug: "events",
  donationsSlug: "donate",
  contactSlug: "contact-us",
};

function mergeSeo(p: Record<string, unknown>): PublicSeoPayload {
  return { ...DEFAULT_SEO, ...(p as Partial<PublicSeoPayload>) };
}

export default function SEODomainPage() {
  const { payload, loading, saving, error, replace, reload } = useTempleSettings<Record<string, unknown>>("public_seo", {});
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState<PublicSeoPayload>(DEFAULT_SEO);

  useEffect(() => {
    if (loading) return;
    setForm(mergeSeo(payload));
  }, [loading, payload]);

  function copyToClipboard(text: string, key: string) {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const save = async () => {
    await replace(form as unknown as Record<string, unknown>);
  };

  const subdomainDisplay = form.defaultSubdomain || "your-temple.site.omkaarya.com";

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">SEO &amp; Domain</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Search metadata and domain hints — saved to <code className="text-xs">public_seo</code> settings.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={() => reload()}>
            Reload
          </Button>
          <Button variant="primary" size="lg" onClick={save} disabled={saving || loading}>
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading SEO settings…
        </div>
      )}

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Globe className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Domain Configuration</h3>
          </div>

          <div className="p-6 rounded-[24px] border-2 border-brand/20 bg-white dark:bg-zinc-950 shadow-sm shadow-brand/5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">Default Subdomain</span>
              <Badge color="success" size="sm" variant="subtle">
                Active
              </Badge>
            </div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Subdomain label (display)</label>
            <Input
              value={form.defaultSubdomain}
              onChange={(e) => setForm((f) => ({ ...f, defaultSubdomain: e.target.value }))}
              placeholder="sivatemple.site.omkaarya.com"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <code className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-mono text-zinc-900 dark:text-white">
                {subdomainDisplay}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(subdomainDisplay, "subdomain")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:border-brand/30 transition-all"
              >
                {copied === "subdomain" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
              <Button variant="ghost" size="sm" trailingIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Open
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">Custom Domain</h4>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                  Point your own domain to your Omkaarya microsite (DNS steps below are illustrative).
                </p>
              </div>
              <Badge color="brand" size="sm" variant="subtle">
                Sankalpa+
              </Badge>
            </div>
            <Input
              value={form.customDomain}
              onChange={(e) => setForm((f) => ({ ...f, customDomain: e.target.value }))}
              placeholder="e.g. www.sivatemple.org"
              leadingIcon={<Globe className="w-4 h-4" />}
            />
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
                    return (
                      <tr key={i} className="border-b border-zinc-50 dark:border-zinc-900 last:border-0">
                        <td className="px-4 py-3">
                          <code className="text-[10px] font-mono font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">{record.type}</code>
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">{record.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-zinc-900 dark:text-white truncate max-w-[180px]">{record.value}</code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(record.value, `record-${i}`)}
                              className="text-zinc-300 hover:text-brand transition-colors shrink-0"
                            >
                              {copied === `record-${i}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
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
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Search className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Search Optimization</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Page Title (SEO Title Tag)</label>
              <Input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Meta Description</label>
              <textarea
                rows={3}
                value={form.metaDescription}
                onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Keywords (comma-separated)</label>
              <Input value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} />
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand">
            <Search className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Search Result Preview</h3>
          </div>
          <div className="p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="space-y-1 max-w-lg">
              <p className="text-[11px] font-medium text-zinc-400">{subdomainDisplay}</p>
              <h3 className="text-lg font-normal text-blue-700 dark:text-blue-400 leading-tight">
                {form.seoTitle || "Your temple — title"}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {form.metaDescription || "Meta description will appear here."}
              </p>
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Globe className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Social Share (Open Graph)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">OG Title</label>
              <Input value={form.ogTitle} onChange={(e) => setForm((f) => ({ ...f, ogTitle: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">OG Image URL</label>
              <Input
                value={form.ogImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, ogImageUrl: e.target.value }))}
                placeholder="https://…"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">OG Description</label>
            <textarea
              rows={2}
              value={form.ogDescription}
              onChange={(e) => setForm((f) => ({ ...f, ogDescription: e.target.value }))}
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand resize-none"
            />
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-brand">
              <Lock className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">URL Structure &amp; Slugs</h3>
            </div>
            <Badge color="brand" size="sm" variant="subtle">
              Sankalpa+
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Events Page URL", key: "eventsSlug" as const },
              { label: "Donations Page URL", key: "donationsSlug" as const },
              { label: "Contact Page URL", key: "contactSlug" as const },
            ].map((url) => (
              <div key={url.key} className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">{url.label}</label>
                <Input
                  value={form[url.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [url.key]: e.target.value }))}
                  prefixText="/"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <Button variant="primary" size="lg" onClick={save} disabled={saving || loading}>
          {saving ? "Saving…" : "Save SEO & Domain Settings"}
        </Button>
      </div>
    </div>
  );
}
