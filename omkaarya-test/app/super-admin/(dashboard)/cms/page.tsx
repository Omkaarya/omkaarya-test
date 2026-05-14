"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Plus, Trash2, LayoutTemplate, Settings, Users, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import type {
  CmsBundle,
  CmsHomeFeature,
  CmsHomePayload,
  CmsPageKey,
  CmsSettingsPayload,
  CmsSimplePagePayload,
} from "@/lib/website-cms-defaults";

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
          : "border-transparent text-[var(--text-muted)] hover:border-border hover:text-[var(--text-primary)]"
      }`}
    >
      {icon} {children}
    </button>
  );
}

export default function WebsiteCMS() {
  const [activeTab, setActiveTab] = useState<CmsPageKey>("home");
  const [bundle, setBundle] = useState<CmsBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaveOk(false);
    try {
      const res = await fetch("/api/super-admin/cms", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to load CMS");
        setBundle(null);
        return;
      }
      setBundle(json.data.pages as CmsBundle);
    } catch {
      setError("Network error — could not load CMS.");
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveTab = useCallback(async () => {
    if (!bundle) return;
    setSaving(true);
    setError(null);
    setSaveOk(false);
    const pageKey = activeTab;
    let payload: unknown;
    if (pageKey === "home") payload = bundle.home;
    else if (pageKey === "about") payload = bundle.about;
    else if (pageKey === "contact") payload = bundle.contact;
    else payload = bundle.settings;

    try {
      const res = await fetch("/api/super-admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey, payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Save failed");
        return;
      }
      setBundle(json.data.pages as CmsBundle);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 4000);
    } catch {
      setError("Network error — save not applied.");
    } finally {
      setSaving(false);
    }
  }, [activeTab, bundle]);

  if (loading && !bundle) {
    return (
      <div className="flex max-w-5xl flex-col items-center justify-center gap-3 py-24 text-[var(--text-muted)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading website CMS…</p>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="max-w-5xl space-y-4">
        <h1 className="text-display-xs font-bold tracking-tight text-[var(--text-primary)]">Website CMS</h1>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No content loaded.</p>
        )}
        <Button type="button" variant="outline" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-display-xs font-bold tracking-tight text-[var(--text-primary)]">Website CMS</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage the public-facing Omkaarya website copy. Each tab saves independently to the database.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}
      {saveOk ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Changes saved for this tab.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-px">
        <TabButton active={activeTab === "home"} onClick={() => setActiveTab("home")} icon={<LayoutTemplate className="h-4 w-4" />}>
          Home Page
        </TabButton>
        <TabButton active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Users className="h-4 w-4" />}>
          About Page
        </TabButton>
        <TabButton active={activeTab === "contact"} onClick={() => setActiveTab("contact")} icon={<MessageSquare className="h-4 w-4" />}>
          Contact Page
        </TabButton>
        <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings className="h-4 w-4" />}>
          Global SEO & Settings
        </TabButton>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {activeTab === "home" && (
          <HomePageEditor
            value={bundle.home}
            onChange={(home) => setBundle((b) => (b ? { ...b, home } : b))}
            onSave={() => void saveTab()}
            saving={saving}
          />
        )}
        {activeTab === "about" && (
          <SimplePageEditor
            title="About Page"
            value={bundle.about}
            onChange={(about) => setBundle((b) => (b ? { ...b, about } : b))}
            onSave={() => void saveTab()}
            saving={saving}
          />
        )}
        {activeTab === "contact" && (
          <SimplePageEditor
            title="Contact Page"
            value={bundle.contact}
            onChange={(contact) => setBundle((b) => (b ? { ...b, contact } : b))}
            onSave={() => void saveTab()}
            saving={saving}
          />
        )}
        {activeTab === "settings" && (
          <SettingsEditor
            value={bundle.settings}
            onChange={(settings) => setBundle((b) => (b ? { ...b, settings } : b))}
            onSave={() => void saveTab()}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

function HomePageEditor({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: CmsHomePayload;
  onChange: (v: CmsHomePayload) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const setField = <K extends keyof CmsHomePayload>(key: K, v: CmsHomePayload[K]) => {
    onChange({ ...value, [key]: v });
  };

  const setFeature = (index: number, patch: Partial<CmsHomeFeature>) => {
    const features = value.features.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange({ ...value, features });
  };

  const addFeature = () => {
    onChange({
      ...value,
      features: [...value.features, { title: "New feature", desc: "Short description." }],
    });
  };

  const removeFeature = (index: number) => {
    onChange({
      ...value,
      features: value.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Home Page Content</h2>
          <p className="text-sm text-text-tertiary">Edit the hero section and features grid.</p>
        </div>
        <Button
          type="button"
          variant="primary"
          leadingIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          onClick={onSave}
          disabled={saving}
        >
          Publish changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="border-b border-border pb-2 font-medium text-text-primary">Hero Section</h3>

          <div className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Headline</label>
              <Input value={value.headline} onChange={(e) => setField("headline", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Subheadline</label>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-shadow focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                value={value.subheadline}
                onChange={(e) => setField("subheadline", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Primary CTA Text</label>
                <Input value={value.primaryCtaText} onChange={(e) => setField("primaryCtaText", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Primary CTA Link</label>
                <Input value={value.primaryCtaLink} onChange={(e) => setField("primaryCtaLink", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-medium text-text-primary">Bento Grid Features</h3>
            <Button type="button" variant="outline" size="sm" leadingIcon={<Plus className="h-3 w-3" />} onClick={addFeature}>
              Add feature
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            {value.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-subtle p-3">
                <div className="flex-1 space-y-2">
                  <Input value={feature.title} onChange={(e) => setFeature(i, { title: e.target.value })} />
                  <textarea
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-500"
                    value={feature.desc}
                    onChange={(e) => setFeature(i, { desc: e.target.value })}
                    rows={2}
                  />
                </div>
                <button
                  type="button"
                  className="p-1 text-text-tertiary hover:text-red-500"
                  onClick={() => removeFeature(i)}
                  aria-label="Remove feature"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimplePageEditor({
  title,
  value,
  onChange,
  onSave,
  saving,
}: {
  title: string;
  value: CmsSimplePagePayload;
  onChange: (v: CmsSimplePagePayload) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <Button
          type="button"
          variant="primary"
          leadingIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          onClick={onSave}
          disabled={saving}
        >
          Publish changes
        </Button>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Page title</label>
        <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Body (plain text or HTML)</label>
        <textarea
          className="min-h-[200px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          value={value.body}
          onChange={(e) => onChange({ ...value, body: e.target.value })}
        />
      </div>
    </div>
  );
}

function SettingsEditor({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: CmsSettingsPayload;
  onChange: (v: CmsSettingsPayload) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Global SEO & Settings</h2>
          <p className="text-sm text-text-tertiary">Site-wide defaults for metadata.</p>
        </div>
        <Button
          type="button"
          variant="primary"
          leadingIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          onClick={onSave}
          disabled={saving}
        >
          Publish changes
        </Button>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Site title</label>
        <Input value={value.siteTitle} onChange={(e) => onChange({ ...value, siteTitle: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Meta description</label>
        <textarea
          className="min-h-[120px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          value={value.metaDescription}
          onChange={(e) => onChange({ ...value, metaDescription: e.target.value })}
        />
      </div>
    </div>
  );
}
