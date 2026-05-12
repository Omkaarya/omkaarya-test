"use client";

import { useEffect, useMemo, useState } from "react";
import { Palette, Save, UploadCloud, Check, Eye, RefreshCw, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { useTempleSettings } from "@/lib/use-temple-settings";

const PRESET_THEMES = [
  { id: "default", name: "Omkaarya Default", primary: "#FF4800", accent: "#FFF0EB", dark: "#1A0500" },
  { id: "royal", name: "Royal Gold", primary: "#B8860B", accent: "#FFF8DC", dark: "#2D1B00" },
  { id: "divine", name: "Divine Blue", primary: "#1E3A8A", accent: "#EFF6FF", dark: "#0F172A" },
  { id: "forest", name: "Sacred Forest", primary: "#166534", accent: "#F0FDF4", dark: "#052E16" },
  { id: "saffron", name: "Saffron Deep", primary: "#C05621", accent: "#FFF7ED", dark: "#431407" },
  { id: "maroon", name: "Maroon Silk", primary: "#9B1C1C", accent: "#FFF5F5", dark: "#1A0000" },
];

const FONT_PAIRS = [
  { id: "modern", heading: "Plus Jakarta Sans", body: "Inter", label: "Modern" },
  { id: "classical", heading: "Playfair Display", body: "Lora", label: "Classical" },
  { id: "traditional", heading: "Noto Serif", body: "Noto Sans", label: "Traditional" },
  { id: "bold", heading: "DM Serif Display", body: "DM Sans", label: "Bold" },
];

type PublicBrandingPayload = {
  selectedTheme: string;
  selectedFont: string;
  primaryColor: string;
  templeName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
};

const DEFAULT_BRANDING: PublicBrandingPayload = {
  selectedTheme: "default",
  selectedFont: "modern",
  primaryColor: "#FF4800",
  templeName: "",
  tagline: "",
  logoUrl: "",
  faviconUrl: "",
};

function mergeBranding(payload: Record<string, unknown>): PublicBrandingPayload {
  return {
    ...DEFAULT_BRANDING,
    ...(payload as Partial<PublicBrandingPayload>),
  };
}

export default function BrandingPage() {
  const { payload, loading, saving, error, replace, reload } = useTempleSettings<Record<string, unknown>>(
    "public_branding",
    {}
  );
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_BRANDING.selectedTheme);
  const [selectedFont, setSelectedFont] = useState(DEFAULT_BRANDING.selectedFont);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_BRANDING.primaryColor);
  const [templeName, setTempleName] = useState(DEFAULT_BRANDING.templeName);
  const [tagline, setTagline] = useState(DEFAULT_BRANDING.tagline);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_BRANDING.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(DEFAULT_BRANDING.faviconUrl);

  useEffect(() => {
    if (loading) return;
    const m = mergeBranding(payload);
    setSelectedTheme(m.selectedTheme);
    setSelectedFont(m.selectedFont);
    setPrimaryColor(m.primaryColor);
    setTempleName(m.templeName);
    setTagline(m.tagline);
    setLogoUrl(m.logoUrl);
    setFaviconUrl(m.faviconUrl);
  }, [loading, payload]);

  const activeTheme = useMemo(
    () => PRESET_THEMES.find((t) => t.id === selectedTheme) || PRESET_THEMES[0],
    [selectedTheme]
  );

  const publish = async () => {
    const next: PublicBrandingPayload = {
      selectedTheme,
      selectedFont,
      primaryColor,
      templeName,
      tagline,
      logoUrl,
      faviconUrl,
    };
    await replace(next as unknown as Record<string, unknown>);
  };

  const resetLocal = () => {
    setSelectedTheme("default");
    setSelectedFont("modern");
    setPrimaryColor("#FF4800");
    setTempleName("");
    setTagline("");
    setLogoUrl("");
    setFaviconUrl("");
  };

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              Branding &amp; Theme
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Customize your public site&apos;s visual identity — persisted to your temple operational database.
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" size="lg" leadingIcon={<Eye className="w-4 h-4" />} onClick={() => reload()}>
            Reload
          </Button>
          <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />} onClick={publish} disabled={saving || loading}>
            {saving ? "Saving…" : "Publish Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading branding…
        </div>
      )}

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Temple Logo URL</label>
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[20px] p-6 flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/20">
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…/logo.png" />
                <p className="text-xs text-zinc-400">Paste a hosted image URL (upload pipeline can be added later).</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Favicon URL</label>
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[20px] p-6 flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/20">
                <Input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="https://…/favicon.ico" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Temple Name (Site Header)</label>
              <Input value={templeName} onChange={(e) => setTempleName(e.target.value)} placeholder="Your temple name" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Tagline / Sub-title</label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short tagline" />
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand">
            <Palette className="w-5 h-5" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Color Theme</h3>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Preset Themes</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRESET_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setSelectedTheme(theme.id);
                    setPrimaryColor(theme.primary);
                  }}
                  className={`relative flex items-center gap-3 p-4 rounded-[18px] border-2 transition-all ${
                    selectedTheme === theme.id
                      ? "border-brand shadow-sm shadow-brand/10"
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"
                  }`}
                >
                  <div className="flex gap-1 shrink-0">
                    <div className="w-5 h-8 rounded-l-lg" style={{ backgroundColor: theme.dark }} />
                    <div className="w-5 h-8" style={{ backgroundColor: theme.primary }} />
                    <div className="w-5 h-8 rounded-r-lg" style={{ backgroundColor: theme.accent }} />
                  </div>
                  <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 text-left leading-tight">{theme.name}</span>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Primary / Brand Color", value: primaryColor, onChange: setPrimaryColor },
              { label: "Background Accent", value: activeTheme.accent, onChange: null as null },
              { label: "Dark / Navigation", value: activeTheme.dark, onChange: null as null },
            ].map((color) => (
              <div key={color.label} className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">{color.label}</label>
                <div className="flex gap-2">
                  <div
                    className="w-11 h-11 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 shrink-0"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.onChange ? (
                    <Input value={color.value} onChange={(e) => color.onChange!(e.target.value)} className="font-mono" />
                  ) : (
                    <Input readOnly value={color.value} className="font-mono opacity-70" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-brand">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Typography</h3>
            </div>
            <Badge color="brand" size="sm" variant="subtle">
              Sankalpa+
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FONT_PAIRS.map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => setSelectedFont(pair.id)}
                className={`text-left p-5 rounded-[18px] border-2 transition-all ${
                  selectedFont === pair.id
                    ? "border-brand bg-white dark:bg-zinc-950 shadow-sm shadow-brand/10"
                    : "border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 hover:border-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{pair.label}</span>
                  {selectedFont === pair.id && (
                    <Badge color="brand" size="sm" variant="subtle">
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-white mb-0.5" style={{ fontFamily: pair.heading }}>
                  {pair.heading}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400" style={{ fontFamily: pair.body }}>
                  Body: {pair.body}
                </p>
              </button>
            ))}
          </div>
        </section>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-brand">
              <Eye className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Theme Preview</h3>
            </div>
            <button
              type="button"
              onClick={resetLocal}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-brand transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset to Default
            </button>
          </div>

          <div className="rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md">
            <div className="flex items-center justify-between px-6 py-3" style={{ backgroundColor: activeTheme.dark }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/20" />
                <div className="h-2 w-24 bg-white/60 rounded-full" />
              </div>
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-1.5 w-10 bg-white/30 rounded-full" />
                ))}
              </div>
              <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                Book Pooja
              </div>
            </div>
            <div className="h-28 relative flex items-end p-6" style={{ backgroundColor: activeTheme.dark }}>
              <div className="space-y-2">
                <div className="h-3 w-48 rounded-full bg-white/80" />
                <div className="h-2 w-32 rounded-full bg-white/40" />
                <div className="mt-2 px-4 py-1.5 rounded-lg inline-block text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                  View Events
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-3" style={{ backgroundColor: activeTheme.accent }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-3 space-y-2 shadow-sm">
                  <div className="h-2 w-16 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.4 }} />
                  <div className="h-1.5 w-full rounded-full bg-zinc-200" />
                  <div className="h-1.5 w-3/4 rounded-full bg-zinc-100" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <Button variant="primary" size="lg" leadingIcon={<Save className="w-4 h-4" />} onClick={publish} disabled={saving || loading}>
          {saving ? "Saving…" : "Publish Branding Changes"}
        </Button>
      </div>
    </div>
  );
}
